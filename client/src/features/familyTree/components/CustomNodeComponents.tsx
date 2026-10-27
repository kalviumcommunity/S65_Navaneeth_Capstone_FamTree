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
  containerSize = 240,
}: {
  open: boolean
  centerLabel: string
  centerActionLabel: string
  onCenterAction(): void
  items: WheelItem[]
  containerSize?: number
}) {
  if (!open) return null

  // 1. Reduced overall footprint by 25% (diameter: 320px -> 240px)
  const containerDiameter = containerSize
  const containerRadius = containerDiameter / 2 // 120px
  const buttonDiameter = 56
  const buttonRadius = buttonDiameter / 2 // 28px
  const outerPadding = 14 // ~14px clearance inside the outer circle border

  // 2. Inset R relative to circle's inner area: R = containerRadius - buttonRadius - outerPadding
  const R = containerRadius - buttonRadius - outerPadding // 78px
  const centerX = containerRadius // 120px
  const centerY = containerRadius // 120px
  const total = items.length

  return (
    <div
      className="nopan nodrag pointer-events-none absolute left-1/2 top-1/2 z-50"
      style={{
        width: `${containerDiameter}px`,
        height: `${containerDiameter}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Circular overlay boundary - all 6 buttons sit fully inside */}
      <div className="pointer-events-auto absolute inset-0 rounded-full border border-slate-200/90 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-md" />

      {/* Center Action (Edit Profile) - user 3.2 EDIT */}
      <div
        className="pointer-events-auto absolute left-1/2 top-1/2 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-emerald-300 bg-white text-center shadow-md shadow-emerald-100/80 backdrop-blur-sm"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <button
          type="button"
          onPointerDownCapture={(e) => e.stopPropagation()}
          onMouseDownCapture={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onCenterAction()
          }}
          className="flex h-full w-full flex-col items-center justify-center rounded-full px-2 text-slate-900 transition hover:bg-emerald-50/60"
        >
          <div className="max-w-[58px] truncate text-[11px] font-bold leading-tight text-slate-900">{centerLabel}</div>
          <div className="mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            {centerActionLabel}
          </div>
        </button>
      </div>

      {/* 6 Circular action items distributed evenly along inset radius R */}
      {items.map((item, index) => {
        // angle = (i * 360 / 6) - 90  // start from top (12 o'clock)
        const angle = (index * 360) / total - 90
        const rad = (angle * Math.PI) / 180
        const x = centerX + R * Math.cos(rad)
        const y = centerY + R * Math.sin(rad)

        const activeClass = item.tone === 'danger'
          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
          : 'border-slate-200 bg-white/95 text-slate-700 hover:bg-slate-50'

        const words = item.label.split(' ')

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
              "nopan nodrag pointer-events-auto absolute flex h-[56px] w-[56px] items-center justify-center rounded-full border px-1.5 text-center text-[9px] font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 " +
              activeClass
            }
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {words.length > 1 ? (
              <span className="flex flex-col items-center justify-center leading-[1.05]">
                <span>{words[0]}</span>
                <span>{words.slice(1).join(' ')}</span>
              </span>
            ) : (
              <span className="leading-tight">{item.label}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export const MemberNode = memo(function MemberNode({ data }: NodeProps<TreeNodeData>) {
  const memberId = (data as any).memberId as string

  const member = useTreeStore((s) => s.membersById[memberId])
  const activeFocusId = useTreeStore((s) => s.activeFocusId)
  const radialOpenForId = useTreeStore((s) => s.radialOpenForId)
  const selectNode = useTreeStore((s) => s.selectNode)
  const shiftFocus = useTreeStore((s) => s.shiftFocus)
  const openEdit = useTreeStore((s) => s.openEdit)
  const closeRadial = useTreeStore((s) => s.closeRadial)
  const addParents = useTreeStore((s) => s.addParents)
  const addSpouse = useTreeStore((s) => s.addSpouse)
  const addChild = useTreeStore((s) => s.addChild)
  const deleteMember = useTreeStore((s) => s.deleteMember)
  const [localMenuOpen, setLocalMenuOpen] = useState(false)

  const isMenuOpen = (radialOpenForId === memberId) || localMenuOpen
  const badge = useMemo(() => ringForGender(member?.gender), [member?.gender])
  const isFocus = activeFocusId === memberId

  if (!member) return null

  const dates = [fmtDate(member.dateOfBirth), fmtDate(member.dateOfDeath)].filter(Boolean).join(' – ')

  const handleClose = () => {
    setLocalMenuOpen(false)
    closeRadial()
  }

  const actions: WheelItem[] = [
    { label: 'Add Parents', onClick: () => { addParents(memberId); handleClose() } },
    { label: 'Add Spouse', onClick: () => { addSpouse(memberId); handleClose() } },
    { label: 'Add Child', onClick: () => { addChild(memberId); handleClose() } },
    { label: 'Delete', tone: 'danger', onClick: () => { deleteMember(memberId); handleClose() } },
    { label: 'Link', disabled: true, onClick: handleClose },
    { label: 'Unlink', disabled: true, onClick: handleClose },
  ]

  return (
    <div
      className={`relative nodrag nopan cursor-pointer w-[210px] ${isMenuOpen ? 'z-50' : 'z-10'}`}
      style={{ pointerEvents: 'all' }}
    >
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
          setLocalMenuOpen((prev) => !prev)
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
          handleClose()
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
  const radialOpenForId = useTreeStore((s) => s.radialOpenForId)
  const openRadial = useTreeStore((s) => s.openRadial)
  const closeRadial = useTreeStore((s) => s.closeRadial)
  const addParents = useTreeStore((s) => s.addParents)
  const addSpouse = useTreeStore((s) => s.addSpouse)
  const addChild = useTreeStore((s) => s.addChild)
  const deleteMember = useTreeStore((s) => s.deleteMember)
  const [localMenuOpen, setLocalMenuOpen] = useState(false)

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
  const isMenuOpen = (radialOpenForId === memberId) || localMenuOpen

  if (!member) return null

  const handleClose = () => {
    setLocalMenuOpen(false)
    closeRadial()
  }

  const actions: WheelItem[] = [
    { label: 'Add Parents', onClick: () => { addParents(memberId); handleClose() } },
    { label: 'Add Spouse', onClick: () => { addSpouse(memberId); handleClose() } },
    { label: 'Add Child', onClick: () => { addChild(memberId); handleClose() } },
    { label: 'Delete', tone: 'danger', onClick: () => { deleteMember(memberId); handleClose() } },
    { label: 'Link', disabled: true, onClick: handleClose },
    { label: 'Unlink', disabled: true, onClick: handleClose },
  ]

  return (
    <div
      className={`relative nodrag nopan cursor-pointer w-[210px] ${isMenuOpen ? 'z-50' : 'z-10'}`}
      style={{ pointerEvents: 'all' }}
    >
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
          setLocalMenuOpen((prev) => !prev)
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
              openRadial(memberId)
              setLocalMenuOpen((prev) => !prev)
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
          handleClose()
          openEdit(memberId)
        }}
        items={actions}
      />
    </div>
  )
})
