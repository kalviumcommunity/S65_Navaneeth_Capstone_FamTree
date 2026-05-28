// client/src/features/familyTree/components/UnlinkModal.jsx

import { useMemo } from 'react'
import { useFamilyTreeStore } from '../store/useFamilyTreeStore'

function Section({ title, items, onUnlink }) {
  return (
    <div className="rounded-2xl border">
      <div className="border-b px-4 py-3 text-sm font-bold text-slate-800">{title}</div>
      {items.length === 0 ? (
        <div className="px-4 py-3 text-sm text-slate-600">None</div>
      ) : (
        <ul className="divide-y">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{it.name}</div>
                <div className="truncate text-xs text-slate-500">{it.gender}</div>
              </div>
              <button
                type="button"
                onClick={() => onUnlink(it.id)}
                className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Unlink
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function UnlinkModal() {
  const unlinkModal = useFamilyTreeStore((s) => s.unlinkModal)
  const membersById = useFamilyTreeStore((s) => s.membersById)
  const close = useFamilyTreeStore((s) => s.closeUnlinkModal)
  const unlinkRelationship = useFamilyTreeStore((s) => s.unlinkRelationship)

  const source = unlinkModal.sourceId ? membersById[unlinkModal.sourceId] : null

  const parents = useMemo(() => {
    if (!source) return []
    return (source.parents || [])
      .map((id) => membersById[id])
      .filter(Boolean)
      .map((m) => ({ id: m._id, name: m.name, gender: m.gender }))
  }, [source, membersById])

  const spouses = useMemo(() => {
    if (!source) return []
    return (source.spouses || [])
      .map((id) => membersById[id])
      .filter(Boolean)
      .map((m) => ({ id: m._id, name: m.name, gender: m.gender }))
  }, [source, membersById])

  const children = useMemo(() => {
    if (!source) return []
    return (source.children || [])
      .map((id) => membersById[id])
      .filter(Boolean)
      .map((m) => ({ id: m._id, name: m.name, gender: m.gender }))
  }, [source, membersById])

  if (!unlinkModal.open || !source) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl border bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            <div className="text-lg font-bold text-slate-900">Unlink Relationship</div>
            <div className="mt-1 text-sm text-slate-500">Remove connections from {source.name}.</div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-3">
          <Section
            title="Parents"
            items={parents}
            onUnlink={(targetId) => unlinkRelationship({ sourceId: source._id, targetId, kind: 'parent' })}
          />
          <Section
            title="Spouses"
            items={spouses}
            onUnlink={(targetId) => unlinkRelationship({ sourceId: source._id, targetId, kind: 'spouse' })}
          />
          <Section
            title="Children"
            items={children}
            onUnlink={(targetId) => unlinkRelationship({ sourceId: source._id, targetId, kind: 'child' })}
          />
        </div>

        <div className="flex items-center justify-end border-t px-6 py-4">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
