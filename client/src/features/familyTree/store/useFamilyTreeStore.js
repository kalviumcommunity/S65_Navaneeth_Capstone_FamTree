// client/src/features/familyTree/store/useFamilyTreeStore.js

import { create } from 'zustand'
import { nanoid } from 'nanoid'
import {
  createMember as apiCreateMember,
  deleteMember as apiDeleteMember,
  fetchMembers as apiFetchMembers,
  updateMember as apiUpdateMember,
} from '../../../services/memberService'
import { layoutTree } from '../layout/layoutTree'

function uniq(arr) {
  return [...new Set((arr || []).filter(Boolean))]
}

function oppositeGender(gender) {
  if (gender === 'Male') return 'Female'
  if (gender === 'Female') return 'Male'
  return 'Other'
}

function parseDateInput(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function toISODateOrNull(value) {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  if (!d || Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function normalizeMember(raw) {
  return {
    _id: String(raw._id),
    name: raw.name || 'Unknown',
    gender: raw.gender || 'Other',
    avatar: raw.avatar || '',
    dateOfBirth: raw.dateOfBirth || null,
    dateOfDeath: raw.dateOfDeath || null,
    notes: raw.notes || '',
    familyBranch: raw.familyBranch || '',
    relationshipTags: Array.isArray(raw.relationshipTags) ? raw.relationshipTags : [],
    parents: uniq(raw.parents),
    spouses: uniq(raw.spouses),
    children: uniq(raw.children),
    isPlaceholder: Boolean(raw.isPlaceholder),
    position: {
      x: Number(raw.position?.x || 0),
      y: Number(raw.position?.y || 0),
    },
  }
}

function buildEdges(membersById, visibleIds) {
  const edges = []
  const visible = new Set(visibleIds)

  // spouse edges (dedupe)
  const spouseSeen = new Set()
  for (const id of visibleIds) {
    const m = membersById[id]
    if (!m) continue
    for (const spouseId of m.spouses || []) {
      if (!visible.has(spouseId)) continue
      const key = [id, spouseId].sort().join('::')
      if (spouseSeen.has(key)) continue
      spouseSeen.add(key)
      edges.push({
        id: `spouse:${key}`,
        source: id,
        target: spouseId,
        type: 'spouseEdge',
        data: { kind: 'spouse' },
      })
    }
  }

  // parent-child edges
  const pcSeen = new Set()
  for (const id of visibleIds) {
    const child = membersById[id]
    if (!child) continue
    for (const parentId of child.parents || []) {
      if (!visible.has(parentId)) continue
      const key = `${parentId}->${id}`
      if (pcSeen.has(key)) continue
      pcSeen.add(key)
      edges.push({
        id: `pc:${key}`,
        source: parentId,
        target: id,
        type: 'parentChildEdge',
        data: { kind: 'parentChild' },
      })
    }
  }

  return edges
}

function computeVisibleIds(membersById, collapsedIds) {
  const ids = Object.keys(membersById)
  if (!collapsedIds || collapsedIds.size === 0) return ids

  const hidden = new Set()

  function hideDescendants(rootId) {
    const root = membersById[rootId]
    if (!root) return
    for (const childId of root.children || []) {
      if (hidden.has(childId)) continue
      hidden.add(childId)
      hideDescendants(childId)
    }
  }

  for (const id of collapsedIds) {
    hideDescendants(id)
  }

  return ids.filter((id) => !hidden.has(id))
}

async function updateMany(mutations) {
  // Sequential updates keeps it simple & debuggable.
  // mutations: [{ id, payload }]
  for (const m of mutations) {
    await apiUpdateMember(m.id, m.payload)
  }
}

export const useFamilyTreeStore = create((set, get) => ({
  loading: false,
  error: '',

  // members
  membersById: {},

  // UI
  modalOpen: false,
  modalMemberId: null,

  radialOpenForId: null,
  linkModal: { open: false, sourceId: null, kind: 'spouse' },
  unlinkModal: { open: false, sourceId: null },

  collapsedIds: new Set(),

  starterNodeNonce: nanoid(),

  async load() {
    set({ loading: true, error: '' })
    try {
      const result = await apiFetchMembers()
      const data = result.data || []
      const byId = {}
      for (const raw of data) {
        const m = normalizeMember(raw)
        byId[m._id] = m
      }
      set({ membersById: byId })
    } catch (err) {
      set({ error: err?.response?.data?.message || 'Failed to load family tree' })
    } finally {
      set({ loading: false })
    }
  },

  getDerived() {
    const { membersById, collapsedIds } = get()
    const visibleIds = computeVisibleIds(membersById, collapsedIds)

    const positions = layoutTree(membersById)

    const nodes = visibleIds.map((id) => {
      const m = membersById[id]
      const pos = positions[id] || m.position || { x: 0, y: 0 }
      return {
        id,
        type: 'genealogyNode',
        position: { x: pos.x, y: pos.y },
        draggable: true,
        data: { memberId: id },
      }
    })

    const edges = buildEdges(membersById, visibleIds)

    return { nodes, edges, visibleIds }
  },

  openMemberModal(memberId) {
    set({ modalOpen: true, modalMemberId: memberId, radialOpenForId: null })
  },

  closeMemberModal() {
    set({ modalOpen: false, modalMemberId: null })
  },

  toggleRadial(memberId) {
    set((s) => ({ radialOpenForId: s.radialOpenForId === memberId ? null : memberId }))
  },

  closeRadial() {
    set({ radialOpenForId: null })
  },

  openLinkModal(sourceId, kind) {
    set({ linkModal: { open: true, sourceId, kind }, radialOpenForId: null })
  },

  closeLinkModal() {
    set({ linkModal: { open: false, sourceId: null, kind: 'spouse' } })
  },

  openUnlinkModal(sourceId) {
    set({ unlinkModal: { open: true, sourceId }, radialOpenForId: null })
  },

  closeUnlinkModal() {
    set({ unlinkModal: { open: false, sourceId: null } })
  },

  toggleCollapse(memberId) {
    set((s) => {
      const next = new Set(s.collapsedIds)
      if (next.has(memberId)) next.delete(memberId)
      else next.add(memberId)
      return { collapsedIds: next }
    })
  },

  async createFirstMember(payload) {
    // payload: { name, gender, ... }
    set({ loading: true, error: '' })
    try {
      const created = await apiCreateMember({
        name: payload.name,
        gender: payload.gender,
        avatar: payload.avatar || '',
        dateOfBirth: toISODateOrNull(parseDateInput(payload.dateOfBirth)),
        dateOfDeath: toISODateOrNull(parseDateInput(payload.dateOfDeath)),
        notes: payload.notes || '',
        familyBranch: payload.familyBranch || '',
        relationshipTags: payload.relationshipTags || [],
        isPlaceholder: false,
      })

      const m = normalizeMember(created.data)
      set((s) => ({
        membersById: { ...s.membersById, [m._id]: m },
        modalOpen: false,
        modalMemberId: null,
        radialOpenForId: m._id,
        starterNodeNonce: nanoid(),
      }))

      return m
    } catch (err) {
      set({ error: err?.response?.data?.message || 'Failed to create member' })
      return null
    } finally {
      set({ loading: false })
    }
  },

  async saveMemberEdits(memberId, payload) {
    set({ loading: true, error: '' })
    try {
      const updated = await apiUpdateMember(memberId, {
        name: payload.name,
        gender: payload.gender,
        avatar: payload.avatar || '',
        dateOfBirth: toISODateOrNull(parseDateInput(payload.dateOfBirth)),
        dateOfDeath: toISODateOrNull(parseDateInput(payload.dateOfDeath)),
        notes: payload.notes || '',
        familyBranch: payload.familyBranch || '',
        relationshipTags: payload.relationshipTags || [],
        isPlaceholder: false,
      })
      const m = normalizeMember(updated.data)
      set((s) => ({
        membersById: { ...s.membersById, [m._id]: { ...s.membersById[m._id], ...m } },
        modalOpen: false,
        modalMemberId: null,
      }))
      return m
    } catch (err) {
      set({ error: err?.response?.data?.message || 'Failed to save member' })
      return null
    } finally {
      set({ loading: false })
    }
  },

  async addParents(memberId) {
    const { membersById } = get()
    const m = membersById[memberId]
    if (!m) return

    // If already has 2 parents, just open unlink modal.
    if ((m.parents || []).length >= 2) {
      get().openUnlinkModal(memberId)
      return
    }

    set({ loading: true, error: '' })

    try {
      const fatherRes = await apiCreateMember({
        name: 'Unknown',
        gender: 'Male',
        isPlaceholder: true,
      })
      const motherRes = await apiCreateMember({
        name: 'Unknown',
        gender: 'Female',
        isPlaceholder: true,
      })

      const father = normalizeMember(fatherRes.data)
      const mother = normalizeMember(motherRes.data)

      // Link father <-> mother as spouses, and both -> child.
      const nextChildParents = uniq([...(m.parents || []), father._id, mother._id]).slice(0, 2)

      await updateMany([
        { id: father._id, payload: { spouses: uniq([...(father.spouses || []), mother._id]), children: uniq([...(father.children || []), memberId]) } },
        { id: mother._id, payload: { spouses: uniq([...(mother.spouses || []), father._id]), children: uniq([...(mother.children || []), memberId]) } },
        { id: memberId, payload: { parents: nextChildParents } },
      ])

      // Reload affected from local state, then patch.
      set((s) => {
        const merged = { ...s.membersById }
        merged[father._id] = { ...father, spouses: uniq([mother._id]), children: uniq([memberId]) }
        merged[mother._id] = { ...mother, spouses: uniq([father._id]), children: uniq([memberId]) }
        merged[memberId] = { ...s.membersById[memberId], parents: nextChildParents }
        return { membersById: merged, radialOpenForId: null }
      })
    } catch (err) {
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
      const spouseRes = await apiCreateMember({
        name: 'Unknown',
        gender: oppositeGender(m.gender),
        isPlaceholder: true,
      })

      const spouse = normalizeMember(spouseRes.data)
      const nextA = uniq([...(m.spouses || []), spouse._id])
      const nextB = uniq([...(spouse.spouses || []), memberId])

      await updateMany([
        { id: memberId, payload: { spouses: nextA } },
        { id: spouse._id, payload: { spouses: nextB } },
      ])

      set((s) => ({
        membersById: {
          ...s.membersById,
          [memberId]: { ...s.membersById[memberId], spouses: nextA },
          [spouse._id]: { ...spouse, spouses: nextB },
        },
        radialOpenForId: null,
      }))
    } catch (err) {
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

      // If no spouse: auto-create one.
      if (!spouseId) {
        const spouseRes = await apiCreateMember({
          name: 'Unknown',
          gender: oppositeGender(m.gender),
          isPlaceholder: true,
        })
        const spouse = normalizeMember(spouseRes.data)
        spouseId = spouse._id

        const nextA = uniq([...(m.spouses || []), spouseId])
        const nextB = uniq([memberId])

        await updateMany([
          { id: memberId, payload: { spouses: nextA } },
          { id: spouseId, payload: { spouses: nextB } },
        ])

        set((s) => ({
          membersById: {
            ...s.membersById,
            [memberId]: { ...s.membersById[memberId], spouses: nextA },
            [spouseId]: { ...spouse, spouses: nextB },
          },
        }))
      }

      // Create child
      const childRes = await apiCreateMember({
        name: 'Unknown',
        gender: 'Other',
        isPlaceholder: true,
      })
      const child = normalizeMember(childRes.data)

      const nextChildParents = uniq([memberId, spouseId]).slice(0, 2)

      const parentA = get().membersById[memberId]
      const parentB = get().membersById[spouseId]

      const nextChildrenA = uniq([...(parentA.children || []), child._id])
      const nextChildrenB = uniq([...(parentB.children || []), child._id])

      await updateMany([
        { id: child._id, payload: { parents: nextChildParents } },
        { id: memberId, payload: { children: nextChildrenA } },
        { id: spouseId, payload: { children: nextChildrenB } },
      ])

      set((s) => ({
        membersById: {
          ...s.membersById,
          [child._id]: { ...child, parents: nextChildParents },
          [memberId]: { ...s.membersById[memberId], children: nextChildrenA },
          [spouseId]: { ...s.membersById[spouseId], children: nextChildrenB },
        },
        radialOpenForId: null,
      }))
    } catch (err) {
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
        // Local unlink best-effort.
        for (const id of Object.keys(next)) {
          const m = next[id]
          next[id] = {
            ...m,
            parents: (m.parents || []).filter((x) => x !== memberId),
            spouses: (m.spouses || []).filter((x) => x !== memberId),
            children: (m.children || []).filter((x) => x !== memberId),
          }
        }
        return { membersById: next, radialOpenForId: null }
      })
    } catch (err) {
      set({ error: err?.response?.data?.message || 'Failed to delete member' })
    } finally {
      set({ loading: false })
    }
  },

  async linkExisting({ sourceId, targetId, kind }) {
    const { membersById } = get()
    const a = membersById[sourceId]
    const b = membersById[targetId]
    if (!a || !b) return

    set({ loading: true, error: '' })

    try {
      if (kind === 'spouse') {
        const nextA = uniq([...(a.spouses || []), targetId])
        const nextB = uniq([...(b.spouses || []), sourceId])
        await updateMany([
          { id: sourceId, payload: { spouses: nextA } },
          { id: targetId, payload: { spouses: nextB } },
        ])
        set((s) => ({
          membersById: {
            ...s.membersById,
            [sourceId]: { ...s.membersById[sourceId], spouses: nextA },
            [targetId]: { ...s.membersById[targetId], spouses: nextB },
          },
        }))
      }

      if (kind === 'parent') {
        const nextChildParents = uniq([...(a.parents || []), targetId]).slice(0, 2)
        const nextParentChildren = uniq([...(b.children || []), sourceId])
        await updateMany([
          { id: sourceId, payload: { parents: nextChildParents } },
          { id: targetId, payload: { children: nextParentChildren } },
        ])
        set((s) => ({
          membersById: {
            ...s.membersById,
            [sourceId]: { ...s.membersById[sourceId], parents: nextChildParents },
            [targetId]: { ...s.membersById[targetId], children: nextParentChildren },
          },
        }))
      }

      if (kind === 'child') {
        const nextParentChildren = uniq([...(a.children || []), targetId])
        const nextChildParents = uniq([...(b.parents || []), sourceId]).slice(0, 2)
        await updateMany([
          { id: sourceId, payload: { children: nextParentChildren } },
          { id: targetId, payload: { parents: nextChildParents } },
        ])
        set((s) => ({
          membersById: {
            ...s.membersById,
            [sourceId]: { ...s.membersById[sourceId], children: nextParentChildren },
            [targetId]: { ...s.membersById[targetId], parents: nextChildParents },
          },
        }))
      }

      set({ linkModal: { open: false, sourceId: null, kind: 'spouse' } })
    } catch (err) {
      set({ error: err?.response?.data?.message || 'Failed to link member' })
    } finally {
      set({ loading: false })
    }
  },

  async unlinkRelationship({ sourceId, targetId, kind }) {
    const { membersById } = get()
    const a = membersById[sourceId]
    const b = membersById[targetId]
    if (!a || !b) return

    set({ loading: true, error: '' })

    try {
      if (kind === 'spouse') {
        const nextA = (a.spouses || []).filter((x) => x !== targetId)
        const nextB = (b.spouses || []).filter((x) => x !== sourceId)
        await updateMany([
          { id: sourceId, payload: { spouses: nextA } },
          { id: targetId, payload: { spouses: nextB } },
        ])
        set((s) => ({
          membersById: {
            ...s.membersById,
            [sourceId]: { ...s.membersById[sourceId], spouses: nextA },
            [targetId]: { ...s.membersById[targetId], spouses: nextB },
          },
        }))
      }

      if (kind === 'parent') {
        const nextChildParents = (a.parents || []).filter((x) => x !== targetId)
        const nextParentChildren = (b.children || []).filter((x) => x !== sourceId)
        await updateMany([
          { id: sourceId, payload: { parents: nextChildParents } },
          { id: targetId, payload: { children: nextParentChildren } },
        ])
        set((s) => ({
          membersById: {
            ...s.membersById,
            [sourceId]: { ...s.membersById[sourceId], parents: nextChildParents },
            [targetId]: { ...s.membersById[targetId], children: nextParentChildren },
          },
        }))
      }

      if (kind === 'child') {
        const nextParentChildren = (a.children || []).filter((x) => x !== targetId)
        const nextChildParents = (b.parents || []).filter((x) => x !== sourceId)
        await updateMany([
          { id: sourceId, payload: { children: nextParentChildren } },
          { id: targetId, payload: { parents: nextChildParents } },
        ])
        set((s) => ({
          membersById: {
            ...s.membersById,
            [sourceId]: { ...s.membersById[sourceId], children: nextParentChildren },
            [targetId]: { ...s.membersById[targetId], parents: nextChildParents },
          },
        }))
      }

      set({ unlinkModal: { open: false, sourceId: null } })
    } catch (err) {
      set({ error: err?.response?.data?.message || 'Failed to unlink relationship' })
    } finally {
      set({ loading: false })
    }
  },
}))
