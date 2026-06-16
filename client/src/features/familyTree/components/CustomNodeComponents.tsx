import { memo, useMemo, useState } from 'react'
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

type WheelItem = {
  label: string
  onClick(): void
  tone?: 'default' | 'danger'
  disabled?: boolean
}

function CircularMenu({
  open,
  centerLabel,
  centerActionLabel,
  onCenterAction,
  items,
}: {
  open: boolean
  centerLabel: string
  centerActionLabel: string
  onCenterAction(): void
  items: WheelItem[]
}) {
  if (!open) return null

  const radius = 104
  const step = 360 / items.length

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 h-0 w-0">
      <div className="pointer-events-auto absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-slate-200/80 bg-white/55 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-sm" />
        <div className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-200 bg-white/95 text-center shadow-lg shadow-emerald-100/70">
          <button
            type="button"
            onPointerDownCapture={(e) => e.stopPropagation()}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onCenterAction()
            }}
            className="flex h-full w-full flex-col items-center justify-center rounded-full px-3 text-slate-900"
          >
            <div className="max-w-[76px] truncate text-[12px] font-semibold leading-tight">{centerLabel}</div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-600">
              {centerActionLabel}
            </div>
          </button>
        </div>

        {items.map((item, index) => {
          const angle = -90 + index * step
          const activeClass = item.tone === 'danger'
            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            : 'border-slate-200 bg-white/95 text-slate-700 hover:bg-slate-50'

          return (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onPointerDownCapture={(e) => e.stopPropagation()}
              onMouseDownCapture={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                if (!item.disabled) item.onClick()
              }}
              className={
                "pointer-events-auto absolute left-1/2 top-1/2 flex h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border px-2 text-center text-[10px] font-semibold leading-tight shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 " +
                activeClass
              }
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const MemberNode = memo(function MemberNode({ data }: NodeProps<TreeNodeData>) {
  const memberId = (data as any).memberId as string

  const member = useTreeStore((s) => s.membersById[memberId])
  const activeFocusId = useTreeStore((s) => s.activeFocusId)
  const selectNode = useTreeStore((s) => s.selectNode)
  const shiftFocus = useTreeStore((s) => s.shiftFocus)
  const openEdit = useTreeStore((s) => s.openEdit)
  const addParents = useTreeStore((s) => s.addParents)
  const addSpouse = useTreeStore((s) => s.addSpouse)
  const addChild = useTreeStore((s) => s.addChild)
  const deleteMember = useTreeStore((s) => s.deleteMember)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const badge = useMemo(() => ringForGender(member?.gender), [member?.gender])
  const isFocus = activeFocusId === memberId

  if (!member) return null

  const dates = [fmtDate(member.dateOfBirth), fmtDate(member.dateOfDeath)].filter(Boolean).join(' – ')

  const actions: WheelItem[] = [
    { label: 'Add Parents', onClick: () => { addParents(memberId); setIsMenuOpen(false) } },
    { label: 'Add Spouse', onClick: () => { addSpouse(memberId); setIsMenuOpen(false) } },
    { label: 'Add Child', onClick: () => { addChild(memberId); setIsMenuOpen(false) } },
    { label: 'Delete', tone: 'danger', onClick: () => { deleteMember(memberId); setIsMenuOpen(false) } },
    { label: 'Link', disabled: true, onClick: () => setIsMenuOpen(false) },
    { label: 'Unlink', disabled: true, onClick: () => setIsMenuOpen(false) },
  ]

  return (
    <div className="relative z-10 nodrag nopan cursor-pointer" style={{ pointerEvents: 'all' }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />

      <button
        type="button"
        onPointerDownCapture={(e) => {
          e.stopPropagation()
        }}
        onMouseDownCapture={(e) => {
          e.stopPropagation()
        }}
        onPointerDown={(e) => {
          // Prevent the React Flow pane from initiating a pan gesture.
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          selectNode(memberId)
          setIsMenuOpen((prev) => !prev)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          shiftFocus(memberId)
        }}
        className={
          "nopan nodrag group relative w-[210px] cursor-pointer rounded-2xl border bg-white/90 p-3 text-left shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 " +
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

      <CircularMenu
        open={isMenuOpen}
        centerLabel={member.name}
        centerActionLabel="Edit"
        onCenterAction={() => {
          setIsMenuOpen(false)
          openEdit(memberId)
        }}
        items={actions}
      />
    </div>
  )
})

export const PlaceholderNode = memo(function PlaceholderNode({ data, id }: NodeProps<TreeNodeData>) {
  const openEdit = useTreeStore((s) => s.openEdit)
  const selectNode = useTreeStore((s) => s.selectNode)
  const shiftFocus = useTreeStore((s) => s.shiftFocus)
  const membersById = useTreeStore((s) => s.membersById)
  const activeFocusId = useTreeStore((s) => s.activeFocusId)
  const addParents = useTreeStore((s) => s.addParents)
  const addSpouse = useTreeStore((s) => s.addSpouse)
  const addChild = useTreeStore((s) => s.addChild)
  const deleteMember = useTreeStore((s) => s.deleteMember)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
        className="nopan nodrag relative w-[230px] cursor-pointer rounded-3xl border border-dashed border-emerald-300 bg-white/80 p-6 text-center shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        <div className="mx-auto h-14 w-14 rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50" />
        <div className="mt-3 text-sm font-semibold text-slate-900">Add First Member</div>
        <div className="mt-1 text-xs text-slate-500">Start building your family tree</div>
        <div className="pointer-events-none absolute -inset-1 rounded-[28px] ring-2 ring-emerald-200/70 animate-pulse" />
      </button>
    )
  }

  const memberId = (data as any).memberId as string
  const member = membersById[memberId]
  const isFocus = activeFocusId === memberId

  if (!member) return null

  const actions: WheelItem[] = [
    { label: 'Add Parents', onClick: () => { addParents(memberId); setIsMenuOpen(false) } },
    { label: 'Add Spouse', onClick: () => { addSpouse(memberId); setIsMenuOpen(false) } },
    { label: 'Add Child', onClick: () => { addChild(memberId); setIsMenuOpen(false) } },
    { label: 'Delete', tone: 'danger', onClick: () => { deleteMember(memberId); setIsMenuOpen(false) } },
    { label: 'Link', disabled: true, onClick: () => setIsMenuOpen(false) },
    { label: 'Unlink', disabled: true, onClick: () => setIsMenuOpen(false) },
  ]

  return (
    <div className="relative z-10 nodrag nopan cursor-pointer" style={{ pointerEvents: 'all' }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      <button
        type="button"
        onPointerDownCapture={(e) => {
          e.stopPropagation()
        }}
        onMouseDownCapture={(e) => {
          e.stopPropagation()
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.stopPropagation()
          selectNode(memberId)
          setIsMenuOpen((prev) => !prev)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          shiftFocus(memberId)
        }}
        className={
          "nopan nodrag group relative w-[210px] cursor-pointer rounded-2xl border border-dashed bg-white/90 p-3 text-left shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 " +
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
            onPointerDownCapture={(e) => e.stopPropagation()}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen((prev) => !prev)
            }}
            className="nopan nodrag ml-2 h-8 w-8 cursor-pointer rounded-full border bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label="Open actions"
            title="Open actions"
          >
            •••
          </button>
        </div>
      </button>

      <CircularMenu
        open={isMenuOpen}
        centerLabel="Edit"
        centerActionLabel="Open"
        onCenterAction={() => {
          setIsMenuOpen(false)
          openEdit(memberId)
        }}
        items={actions}
      />
    </div>
  )
})
