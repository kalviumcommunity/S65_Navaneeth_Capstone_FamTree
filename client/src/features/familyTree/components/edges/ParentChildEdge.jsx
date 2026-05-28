// client/src/features/familyTree/components/edges/ParentChildEdge.jsx

import { BaseEdge, getSmoothStepPath } from 'reactflow'

export default function ParentChildEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd }) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 20,
  })

  return (
    <BaseEdge
      id={id}
      path={path}
      markerEnd={markerEnd}
      style={{ strokeWidth: 2 }}
    />
  )
}
