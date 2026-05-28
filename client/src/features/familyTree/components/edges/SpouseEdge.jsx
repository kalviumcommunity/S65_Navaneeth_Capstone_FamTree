// client/src/features/familyTree/components/edges/SpouseEdge.jsx

import { BaseEdge, getSmoothStepPath } from 'reactflow'

export default function SpouseEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd }) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 24,
  })

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{ strokeWidth: 2, strokeDasharray: '6 6' }}
    />
  )
}
