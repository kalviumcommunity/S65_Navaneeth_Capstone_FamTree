// client/src/features/familyTree/components/edges/SpouseEdge.jsx

import { BaseEdge } from 'reactflow'

function toPoint(point, fallback) {
  if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) return point
  return fallback
}

export default function SpouseEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const start = toPoint(data?.start, { x: sourceX, y: sourceY })
  const end = toPoint(data?.end, { x: targetX, y: targetY })
  const y = (start.y + end.y) / 2
  const midX = (start.x + end.x) / 2
  const path = `M ${start.x} ${y} H ${end.x}`

  return (
    <g>
      <BaseEdge id={id} path={path} style={{ stroke: '#94a3b8', strokeWidth: 2 }} />
      <circle cx={midX} cy={y} r="7" fill="#f9a8d4" stroke="#ffffff" strokeWidth="2" />
    </g>
  )
}
