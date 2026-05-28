import { useEffect, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from 'reactflow'

import { useTreeStore } from './store/useTreeStore'
import type { TreeNodeData } from './types'

import { MemberNode, PlaceholderNode } from './components/CustomNodeComponents'

import SpouseEdge from './components/edges/SpouseEdge'
import ParentChildEdge from './components/edges/ParentChildEdge'

import MemberEditModal from './components/MemberEditModal'

function InnerCanvas() {
  const { setCenter, fitView } = useReactFlow()

  const nodes = useTreeStore((s) => s.nodes) as Node<TreeNodeData>[]
  const edges = useTreeStore((s) => s.edges) as Edge[]
  const loading = useTreeStore((s) => s.loading)
  const error = useTreeStore((s) => s.error)
  const activeFocusId = useTreeStore((s) => s.activeFocusId)

  const load = useTreeStore((s) => s.load)
  const closeRadial = useTreeStore((s) => s.closeRadial)

  useEffect(() => {
    load()
  }, [load])

  // Smoothly recenter whenever focus changes.
  useEffect(() => {
    if (!activeFocusId) return
    // Our focus-based layout pins focus at (0,0).
    setCenter(0, 0, { duration: 600, zoom: 1 })
  }, [activeFocusId, setCenter])

  useEffect(() => {
    if (nodes.length === 0) return
    // Keep everything comfortably in view after recompute / focus shift.
    // (Nodes array identity changes when the focus-derived graph changes.)
    requestAnimationFrame(() => {
      fitView({ padding: 0.35, duration: 450 })
    })
  }, [nodes, edges, fitView])

  const nodeTypes = useMemo(
    () => ({
      memberNode: MemberNode,
      placeholderNode: PlaceholderNode,
    }),
    []
  )

  const edgeTypes = useMemo(
    () => ({
      spouseEdge: SpouseEdge,
      parentChildEdge: ParentChildEdge,
    }),
    []
  )

  return (
    <div className="h-[calc(100vh-56px)] w-full">
      {error && (
        <div className="absolute left-4 top-4 z-50 rounded-2xl border bg-white/90 px-4 py-3 text-sm text-rose-700 shadow-sm backdrop-blur">
          {error}
        </div>
      )}

      {loading && (
        <div className="absolute right-4 top-4 z-50 rounded-2xl border bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur">
          Loading…
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onPaneClick={() => closeRadial()}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={28} size={1} />
        <Controls />
      </ReactFlow>

      <MemberEditModal />
    </div>
  )
}

export default function FamilyTreeCanvas() {
  return (
    <div className="bg-slate-50">
      <ReactFlowProvider>
        <InnerCanvas />
      </ReactFlowProvider>
    </div>
  )
}
