// client/src/features/familyTree/components/RadialMenu.jsx

import { useMemo } from 'react'

function ActionButton({ label, onClick, className, disabled, style }) {
  const words = String(label || '').split(' ')

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDownCapture={(e) => e.stopPropagation()}
      onMouseDownCapture={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onClick?.()
      }}
      style={style}
      className={
        "nopan nodrag pointer-events-auto absolute flex h-[56px] w-[56px] items-center justify-center rounded-full border bg-white/95 px-1.5 text-center text-[9px] font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 " +
        (className || '')
      }
    >
      {words.length > 1 ? (
        <span className="flex flex-col items-center justify-center leading-[1.05]">
          <span>{words[0]}</span>
          <span>{words.slice(1).join(' ')}</span>
        </span>
      ) : (
        <span className="leading-tight">{label}</span>
      )}
    </button>
  )
}

export default function RadialMenu({
  open,
  onAddParents,
  onAddSpouse,
  onAddChild,
  onEdit,
  onDelete,
  onLinkExisting,
  onUnlink,
  containerSize = 240,
}) {
  const items = useMemo(
    () => [
      { label: 'Add Parents', onClick: onAddParents },
      { label: 'Add Spouse', onClick: onAddSpouse },
      { label: 'Add Child', onClick: onAddChild },
      { label: 'Delete', onClick: onDelete, className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' },
      { label: 'Link', onClick: onLinkExisting },
      { label: 'Unlink', onClick: onUnlink },
    ],
    [
      onAddParents,
      onAddSpouse,
      onAddChild,
      onDelete,
      onLinkExisting,
      onUnlink,
    ]
  )

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

      {/* Center Edit action if provided */}
      {onEdit && (
        <div
          className="pointer-events-auto absolute left-1/2 top-1/2 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-emerald-300 bg-white text-center shadow-md shadow-emerald-100/80 backdrop-blur-sm"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <button
            type="button"
            onPointerDownCapture={(e) => e.stopPropagation()}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="flex h-full w-full flex-col items-center justify-center rounded-full px-2 text-slate-900 transition hover:bg-emerald-50/60"
          >
            <div className="text-[11px] font-bold leading-tight">Edit</div>
            <div className="mt-0.5 text-[8.5px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              Profile
            </div>
          </button>
        </div>
      )}

      {/* Action buttons evenly spaced along inset radius R */}
      {items.map((it, index) => {
        const angle = (index * 360) / total - 90
        const rad = (angle * Math.PI) / 180
        const x = centerX + R * Math.cos(rad)
        const y = centerY + R * Math.sin(rad)

        return (
          <ActionButton
            key={it.label}
            label={it.label}
            onClick={it.onClick}
            className={it.className}
            disabled={it.disabled}
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </div>
  )
}
