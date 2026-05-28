// client/src/features/familyTree/components/LinkExistingModal.jsx

import { useEffect, useMemo, useState } from 'react'
import { useFamilyTreeStore } from '../store/useFamilyTreeStore'

export default function LinkExistingModal() {
  const linkModal = useFamilyTreeStore((s) => s.linkModal)
  const membersById = useFamilyTreeStore((s) => s.membersById)
  const close = useFamilyTreeStore((s) => s.closeLinkModal)
  const linkExisting = useFamilyTreeStore((s) => s.linkExisting)
  const loading = useFamilyTreeStore((s) => s.loading)

  const [query, setQuery] = useState('')
  const [kind, setKind] = useState(linkModal.kind || 'spouse')

  useEffect(() => {
    if (linkModal.open) {
      setKind(linkModal.kind || 'spouse')
      setQuery('')
    }
  }, [linkModal.open, linkModal.kind])

  const source = linkModal.sourceId ? membersById[linkModal.sourceId] : null

  const candidates = useMemo(() => {
    if (!linkModal.open || !source) return []
    const q = query.trim().toLowerCase()

    return Object.values(membersById)
      .filter((m) => m._id !== source._id)
      .filter((m) => (q ? String(m.name || '').toLowerCase().includes(q) : true))
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  }, [linkModal.open, source, membersById, query])

  if (!linkModal.open || !source) return null

  const helperText =
    kind === 'parent'
      ? 'Select an existing member to link as a parent.'
      : kind === 'child'
        ? 'Select an existing member to link as a child.'
        : 'Select an existing member to link as a spouse.'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="w-full max-w-xl rounded-3xl border bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            <div className="text-lg font-bold text-slate-900">Link Existing Member</div>
            <div className="mt-1 text-sm text-slate-500">{helperText}</div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm font-semibold text-slate-700">Link as</div>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
            </select>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="mt-4 max-h-[360px] overflow-auto rounded-2xl border">
            {candidates.length === 0 ? (
              <div className="p-4 text-sm text-slate-600">No members found.</div>
            ) : (
              <ul className="divide-y">
                {candidates.map((m) => (
                  <li key={m._id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{m.name}</div>
                      <div className="truncate text-xs text-slate-500">{m.gender}</div>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => linkExisting({ sourceId: source._id, targetId: m._id, kind })}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Link
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
