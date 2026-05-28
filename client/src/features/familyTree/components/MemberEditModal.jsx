// client/src/features/familyTree/components/MemberEditModal.jsx

import { useEffect, useMemo, useState } from 'react'
import { useFamilyTreeStore } from '../store/useFamilyTreeStore'

function parseTags(text) {
  return String(text || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

function GenderToggle({ value, onChange }) {
  const opts = ['Male', 'Female', 'Other']
  return (
    <div className="inline-flex rounded-xl border bg-white p-1">
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={
            "rounded-lg px-3 py-1 text-sm font-semibold transition " +
            (value === o ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50')
          }
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export default function MemberEditModal() {
  const open = useFamilyTreeStore((s) => s.modalOpen)
  const memberId = useFamilyTreeStore((s) => s.modalMemberId)
  const member = useFamilyTreeStore((s) => (memberId && memberId !== '__FIRST__' ? s.membersById[memberId] : null))

  const close = useFamilyTreeStore((s) => s.closeMemberModal)
  const createFirst = useFamilyTreeStore((s) => s.createFirstMember)
  const saveEdits = useFamilyTreeStore((s) => s.saveMemberEdits)
  const loading = useFamilyTreeStore((s) => s.loading)

  const title = useMemo(() => {
    if (memberId === '__FIRST__') return 'Add First Member'
    return member?.isPlaceholder ? 'Edit Placeholder' : 'Edit Member'
  }, [memberId, member?.isPlaceholder])

  const [name, setName] = useState('')
  const [gender, setGender] = useState('Other')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [dateOfDeath, setDateOfDeath] = useState('')
  const [notes, setNotes] = useState('')
  const [familyBranch, setFamilyBranch] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    if (!open) return

    setName(member?.name && member.name !== 'Unknown' ? member.name : '')
    setGender(member?.gender || 'Other')
    setDateOfBirth(member?.dateOfBirth ? String(member.dateOfBirth).slice(0, 10) : '')
    setDateOfDeath(member?.dateOfDeath ? String(member.dateOfDeath).slice(0, 10) : '')
    setNotes(member?.notes || '')
    setFamilyBranch(member?.familyBranch || '')
    setTagsText((member?.relationshipTags || []).join(', '))
    setAvatar(member?.avatar || '')
  }, [open, member])

  if (!open) return null

  async function handleSave() {
    const payload = {
      name: name.trim() || 'Unknown',
      gender,
      dateOfBirth: dateOfBirth || null,
      dateOfDeath: dateOfDeath || null,
      notes,
      familyBranch,
      relationshipTags: parseTags(tagsText),
      avatar,
    }

    if (memberId === '__FIRST__') {
      await createFirst(payload)
      return
    }

    await saveEdits(memberId, payload)
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(String(reader.result || ''))
    }
    reader.readAsDataURL(file)
  }

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
            <div className="text-lg font-bold text-slate-900">{title}</div>
            <div className="mt-1 text-sm text-slate-500">Update profile details and relationships metadata.</div>
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
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold text-slate-700">Profile Photo</div>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-slate-200 bg-slate-50">
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500">IMG</div>
                  )}
                </div>
                <div className="space-y-2">
                  <input type="file" accept="image/*" onChange={onFile} className="block text-sm" />
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="rounded-lg border px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700">Gender</div>
              <div className="mt-2">
                <GenderToggle value={gender} onChange={setGender} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Family Branch</label>
              <input
                value={familyBranch}
                onChange={(e) => setFamilyBranch(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="e.g. Maternal / Paternal"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Birth date</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Death date</label>
              <input
                type="date"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-700">Relationship tags</label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="e.g. bloodline, adopted, twin (comma separated)"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Story, context, details..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
