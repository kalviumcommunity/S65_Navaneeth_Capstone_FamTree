// client/src/features/familyTree/components/StarterNode.jsx

import { useFamilyTreeStore } from '../store/useFamilyTreeStore'

export default function StarterNode() {
  const openMemberModal = useFamilyTreeStore((s) => s.openMemberModal)

  return (
    <button
      type="button"
      onPointerDownCapture={(e) => e.stopPropagation()}
      onMouseDownCapture={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        openMemberModal('__FIRST__')
      }}
      className="relative w-[220px] cursor-pointer rounded-3xl border border-dashed border-emerald-300 bg-white/80 p-5 text-center shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
    >
      <div className="mx-auto h-14 w-14 rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50" />
      <div className="mt-3 text-sm font-semibold text-slate-900">Add First Member</div>
      <div className="mt-1 text-xs text-slate-500">Start building your family tree</div>
      <div className="pointer-events-none absolute -inset-1 rounded-[28px] ring-2 ring-emerald-200/70 animate-pulse" />
    </button>
  )
}
