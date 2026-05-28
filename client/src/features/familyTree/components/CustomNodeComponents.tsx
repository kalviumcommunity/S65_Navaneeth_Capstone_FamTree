import { memo, useMemo } from 'react'
import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'

import { useTreeStore, TreeConstants } from '../store/useTreeStore'
import type { TreeNodeData } from '../types'

function ringForGender(gender?: string) {
  if (gender === 'Male') return 'border-sky-200 bg-sky-50'
  if (gender === 'Female') return 'border-rose-200 bg-rose-50'
  return 'border-violet-200 bg-violet-50'
}

function fmtDate(value: string | null | undefined) {
  if (!value) return ''
  const s = String(value)
  return s.slice(0, 10)
}

function initials(name: string) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

type RadialMenuProps = {
  open: boolean
  onAddParents(): void
  onAddSpouse(): void
  onAddChild(): void
  onEdit(): void
  onDelete(): void
  onShiftFocus(): void
}

function RadialMenu(props: RadialMenuProps) {
  const { open } = props
  if (!open) return null

  const items = [
    { label: 'Add Parents', onClick: props.onAddParents, at: 'top' },
    { label: 'Add Spouse', onClick: props.onAddSpouse, at: 'right' },
    { label: 'Add Child', onClick: props.onAddChild, at: 'bottom' },
    { label: 'Edit', onClick: props.onEdit, at: 'left' },
    { label: 'Delete', onClick: props.onDelete, at: 'bottomLeft' },
    { label: 'Shift Focus', onClick: props.onShiftFocus, at: 'topLeft' },
  ] as const

  function pos(at: (typeof items)[number]['at']) {
    switch (at) {
      case 'top':
        return 'left-1/2 -translate-x-1/2 -translate-y-[88px]'
      case 'right':
        return 'top-1/2 -translate-y-1/2 translate-x-[92px]'
      case 'bottom':
        return 'left-1/2 -translate-x-1/2 translate-y-[88px]'
      case 'left':
        return 'top-1/2 -translate-y-1/2 -translate-x-[92px]'
      case 'topLeft':
        return '-translate-x-[70px] -translate-y-[70px]'
      case 'bottomLeft':
        return '-translate-x-[70px] translate-y-[70px]'
      default:
        return ''
    }
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 h-0 w-0">
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          onPointerDown={(e) => {
            // Prevent canvas pan/drag from capturing this gesture.
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
            it.onClick()
          }}
          className={
            "nopan nodrag pointer-events-auto absolute rounded-full border bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-50 " +
            pos(it.at)
          }
        >
          {it.label}
        </button>
      ))}

      <div className="pointer-events-none absolute -left-12 -top-12 h-24 w-24 rounded-full border border-emerald-200/70" />
    </div>
  )
}

