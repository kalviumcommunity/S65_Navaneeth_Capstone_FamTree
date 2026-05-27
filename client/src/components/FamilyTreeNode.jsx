// client/src/components/FamilyTreeNode.jsx
// Recursive tree renderer.
// It displays a member and then renders their children below.

import { Link } from 'react-router-dom'

export default function FamilyTreeNode({ member, childrenMap, level = 0 }) {
  const children = childrenMap[member._id] || []

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between rounded border bg-white p-3">
        <div>
          <p className="font-semibold text-gray-900">{member.name}</p>
          <p className="text-sm text-gray-600">
            {member.relation}
            {member.gender ? ` • ${member.gender}` : ''}
          </p>
        </div>
        <Link className="text-sm text-emerald-700 hover:underline" to={`/members/${member._id}/edit`}>
          Edit
        </Link>
      </div>

      {children.length > 0 && (
        <div className="ml-4 border-l pl-4">
          {children.map((child) => (
            <FamilyTreeNode key={child._id} member={child} childrenMap={childrenMap} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
