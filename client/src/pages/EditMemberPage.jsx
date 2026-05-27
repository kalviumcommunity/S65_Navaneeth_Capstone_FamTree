// client/src/pages/EditMemberPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteMember, fetchMember, fetchMembers, updateMember } from '../services/memberService'

function toDateInputValue(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function EditMemberPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [gender, setGender] = useState('Other')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [parentId, setParentId] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [memberResult, membersResult] = await Promise.all([fetchMember(id), fetchMembers()])
        const member = memberResult.data

        setMembers((membersResult.data || []).filter((m) => m._id !== id))
        setName(member.name || '')
        setRelation(member.relation || '')
        setGender(member.gender || 'Other')
        setDateOfBirth(toDateInputValue(member.dateOfBirth))
        setParentId(member.parentId || '')
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load member')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await updateMember(id, {
        name,
        relation,
        gender,
        dateOfBirth: dateOfBirth || null,
        parentId: parentId || null,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update member')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this member?')) return

    try {
      await deleteMember(id)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete member')
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 text-gray-600">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>

      {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded border bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input className="mt-1 w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Relation</label>
          <input className="mt-1 w-full rounded border px-3 py-2" value={relation} onChange={(e) => setRelation(e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select className="mt-1 w-full rounded border px-3 py-2" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input className="mt-1 w-full rounded border px-3 py-2" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Parent (optional)</label>
          <select className="mt-1 w-full rounded border px-3 py-2" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">No parent (root)</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.relation})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            disabled={saving}
            className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            type="submit"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-red-300 px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}