export const MemberNode = memo(function MemberNode({ data }: NodeProps<TreeNodeData>) {
  const memberId = (data as any).memberId as string
  const isFocus = (data as any).isFocus as boolean

  const member = useTreeStore((s) => s.membersById[memberId])
  const radialOpenForId = useTreeStore((s) => s.radialOpenForId)

  const closeRadial = useTreeStore((s) => s.closeRadial)
  const selectNode = useTreeStore((s) => s.selectNode)
  const shiftFocus = useTreeStore((s) => s.shiftFocus)
  const openEdit = useTreeStore((s) => s.openEdit)
  const addParents = useTreeStore((s) => s.addParents)
  const addSpouse = useTreeStore((s) => s.addSpouse)
  const addChild = useTreeStore((s) => s.addChild)
  const deleteMember = useTreeStore((s) => s.deleteMember)

  const open = radialOpenForId === memberId

  const badge = useMemo(() => ringForGender(member?.gender), [member?.gender])

  if (!member) return null

  const dates = [fmtDate(member.dateOfBirth), fmtDate(member.dateOfDeath)].filter(Boolean).join(' – ')

  return (
    <div className="relative" onMouseLeave={() => open && closeRadial()}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />

      <button
        type="button"
        onPointerDown={(e) => {
          // Prevent the React Flow pane from initiating a pan gesture.
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          selectNode(memberId)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          shiftFocus(memberId)
        }}
        className={
          "nopan nodrag group relative w-[210px] rounded-2xl border bg-white/90 p-3 text-left shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 " +
          (isFocus ? 'ring-2 ring-orange-400 border-orange-200' : '')
        }
      >
        <div className="flex items-start gap-3">
          <div className={"h-12 w-12 overflow-hidden rounded-full border " + badge}>
            {member.avatar ? (
              <img src={member.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-600">
                {initials(member.name)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900">{member.name}</div>
            <div className="mt-0.5 truncate text-xs text-slate-500">
              {dates || member.gender}
            </div>
            {member.familyBranch && <div className="mt-1 truncate text-[11px] text-slate-500">{member.familyBranch}</div>}
          </div>
        </div>

        {isFocus && <div className="pointer-events-none absolute -inset-1 rounded-[18px] ring-2 ring-orange-400/70" />}
      </button>

      <RadialMenu
        open={open}
        onAddParents={() => addParents(memberId)}
        onAddSpouse={() => addSpouse(memberId)}
        onAddChild={() => addChild(memberId)}
        onEdit={() => openEdit(memberId)}
        onDelete={() => deleteMember(memberId)}
        onShiftFocus={() => shiftFocus(memberId)}
      />
    </div>
  )
})

export const PlaceholderNode = memo(function PlaceholderNode({ data, id }: NodeProps<TreeNodeData>) {
  const openEdit = useTreeStore((s) => s.openEdit)
  const radialOpenForId = useTreeStore((s) => s.radialOpenForId)
  const selectNode = useTreeStore((s) => s.selectNode)
  const shiftFocus = useTreeStore((s) => s.shiftFocus)
  const membersById = useTreeStore((s) => s.membersById)

  // Starter node: canvas is empty.
  if (data.kind === 'starter' || String(id).startsWith(TreeConstants.STARTER_NODE_ID)) {
    return (
      <button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          openEdit(TreeConstants.FIRST_MEMBER_SENTINEL)
        }}
        className="nopan nodrag relative w-[230px] rounded-3xl border border-dashed border-emerald-300 bg-white/80 p-6 text-center shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        <div className="mx-auto h-14 w-14 rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50" />
        <div className="mt-3 text-sm font-semibold text-slate-900">Add First Member</div>
        <div className="mt-1 text-xs text-slate-500">Start building your family tree</div>
        <div className="pointer-events-none absolute -inset-1 rounded-[28px] ring-2 ring-emerald-200/70 animate-pulse" />
      </button>
    )
  }

  const memberId = (data as any).memberId as string
  const isFocus = (data as any).isFocus as boolean
  const member = membersById[memberId]

  const open = radialOpenForId === memberId

  if (!member) return null

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      <button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          // Placeholders should feel editable like genealogy apps.
          selectNode(memberId)
          openEdit(memberId)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          shiftFocus(memberId)
        }}
        className={
          "nopan nodrag group relative w-[210px] rounded-2xl border border-dashed bg-white/90 p-3 text-left shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 " +
          (isFocus ? 'ring-2 ring-orange-400 border-orange-200' : 'border-emerald-200')
        }
      >
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full border border-emerald-200 bg-emerald-50 animate-pulse" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900">Unknown</div>
            <div className="mt-0.5 truncate text-xs text-slate-500">Tap Edit to fill details</div>
          </div>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              useTreeStore.getState().openRadial(memberId)
            }}
            className="nopan nodrag ml-2 h-8 w-8 rounded-full border bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="Open actions"
            title="Open actions"
          >
            •••
          </button>
        </div>
      </button>

      <RadialMenu
        open={open}
        onAddParents={() => useTreeStore.getState().addParents(memberId)}
        onAddSpouse={() => useTreeStore.getState().addSpouse(memberId)}
        onAddChild={() => useTreeStore.getState().addChild(memberId)}
        onEdit={() => openEdit(memberId)}
        onDelete={() => useTreeStore.getState().deleteMember(memberId)}
        onShiftFocus={() => shiftFocus(memberId)}
      />
    </div>
  )
})
