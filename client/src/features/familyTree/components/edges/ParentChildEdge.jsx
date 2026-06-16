// client/src/features/familyTree/components/edges/ParentChildEdge.jsx

import { BaseEdge } from 'reactflow'

function toPoint(point, fallback) {
  if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) return point
  return fallback
}

export default function ParentChildEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const start = toPoint(data?.start, { x: sourceX, y: sourceY })
  const end = toPoint(data?.end, { x: targetX, y: targetY })
  const branchY = Number.isFinite(data?.branchY) ? data.branchY : (start.y + end.y) / 2

  const path =
    Math.abs(start.x - end.x) < 1
      ? `M ${start.x} ${start.y} V ${end.y}`
      : `M ${start.x} ${start.y} V ${branchY} H ${end.x} V ${end.y}`

  return <BaseEdge id={id} path={path} style={{ stroke: '#94a3b8', strokeWidth: 2 }} />
}
