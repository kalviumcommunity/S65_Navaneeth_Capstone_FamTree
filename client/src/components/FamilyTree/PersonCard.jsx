// PersonCard.jsx
// Renders a single person node in the family tree as a styled card.
// Shows avatar, name, gender badge, and action buttons.

const genderEmoji = { male: '👨', female: '👩', other: '🧑' }
const genderColor = {
  male: 'bg-blue-100 text-blue-700',
  female: 'bg-pink-100 text-pink-700',
  other: 'bg-purple-100 text-purple-700',
}

function PersonCard({ person, onAddSpouse, onAddChild, onEdit, onDelete }) {
  const emoji = genderEmoji[person.gender] || genderEmoji.other
  const badge = genderColor[person.gender] || genderColor.other

  return (
    <div className="relative bg-white rounded-xl shadow-md border border-gray-100 px-5 py-4 w-48 text-center transition hover:shadow-lg">
      {/* Avatar circle */}
      <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-2xl select-none">
        {emoji}
      </div>

      {/* Name */}
      <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
        {person.name}
      </p>

      {/* Gender badge */}
      <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${badge}`}>
        {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}
      </span>

      {/* ── Action buttons ── */}
      <div className="mt-3 flex flex-wrap justify-center gap-1">
        {/* Only show "Add Spouse" if person doesn't already have one */}
        {!person.spouse && (
          <button
            onClick={() => onAddSpouse(person.id)}
            title="Add Husband / Wife"
            className="text-[11px] px-2 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
          >
            + Spouse
          </button>
        )}

        <button
          onClick={() => onAddChild(person.id)}
          title="Add Child"
          className="text-[11px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
        >
          + Child
        </button>

        <button
          onClick={() => onEdit(person.id)}
          title="Edit Person"
          className="text-[11px] px-2 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
        >
          ✏️
        </button>

        <button
          onClick={() => onDelete(person.id)}
          title="Delete Person"
          className="text-[11px] px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default PersonCard
