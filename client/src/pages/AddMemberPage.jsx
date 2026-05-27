// client/src/pages/AddMemberPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMember, fetchMembers } from '../services/memberService'

export default function AddMemberPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [gender, setGender] = useState('Other')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [parentId, setParentId] = useState('')

  const [members, setMembers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchMembers()
        setMembers(result.data || [])
      } catch (err) {
        // Parent dropdown is optional; form can still work without it.
        setMembers([])
      }
    }
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await createMember({
        name,
        relation,
        gender,
        dateOfBirth: dateOfBirth || null,
        parentId: parentId || null,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Add Member</h1>
      <p className="mt-1 text-sm text-gray-600">Create a new family member record.</p>

      {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded border bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input className="mt-1 w-full rounded border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Relation</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            placeholder="e.g. Father, Mother, Son"
            required
          />
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
            <input
              className="mt-1 w-full rounded border px-3 py-2"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
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
          <p className="mt-1 text-xs text-gray-500">
            This creates a simple parent → child relationship using `parentId`.
          </p>
        </div>

        <button
          disabled={loading}
          className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          type="submit"
        >
          {loading ? 'Saving…' : 'Save member'}
        </button>
      </form>
    </div>
  )
}
