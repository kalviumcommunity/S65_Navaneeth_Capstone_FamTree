// client/src/features/familyTree/components/GenealogyNode.jsx

import { Handle, Position } from 'reactflow'
import { useMemo } from 'react'
import RadialMenu from './RadialMenu'
import { useFamilyTreeStore } from '../store/useFamilyTreeStore'

function genderClasses(gender) {
  if (gender === 'Male') return 'bg-sky-50 ring-sky-200'
  if (gender === 'Female') return 'bg-rose-50 ring-rose-200'
  return 'bg-violet-50 ring-violet-200'
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default function GenealogyNode({ data }) {
  const memberId = data.memberId

  const member = useFamilyTreeStore((s) => s.membersById[memberId])
  const radialOpenForId = useFamilyTreeStore((s) => s.radialOpenForId)
  const collapsedIds = useFamilyTreeStore((s) => s.collapsedIds)

  const toggleRadial = useFamilyTreeStore((s) => s.toggleRadial)
  const openMemberModal = useFamilyTreeStore((s) => s.openMemberModal)
  const addParents = useFamilyTreeStore((s) => s.addParents)
  const addSpouse = useFamilyTreeStore((s) => s.addSpouse)
  const addChild = useFamilyTreeStore((s) => s.addChild)
  const del = useFamilyTreeStore((s) => s.deleteMember)
  const openLinkModal = useFamilyTreeStore((s) => s.openLinkModal)
  const openUnlinkModal = useFamilyTreeStore((s) => s.openUnlinkModal)
  const toggleCollapse = useFamilyTreeStore((s) => s.toggleCollapse)

  const open = radialOpenForId === memberId
  const collapsed = collapsedIds?.has(memberId)

  const badge = useMemo(() => genderClasses(member?.gender), [member?.gender])

  if (!member) return null

  const isPlaceholder = member.isPlaceholder || member.name === 'Unknown'

  function handleMainClick(e) {
    e.stopPropagation()
    if (isPlaceholder) {
      openMemberModal(memberId)
      return
    }
    toggleRadial(memberId)
  }

  function handleCollapseClick(e) {
    e.stopPropagation()
    toggleCollapse(memberId)
  }

  return (
    <div className="relative z-10 nodrag nopan cursor-pointer" style={{ pointerEvents: 'all' }}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />

      <button
        type="button"
        onPointerDownCapture={(e) => e.stopPropagation()}
        onMouseDownCapture={(e) => e.stopPropagation()}
        onClick={handleMainClick}
        className={
          "group relative w-[190px] cursor-pointer rounded-2xl border bg-white/90 p-3 text-left shadow-sm backdrop-blur transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200 " +
          (isPlaceholder ? 'border-dashed' : '')
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={
                "h-11 w-11 overflow-hidden rounded-full ring-2 " +
                badge +
                (isPlaceholder ? ' animate-pulse' : '')
              }
            >
              {member.avatar ? (
                <img src={member.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-600">
                  {initials(member.name)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {isPlaceholder ? 'Unknown' : member.name}
              </div>
              <div className="truncate text-xs text-slate-500">
                {member.familyBranch ? member.familyBranch : isPlaceholder ? 'Tap to edit' : member.gender}
              </div>
            </div>
          </div>

          <button
            type="button"
            onPointerDownCapture={(e) => e.stopPropagation()}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={handleCollapseClick}
            className="cursor-pointer rounded-lg border bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            aria-label={collapsed ? 'Expand generation' : 'Collapse generation'}
            title={collapsed ? 'Expand generation' : 'Collapse generation'}
          >
            {collapsed ? '+' : '–'}
          </button>
        </div>

        {member.relationshipTags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {member.relationshipTags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
              >
                {t}
              </span>
            ))}
            {member.relationshipTags.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400">
                +{member.relationshipTags.length - 3}
              </span>
            )}
          </div>
        )}

        {isPlaceholder && (
          <div className="pointer-events-none absolute -inset-1 rounded-[18px] ring-2 ring-emerald-200/60" />
        )}
      </button>

      <RadialMenu
        open={open}
        onAddParents={() => addParents(memberId)}
        onAddSpouse={() => addSpouse(memberId)}
        onAddChild={() => addChild(memberId)}
        onEdit={() => openMemberModal(memberId)}
        onDelete={() => del(memberId)}
        onLinkExisting={() => openLinkModal(memberId, 'spouse')}
        onUnlink={() => openUnlinkModal(memberId)}
      />
    </div>
  )
}
