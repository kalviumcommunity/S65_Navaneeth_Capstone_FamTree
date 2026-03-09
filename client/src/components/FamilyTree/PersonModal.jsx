// PersonModal.jsx
// A modal dialog for adding or editing a person in the family tree.
// Contains inputs for name and gender, plus Save / Cancel buttons.

import { useState, useEffect } from 'react'

function PersonModal({ isOpen, onClose, onSave, initialData, title }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')

  // Reset fields whenever the modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '')
      setGender(initialData?.gender || 'male')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), gender })
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Modal card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 animate-[fadeIn_0.15s_ease]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title || 'Add Person'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="modal-name">
              Name
            </label>
            <input
              id="modal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              autoFocus
              required
            />
          </div>

          {/* Gender select */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="modal-gender">
              Gender
            </label>
            <select
              id="modal-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonModal
