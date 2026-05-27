// client/src/pages/FamilyTreePage.jsx
// Shows a simple parent → children hierarchy.
// We intentionally do NOT use any graph libraries to keep it beginner-friendly.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FamilyTreeNode from '../components/FamilyTreeNode'
import { fetchMembers } from '../services/memberService'

export default function FamilyTreePage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
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

    load()
  }, [])

  // Build a lookup from parentId -> [children]
  const { roots, childrenMap } = useMemo(() => {
    const byId = new Map(members.map((m) => [m._id, m]))
    const map = {}

    for (const m of members) {
      const parentKey = m.parentId || null
      if (!map[parentKey]) map[parentKey] = []
      map[parentKey].push(m)
    }

    // A root is: parentId is null OR parentId refers to a missing member.
    const rootMembers = members.filter((m) => !m.parentId || !byId.has(m.parentId))

    // Keep consistent order (older first) to make the tree stable.
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    }

    return { roots: rootMembers, childrenMap: map }
  }, [members])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Tree</h1>
          <p className="mt-1 text-sm text-gray-600">
            This is a simple nested view: parent on top, children below.
          </p>
        </div>
        <Link
          to="/members/new"
          className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          + Add Member
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-700">{error}</p>
      ) : members.length === 0 ? (
        <div className="mt-6 rounded border bg-white p-4">
          <p className="text-gray-700">No members found.</p>
          <p className="mt-1 text-sm text-gray-600">Add a member to start building your tree.</p>
        </div>
      ) : (
        <div className="mt-6">
          {roots.map((root) => (
            <FamilyTreeNode key={root._id} member={root} childrenMap={childrenMap} />
          ))}
        </div>
      )}
    </div>
  )
}
