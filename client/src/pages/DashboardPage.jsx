// client/src/pages/DashboardPage.jsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchMembers } from '../services/memberService'

export default function DashboardPage() {
  const { user } = useAuth()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadMembers() {
    setLoading(true)
    setError('')

    try {
      const result = await fetchMembers()
      setMembers(result.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const recent = members.slice(0, 5)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">Logged in as {user?.name} ({user?.email})</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-gray-500">Total members</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{members.length}</p>
        </div>

        <Link to="/members/new" className="rounded border bg-white p-4 hover:border-emerald-300">
          <p className="text-sm text-gray-500">Quick action</p>
          <p className="mt-1 font-semibold text-emerald-700">Add a family member →</p>
        </Link>

        <Link to="/tree" className="rounded border bg-white p-4 hover:border-emerald-300">
          <p className="text-sm text-gray-500">Visualize</p>
          <p className="mt-1 font-semibold text-emerald-700">View family tree →</p>
        </Link>
      </div>

      <div className="mt-8 rounded border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent members</h2>
          <button
            onClick={loadMembers}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
            type="button"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-gray-600">Loading…</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-700">{error}</p>
        ) : recent.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No members yet. Add your first member.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {recent.map((m) => (
              <li key={m._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{m.name}</p>
                  <p className="text-sm text-gray-600">
                    {m.relation}{m.parentId ? ' • has parent' : ' • root'}
                  </p>
                </div>
                <Link
                  to={`/members/${m._id}/edit`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
