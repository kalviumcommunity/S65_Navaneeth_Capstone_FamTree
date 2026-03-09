// TreeNode.jsx
// Recursive component that renders one family unit (person + optional spouse)
// and their children below, connected by clean horizontal / vertical lines.
//
// Connector strategy (CSS-only, no JS measurement needed):
//   ┌─────────────────────────┐
//   │  [Person] ─── [Spouse]  │   couple row
//   └────────────┬────────────┘
//                │                 vertical stem
//         ┌──────┼──────┐         horizontal rail (built from halves)
//         │      │      │         vertical ticks
//       [A]    [B]    [C]         children (each recurses)
//
// Each child column contributes LEFT and/or RIGHT halves of the rail:
//   First child  → right half only
//   Middle child → both halves
//   Last child   → left half only
// This automatically spans the rail from the first child's centre
// to the last child's centre, regardless of column widths.

import PersonCard from './PersonCard'

function TreeNode({ person, people, actions }) {
  // Look up the spouse object (if any)
  const spouse = person.spouse ? people[person.spouse] : null

  // Gather children that still exist in the people map
  const children = (person.children || [])
    .map((id) => people[id])
    .filter(Boolean)

  return (
    <div className="flex flex-col items-center">
      {/* ─── Couple row ─── */}
      <div className="flex items-start">
        {/* Primary person */}
        <PersonCard person={person} {...actions} />

        {spouse && (
          <>
            {/* Horizontal line connecting the two partners */}
            <div className="flex items-center self-center">
              <div className="w-8 h-[2px] bg-emerald-300 rounded-full" />
            </div>
            {/* Spouse card */}
            <PersonCard person={spouse} {...actions} />
          </>
        )}
      </div>

      {/* ─── Children ─── */}
      {children.length > 0 && (
        <>
          {/* Vertical stem from the couple centre downward */}
          <div className="w-[2px] h-8 bg-emerald-300" />

          {/* Children row – each column draws its own piece of the rail */}
          <div className="flex">
            {children.map((child, index) => {
              const isFirst = index === 0
              const isLast  = index === children.length - 1
              const isOnly  = children.length === 1

              return (
                <div key={child.id} className="flex flex-col items-center px-5">
                  {/* ── Connector lines above this child ── */}
                  {!isOnly && (
                    <div className="relative w-full h-6">
                      {/* Left half of horizontal rail */}
                      {!isFirst && (
                        <div className="absolute top-0 left-0 w-1/2 h-[2px] bg-emerald-300" />
                      )}
                      {/* Right half of horizontal rail */}
                      {!isLast && (
                        <div className="absolute top-0 left-1/2 w-1/2 h-[2px] bg-emerald-300" />
                      )}
                      {/* Vertical tick from rail down to the child node */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-emerald-300" />
                    </div>
                  )}

                  {/* Recurse into the child's own family unit */}
                  <TreeNode person={child} people={people} actions={actions} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default TreeNode
