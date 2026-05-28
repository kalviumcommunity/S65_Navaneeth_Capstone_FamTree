// client/src/features/familyTree/components/RadialMenu.jsx

import { useMemo } from 'react'

function ActionButton({ label, onClick, className, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "pointer-events-auto rounded-full border bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-50 disabled:opacity-50 " +
        (className || '')
      }
    >
      {label}
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
}) {
  const items = useMemo(
    () => [
      { label: 'Add Parents', onClick: onAddParents, angle: -90 },
      { label: 'Add Spouse', onClick: onAddSpouse, angle: -25 },
      { label: 'Add Child', onClick: onAddChild, angle: 40 },
      { label: 'Edit', onClick: onEdit, angle: 125 },
      { label: 'Delete', onClick: onDelete, angle: 180, className: 'text-rose-700 hover:bg-rose-50' },
      { label: 'Link Existing Member', onClick: onLinkExisting, angle: 235 },
      { label: 'Unlink Relationship', onClick: onUnlink, angle: 305 },
    ],
    [
      onAddParents,
      onAddSpouse,
      onAddChild,
      onEdit,
      onDelete,
      onLinkExisting,
      onUnlink,
    ]
  )

  // radius in px
  const r = 92

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={
          "relative h-1 w-1 transition duration-200 " +
          (open ? 'opacity-100 scale-100' : 'opacity-0 scale-95')
        }
      >
        {items.map((it) => {
          const rad = (it.angle * Math.PI) / 180
          const x = Math.cos(rad) * r
          const y = Math.sin(rad) * r
          return (
            <div
              key={it.label}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className={
                "absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 " +
                (open ? 'opacity-100' : 'opacity-0')
              }
            >
              <ActionButton label={it.label} onClick={it.onClick} className={it.className} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
