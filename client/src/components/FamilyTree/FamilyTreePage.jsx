// FamilyTreePage.jsx
// ─────────────────────────────────────────────────────────
// Top-level page that manages the full family-tree state and
// renders the interactive tree visualisation.
//
// Data model (flat dictionary for O(1) lookups):
//   people = { [id]: { id, name, gender, spouse, children } }
//   rootId = id of the topmost person (or null)
//
// The tree hierarchy lives in each person's `children` array.
// Spouses are linked bidirectionally via the `spouse` field but
// are NOT part of the hierarchy — they are rendered beside their
// partner inside TreeNode.
// ─────────────────────────────────────────────────────────

import { useState } from 'react'
import TreeNode from './TreeNode'
import PersonModal from './PersonModal'

// ── Utility: auto-incrementing IDs ──
let nextId = 1
function generateId() {
  return `person-${nextId++}`
}

// ── Modal title map ──
const modalTitles = {
  root:   '👤 Add Root Person',
  spouse: '💑 Add Spouse',
  child:  '👶 Add Child',
  edit:   '✏️ Edit Person',
}

function FamilyTreePage() {
  // ── Core tree data ──
  const [people, setPeople] = useState({})   // { id → person }
  const [rootId, setRootId] = useState(null) // id of root person

  // ── Modal state ──
  const [modal, setModal] = useState({
    isOpen: false,
    mode: 'root',       // 'root' | 'spouse' | 'child' | 'edit'
    targetId: null,      // person the action applies to
    initialData: null,   // pre-fill values (for edit)
  })

  // ── Modal helpers ──
  function openModal(mode, targetId = null, initialData = null) {
    setModal({ isOpen: true, mode, targetId, initialData })
  }
  function closeModal() {
    setModal({ isOpen: false, mode: 'root', targetId: null, initialData: null })
  }

  // ── Find the "primary" (tree-hierarchy) person in a couple ──
  // Spouses are rendered alongside the primary person but don't own
  // the `children` array. When adding a child from a spouse card we
  // need to add it to the primary person instead.
  function findPrimary(personId) {
    // If this person is in someone's children array or IS the root, they are primary
    if (personId === rootId) return personId
    for (const p of Object.values(people)) {
      if (p.children && p.children.includes(personId)) return personId
    }
    // Otherwise they're a spouse — find who links to them
    for (const p of Object.values(people)) {
      if (p.spouse === personId) return p.id
    }
    return personId
  }

  // ────────────────────────────────────────────
  //  SAVE  (create or update a person)
  // ────────────────────────────────────────────
  function handleSave({ name, gender }) {
    const { mode, targetId } = modal

    if (mode === 'root') {
      const id = generateId()
      setPeople((prev) => ({
        ...prev,
        [id]: { id, name, gender, spouse: null, children: [] },
      }))
      setRootId(id)
    }

    else if (mode === 'spouse') {
      const id = generateId()
      setPeople((prev) => ({
        ...prev,
        [id]: { id, name, gender, spouse: targetId, children: [] },
        [targetId]: { ...prev[targetId], spouse: id },
      }))
    }

    else if (mode === 'child') {
      const primaryId = findPrimary(targetId)
      const id = generateId()
      setPeople((prev) => ({
        ...prev,
        [id]: { id, name, gender, spouse: null, children: [] },
        [primaryId]: {
          ...prev[primaryId],
          children: [...(prev[primaryId].children || []), id],
        },
      }))
    }

    else if (mode === 'edit') {
      setPeople((prev) => ({
        ...prev,
        [targetId]: { ...prev[targetId], name, gender },
      }))
    }

    closeModal()
  }

  // ────────────────────────────────────────────
  //  DELETE  (remove a person + descendants)
  // ────────────────────────────────────────────
  function handleDelete(personId) {
    if (!window.confirm('Delete this person and all their descendants?')) return

    // Is this person a spouse node (not in the tree hierarchy)?
    const spouseOwner = Object.values(people).find((p) => p.spouse === personId)

    if (spouseOwner && personId !== rootId) {
      // Deleting a spouse: just unlink and remove
      setPeople((prev) => {
        const updated = { ...prev }
        updated[spouseOwner.id] = { ...updated[spouseOwner.id], spouse: null }
        delete updated[personId]
        return updated
      })
      return
    }

    // Deleting a tree-hierarchy node: collect the full subtree
    const toRemove = new Set()
    function collect(id) {
      if (!id || toRemove.has(id)) return
      toRemove.add(id)
      const p = people[id]
      if (!p) return
      if (p.spouse) toRemove.add(p.spouse)        // remove their spouse too
      ;(p.children || []).forEach(collect)          // recurse into children
    }
    collect(personId)

    setPeople((prev) => {
      const updated = { ...prev }
      toRemove.forEach((id) => delete updated[id])
      // Remove personId from any parent's children array
      for (const p of Object.values(updated)) {
        if (p.children && p.children.includes(personId)) {
          updated[p.id] = {
            ...p,
            children: p.children.filter((c) => c !== personId),
          }
        }
      }
      return updated
    })

    if (personId === rootId) setRootId(null)
  }

  // ── Actions passed through TreeNode → PersonCard ──
  const actions = {
    onAddSpouse: (id) => openModal('spouse', id),
    onAddChild:  (id) => openModal('child', id),
    onEdit:      (id) => openModal('edit', id, people[id]),
    onDelete:    handleDelete,
  }

  const root = rootId ? people[rootId] : null

  // ────────────────────────────────────────────
  //  RENDER
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-emerald-100 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-800 tracking-tight">
            🌳 FamTree – Family Tree Builder
          </h1>

          {/* Quick-add root button (shown only when tree is empty) */}
          {!root && (
            <button
              onClick={() => openModal('root')}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
            >
              + Start Tree
            </button>
          )}
        </div>
      </header>

      {/* ─── Main canvas ─── */}
      <main className="flex-1 overflow-auto p-6 sm:p-10">
        {!root ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-[65vh] text-center select-none">
            <div className="text-7xl mb-4 opacity-80">🌳</div>
            <p className="text-gray-500 text-lg mb-6 max-w-md">
              Your family tree is empty. Click the button below to add the <strong>root person</strong> and start building your tree.
            </p>
            <button
              onClick={() => openModal('root')}
              className="px-6 py-3 text-base font-semibold rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg transition cursor-pointer"
            >
              + Add Root Person
            </button>
          </div>
        ) : (
          /* ── Tree visualisation (horizontally scrollable) ── */
          <div className="flex justify-center">
            <div className="inline-block">
              <TreeNode person={root} people={people} actions={actions} />
            </div>
          </div>
        )}
      </main>

      {/* ─── Person modal (add / edit) ─── */}
      <PersonModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={modal.initialData}
        title={modalTitles[modal.mode]}
      />
    </div>
  )
}

export default FamilyTreePage
