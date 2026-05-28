import { create } from 'zustand'
import type { Edge, Node } from 'reactflow'
import { nanoid } from 'nanoid'

import {
  createMember as apiCreateMember,
  deleteMember as apiDeleteMember,
  fetchMembers as apiFetchMembers,
  updateMember as apiUpdateMember,
} from '../../../services/memberService'

import type { Gender, MemberId, MemberPatch, TreeMember, TreeNodeData } from '../types'

const STARTER_NODE_ID = '__STARTER__'
const FIRST_MEMBER_SENTINEL = '__FIRST__'

const X_SPACING = 260
const CHILD_SPACING = 220
const Y_PARENT = -220
const Y_LEVEL = 0
const Y_CHILD = 240

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr.filter(Boolean) as T[])]
}

function oppositeGender(gender: Gender): Gender {
  if (gender === 'Male') return 'Female'
  if (gender === 'Female') return 'Male'
  return 'Other'
}

function safeIsoOrNull(value: unknown): string | null {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value instanceof Date ? value : null
  if (!d || Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function normalizeMember(raw: any): TreeMember {
  return {
    _id: String(raw._id),
    name: raw.name || 'Unknown',
    gender: (raw.gender as Gender) || 'Other',
    avatar: raw.avatar || '',
    dateOfBirth: raw.dateOfBirth ? String(raw.dateOfBirth) : null,
    dateOfDeath: raw.dateOfDeath ? String(raw.dateOfDeath) : null,
    notes: raw.notes || '',
    familyBranch: raw.familyBranch || '',
    relationshipTags: Array.isArray(raw.relationshipTags) ? raw.relationshipTags : [],
    parents: uniq((raw.parents || []).map(String)),
    spouses: uniq((raw.spouses || []).map(String)),
    children: uniq((raw.children || []).map(String)),
    isPlaceholder: Boolean(raw.isPlaceholder) || raw.name === 'Unknown',
  }
}

function buildSiblingIds(membersById: Record<MemberId, TreeMember>, focus: TreeMember): MemberId[] {
  const p = new Set(focus.parents || [])
  if (p.size === 0) return []
  const siblings: MemberId[] = []
  for (const m of Object.values(membersById)) {
    if (m._id === focus._id) continue
    if (!m.parents || m.parents.length === 0) continue
    if (m.parents.some((id) => p.has(id))) siblings.push(m._id)
  }
  // Stable order by name
  siblings.sort((a, b) => String(membersById[a]?.name || '').localeCompare(String(membersById[b]?.name || '')))
  return siblings
}

function buildChildrenIds(membersById: Record<MemberId, TreeMember>, focusId: MemberId): MemberId[] {
  const children: MemberId[] = []
  for (const m of Object.values(membersById)) {
    if (m.parents?.includes(focusId)) children.push(m._id)
  }
  // Stable order by DOB then name
  children.sort((a, b) => {
    const da = membersById[a]?.dateOfBirth || ''
    const db = membersById[b]?.dateOfBirth || ''
    if (da !== db) return da.localeCompare(db)
    return String(membersById[a]?.name || '').localeCompare(String(membersById[b]?.name || ''))
  })
  return children
}

function computeFocusGraph(params: {
  membersById: Record<MemberId, TreeMember>
  focusId: MemberId
}): { nodes: Node<TreeNodeData>[]; edges: Edge[] } {
  const { membersById, focusId } = params
  const focus = membersById[focusId]
  if (!focus) {
    return {
      nodes: [
        {
          id: STARTER_NODE_ID,
          type: 'placeholderNode',
          position: { x: 0, y: 0 },
          draggable: false,
          data: { kind: 'starter' },
        },
      ],
      edges: [],
    }
  }

  const spouseIds = uniq((focus.spouses || []).filter((id) => membersById[id]))
  const parentIds = uniq((focus.parents || []).filter((id) => membersById[id])).slice(0, 2)
  const siblingIds = buildSiblingIds(membersById, focus)
  const childIds = buildChildrenIds(membersById, focusId)

  const visibleIds = new Set<MemberId>([focusId, ...spouseIds, ...parentIds, ...siblingIds, ...childIds])

  const pos: Record<MemberId, { x: number; y: number }> = {}
  pos[focusId] = { x: 0, y: 0 }

  // Spouses: always to the right of focus, spaced.
  spouseIds.forEach((id, i) => {
    pos[id] = { x: X_SPACING * (i + 1), y: Y_LEVEL }
  })

  // Siblings: to the left of focus, spaced.
  siblingIds.forEach((id, i) => {
    pos[id] = { x: -X_SPACING * (i + 1), y: Y_LEVEL }
  })

  // Parents: above focus. Prefer male on left, female on right.
  if (parentIds.length === 1) {
    pos[parentIds[0]] = { x: 0, y: Y_PARENT }
  }
  if (parentIds.length === 2) {
    const a = membersById[parentIds[0]]
    const b = membersById[parentIds[1]]
    const left = a.gender === 'Male' || b.gender === 'Female' ? a._id : b._id
    const right = left === a._id ? b._id : a._id
    pos[left] = { x: -200, y: Y_PARENT }
    pos[right] = { x: 200, y: Y_PARENT }
  }

  // Children: group by spouse-couple when possible.
  type GroupKey = string
  const groups = new Map<GroupKey, MemberId[]>()
  for (const childId of childIds) {
    const child = membersById[childId]
    const coParent = (child.parents || []).find((p) => p !== focusId && spouseIds.includes(p))
    const key = coParent ? `couple:${coParent}` : 'solo'
    const list = groups.get(key) || []
    list.push(childId)
    groups.set(key, list)
  }

  for (const [key, ids] of groups.entries()) {
    let anchorX = 0
    if (key.startsWith('couple:')) {
      const spouseId = key.slice('couple:'.length)
      anchorX = (pos[focusId].x + (pos[spouseId]?.x ?? 0)) / 2
    }

    const total = ids.length
    const startX = anchorX - ((total - 1) / 2) * CHILD_SPACING

    ids.forEach((childId, idx) => {
      pos[childId] = { x: startX + idx * CHILD_SPACING, y: Y_CHILD }
    })
  }

  const nodes: Node<TreeNodeData>[] = []
  for (const id of visibleIds) {
    const m = membersById[id]
    const isFocus = id === focusId
    const type = m.isPlaceholder || m.name === 'Unknown' ? 'placeholderNode' : 'memberNode'
    nodes.push({
      id,
      type,
      position: pos[id] || { x: 0, y: 0 },
      draggable: false,
      data: {
        kind: type === 'memberNode' ? 'member' : 'placeholder',
        memberId: id,
        isFocus,
      } as any,
    })
  }

  const edges: Edge[] = []
  const edgeSeen = new Set<string>()

  // spouse edges: focus <-> spouses (only)
  for (const spouseId of spouseIds) {
    const key = [focusId, spouseId].sort().join('::')
    if (edgeSeen.has(key)) continue
    edgeSeen.add(key)
    edges.push({
      id: `spouse:${key}`,
      source: focusId,
      target: spouseId,
      type: 'spouseEdge',
      data: { kind: 'spouse' },
    })
  }

  // parent-child edges: from visible parents to visible children.
  const visible = new Set([...visibleIds])
  for (const childId of visibleIds) {
    const child = membersById[childId]
    if (!child) continue
    for (const parentId of child.parents || []) {
      if (!visible.has(parentId)) continue
      const key = `${parentId}->${childId}`
      if (edgeSeen.has(key)) continue
      edgeSeen.add(key)
      edges.push({
        id: `pc:${key}`,
        source: parentId,
        target: childId,
        type: 'parentChildEdge',
        data: { kind: 'parentChild' },
      })
    }
  }

  // parent couple spouse edge if both parents are present and linked.
  if (parentIds.length === 2) {
    const a = membersById[parentIds[0]]
    const b = membersById[parentIds[1]]
    const linked = a.spouses?.includes(b._id) || b.spouses?.includes(a._id)
    if (linked) {
      const key = [a._id, b._id].sort().join('::')
      if (!edgeSeen.has(key)) {
        edgeSeen.add(key)
        edges.push({
          id: `spouse:${key}`,
          source: a._id,
          target: b._id,
          type: 'spouseEdge',
          data: { kind: 'spouse' },
        })
      }
    }
  }

  return { nodes, edges }
}

type EditModalState = {
  open: boolean
  memberId: MemberId | null
}

type TreeState = {
  loading: boolean
  error: string

  membersById: Record<MemberId, TreeMember>
  activeFocusId: MemberId | null

  nodes: Node<TreeNodeData>[]
  edges: Edge[]

  radialOpenForId: MemberId | null
  editModal: EditModalState

  starterNonce: string

  load(): Promise<void>
  recompute(): void
  selectNode(id: MemberId): void
  shiftFocus(id: MemberId): void

  openRadial(id: MemberId): void
  closeRadial(): void

  openEdit(memberId: MemberId | typeof FIRST_MEMBER_SENTINEL): void
  closeEdit(): void

  saveMember(memberId: MemberId | typeof FIRST_MEMBER_SENTINEL, patch: MemberPatch & { dateOfBirth?: any; dateOfDeath?: any }): Promise<void>

  addParents(memberId: MemberId): Promise<void>
  addSpouse(memberId: MemberId): Promise<void>
  addChild(memberId: MemberId): Promise<void>
  deleteMember(memberId: MemberId): Promise<void>
}

export const useTreeStore = create<TreeState>((set, get) => ({
  loading: false,
  error: '',

  membersById: {},
  activeFocusId: null,

  nodes: [
    {
      id: STARTER_NODE_ID,
      type: 'placeholderNode',
      position: { x: 0, y: 0 },
      draggable: false,
      data: { kind: 'starter' },
    },
  ],
  edges: [],

  radialOpenForId: null,
  editModal: { open: false, memberId: null },

  starterNonce: nanoid(),

  async load() {
    set({ loading: true, error: '' })
    try {
      const result = await apiFetchMembers()
      const data = result.data || []
      const byId: Record<MemberId, TreeMember> = {}
      for (const raw of data) {
        const m = normalizeMember(raw)
        byId[m._id] = m
      }

      const nextFocus = get().activeFocusId && byId[get().activeFocusId!] ? get().activeFocusId : Object.keys(byId)[0] || null

      set({ membersById: byId, activeFocusId: nextFocus })
      get().recompute()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to load family tree' })
    } finally {
      set({ loading: false })
    }
  },

  recompute() {
    const { membersById, activeFocusId } = get()

    if (!activeFocusId || Object.keys(membersById).length === 0) {
      set({
        nodes: [
          {
            id: `${STARTER_NODE_ID}:${get().starterNonce}`,
            type: 'placeholderNode',
            position: { x: 0, y: 0 },
            draggable: false,
            data: { kind: 'starter' },
          },
        ],
        edges: [],
      })
      return
    }

    const graph = computeFocusGraph({ membersById, focusId: activeFocusId })
    set({ nodes: graph.nodes, edges: graph.edges })
  },

  selectNode(id) {
    const { activeFocusId, radialOpenForId } = get()
    const focusChanged = activeFocusId !== id
    const nextRadial = focusChanged ? id : radialOpenForId === id ? null : id

    set({ activeFocusId: id, radialOpenForId: nextRadial })
    if (focusChanged) get().recompute()
  },

  shiftFocus(id) {
    set({ activeFocusId: id, radialOpenForId: id })
    get().recompute()
  },

  openRadial(id) {
    set((s) => ({ radialOpenForId: s.radialOpenForId === id ? null : id }))
  },

  closeRadial() {
    set({ radialOpenForId: null })
  },

  openEdit(memberId) {
    set({ editModal: { open: true, memberId: memberId as any }, radialOpenForId: null })
  },

  closeEdit() {
    set({ editModal: { open: false, memberId: null } })
  },

  async saveMember(memberId, patch) {
    set({ loading: true, error: '' })
    try {
      const payload: any = {
        ...patch,
        dateOfBirth: safeIsoOrNull((patch as any).dateOfBirth),
        dateOfDeath: safeIsoOrNull((patch as any).dateOfDeath),
        isPlaceholder: false,
      }

      if (memberId === FIRST_MEMBER_SENTINEL) {
        const created = await apiCreateMember({
          name: payload.name || 'Unknown',
          gender: payload.gender || 'Other',
          avatar: payload.avatar || '',
          dateOfBirth: payload.dateOfBirth || null,
          dateOfDeath: payload.dateOfDeath || null,
          notes: payload.notes || '',
          familyBranch: payload.familyBranch || '',
          relationshipTags: payload.relationshipTags || [],
          isPlaceholder: false,
        })

        const m = normalizeMember(created.data)
        set((s) => ({
          membersById: { ...s.membersById, [m._id]: m },
          activeFocusId: m._id,
          editModal: { open: false, memberId: null },
          starterNonce: nanoid(),
        }))
        get().recompute()
        return
      }

      const updated = await apiUpdateMember(memberId as string, payload)
      const m = normalizeMember(updated.data)
      set((s) => ({
        membersById: { ...s.membersById, [m._id]: { ...s.membersById[m._id], ...m } },
        editModal: { open: false, memberId: null },
      }))
      get().recompute()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to save member' })
    } finally {
      set({ loading: false })
    }
  },

  async addParents(memberId) {
    const { membersById } = get()
    const m = membersById[memberId]
    if (!m) return
    if ((m.parents || []).length >= 2) return

    set({ loading: true, error: '' })
    try {
      const fatherRes = await apiCreateMember({ name: 'Unknown', gender: 'Male', isPlaceholder: true })
      const motherRes = await apiCreateMember({ name: 'Unknown', gender: 'Female', isPlaceholder: true })
      const father = normalizeMember(fatherRes.data)
      const mother = normalizeMember(motherRes.data)

      const nextParents = uniq([...(m.parents || []), father._id, mother._id]).slice(0, 2)

      await apiUpdateMember(father._id, {
        spouses: uniq([...(father.spouses || []), mother._id]),
        children: uniq([...(father.children || []), memberId]),
      })
      await apiUpdateMember(mother._id, {
        spouses: uniq([...(mother.spouses || []), father._id]),
        children: uniq([...(mother.children || []), memberId]),
      })
      await apiUpdateMember(memberId, { parents: nextParents })

      set((s) => ({
        membersById: {
          ...s.membersById,
          [father._id]: { ...father, spouses: uniq([mother._id]), children: uniq([memberId]) },
          [mother._id]: { ...mother, spouses: uniq([father._id]), children: uniq([memberId]) },
          [memberId]: { ...s.membersById[memberId], parents: nextParents },
        },
      }))
      get().recompute()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to add parents' })
    } finally {
      set({ loading: false })
    }
  },

  async addSpouse(memberId) {
    const { membersById } = get()
    const m = membersById[memberId]
    if (!m) return

    set({ loading: true, error: '' })
    try {
      const spouseRes = await apiCreateMember({ name: 'Unknown', gender: oppositeGender(m.gender), isPlaceholder: true })
      const spouse = normalizeMember(spouseRes.data)

      const nextA = uniq([...(m.spouses || []), spouse._id])
      const nextB = uniq([...(spouse.spouses || []), memberId])

      await apiUpdateMember(memberId, { spouses: nextA })
      await apiUpdateMember(spouse._id, { spouses: nextB })

      set((s) => ({
        membersById: {
          ...s.membersById,
          [memberId]: { ...s.membersById[memberId], spouses: nextA },
          [spouse._id]: { ...spouse, spouses: nextB },
        },
      }))
      get().recompute()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to add spouse' })
    } finally {
      set({ loading: false })
    }
  },

  async addChild(memberId) {
    const { membersById } = get()
    const m = membersById[memberId]
    if (!m) return

    set({ loading: true, error: '' })

    try {
      let spouseId = (m.spouses || []).find((id) => membersById[id])

      if (!spouseId) {
        const spouseRes = await apiCreateMember({ name: 'Unknown', gender: oppositeGender(m.gender), isPlaceholder: true })
        const spouse = normalizeMember(spouseRes.data)
        spouseId = spouse._id

        const nextA = uniq([...(m.spouses || []), spouseId])
        await apiUpdateMember(memberId, { spouses: nextA })
        await apiUpdateMember(spouseId, { spouses: uniq([memberId]) })

        set((s) => ({
          membersById: {
            ...s.membersById,
            [memberId]: { ...s.membersById[memberId], spouses: nextA },
            [spouseId]: { ...spouse, spouses: uniq([memberId]) },
          },
        }))
      }

      const childRes = await apiCreateMember({ name: 'Unknown', gender: 'Other', isPlaceholder: true })
      const child = normalizeMember(childRes.data)

      const nextChildParents = uniq([memberId, spouseId!]).slice(0, 2)

      const parentA = get().membersById[memberId]
      const parentB = get().membersById[spouseId!]

      const nextChildrenA = uniq([...(parentA.children || []), child._id])
      const nextChildrenB = uniq([...(parentB.children || []), child._id])

      await apiUpdateMember(child._id, { parents: nextChildParents })
      await apiUpdateMember(memberId, { children: nextChildrenA })
      await apiUpdateMember(spouseId!, { children: nextChildrenB })

      set((s) => ({
        membersById: {
          ...s.membersById,
          [child._id]: { ...child, parents: nextChildParents },
          [memberId]: { ...s.membersById[memberId], children: nextChildrenA },
          [spouseId!]: { ...s.membersById[spouseId!], children: nextChildrenB },
        },
      }))
      get().recompute()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to add child' })
    } finally {
      set({ loading: false })
    }
  },

  async deleteMember(memberId) {
    set({ loading: true, error: '' })
    try {
      await apiDeleteMember(memberId)
      set((s) => {
        const next = { ...s.membersById }
        delete next[memberId]
        for (const id of Object.keys(next)) {
          const m = next[id]
          next[id] = {
            ...m,
            parents: (m.parents || []).filter((x) => x !== memberId),
            spouses: (m.spouses || []).filter((x) => x !== memberId),
            children: (m.children || []).filter((x) => x !== memberId),
          }
        }

        const nextFocus = s.activeFocusId === memberId ? Object.keys(next)[0] || null : s.activeFocusId

        return {
          membersById: next,
          activeFocusId: nextFocus,
          radialOpenForId: null,
        }
      })
      get().recompute()
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to delete member' })
    } finally {
      set({ loading: false })
    }
  },
}))

export const TreeConstants = {
  STARTER_NODE_ID,
  FIRST_MEMBER_SENTINEL,
}
