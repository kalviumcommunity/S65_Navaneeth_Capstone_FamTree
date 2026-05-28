import { useEffect, useMemo } from 'react'
import ReactFlow, { Background, Controls, ReactFlowProvider, useReactFlow } from 'reactflow'

import GenealogyNode from '../features/familyTree/components/GenealogyNode'
import StarterNode from '../features/familyTree/components/StarterNode'
import MemberEditModal from '../features/familyTree/components/MemberEditModal'
import LinkExistingModal from '../features/familyTree/components/LinkExistingModal'
import UnlinkModal from '../features/familyTree/components/UnlinkModal'
import SpouseEdge from '../features/familyTree/components/edges/SpouseEdge'
import ParentChildEdge from '../features/familyTree/components/edges/ParentChildEdge'
import { useFamilyTreeStore } from '../features/familyTree/store/useFamilyTreeStore'

function FamilyTreeCanvas() {
  const { fitView } = useReactFlow()
  const load = useFamilyTreeStore((s) => s.load)
  const loading = useFamilyTreeStore((s) => s.loading)
  const error = useFamilyTreeStore((s) => s.error)
  const membersById = useFamilyTreeStore((s) => s.membersById)
  const collapsedIds = useFamilyTreeStore((s) => s.collapsedIds)
  const closeRadial = useFamilyTreeStore((s) => s.closeRadial)
  const starterNodeNonce = useFamilyTreeStore((s) => s.starterNodeNonce)

  useEffect(() => {
    load()
  }, [load])

  const { nodes, edges } = useMemo(() => {
    const state = useFamilyTreeStore.getState()
    const derived = state.getDerived()

    // Empty state: show a centered starter node.
    if (Object.keys(membersById).length === 0) {
      return {
        nodes: [
          {
            id: `starter:${starterNodeNonce}`,
            type: 'starterNode',
            position: { x: 0, y: 0 },
            data: {},
            draggable: false,
          },
        ],
        edges: [],
      }
    }

    return derived
  }, [membersById, collapsedIds, starterNodeNonce])

  useEffect(() => {
    // Keep view nicely centered after load / major changes.
    if (nodes.length > 0) {
      fitView({ padding: 0.3, duration: 450 })
    }
  }, [nodes.length, fitView])

  const nodeTypes = useMemo(
    () => ({
      genealogyNode: GenealogyNode,
      starterNode: StarterNode,
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
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={28} size={1} />
        <Controls />
      </ReactFlow>

      <MemberEditModal />
      <LinkExistingModal />
      <UnlinkModal />
    </div>
  )
}

export default function FamilyTreePage() {
  return (
    <div className="bg-slate-50">
      <ReactFlowProvider>
        <FamilyTreeCanvas />
      </ReactFlowProvider>
    </div>
  )
}
