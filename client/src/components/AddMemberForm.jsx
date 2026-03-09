// AddMemberForm.jsx
// A form that collects name, relation, and age for a new family member
// On submit, logs the values to the console (no backend call yet)

import { useState } from 'react'

const formContainerStyle = {
  backgroundColor: '#f0faf4',
  border: '1px solid #b7e4c7',
  borderRadius: '10px',
  padding: '1.5rem 2rem',
  maxWidth: '400px',
  margin: '1rem auto',
}

const formTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '600',
  color: '#1b4332',
  marginBottom: '1rem',
  marginTop: '0',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#333',
  marginBottom: '0.25rem',
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.95rem',
  border: '1px solid #b7e4c7',
  borderRadius: '6px',
  marginBottom: '0.75rem',
  boxSizing: 'border-box',
  outline: 'none',
}

const buttonStyle = {
  width: '100%',
  padding: '0.6rem',
  backgroundColor: '#2d6a4f',
  color: '#ffffff',
  fontSize: '1rem',
  fontWeight: '600',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '0.5rem',
}

function AddMemberForm() {
  // Controlled state for each form field
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [age, setAge] = useState('')

  // Handles form submission — logs values and resets the fields
  function handleSubmit(e) {
    e.preventDefault() // Prevent page reload

    console.log('New Member Added:', { name, relation, age })

    // Reset form fields after submission
    setName('')
    setRelation('')
    setAge('')
  }

  return (
    <div style={formContainerStyle}>
      <p style={formTitleStyle}>Add a Family Member</p>

      <form onSubmit={handleSubmit}>
        {/* Name input */}
        <label style={labelStyle} htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          required
        />

        {/* Relation input */}
        <label style={labelStyle} htmlFor="relation">Relation</label>
        <input
          id="relation"
          type="text"
          placeholder="e.g. Father, Sister"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          style={inputStyle}
          required
        />

        {/* Age input */}
        <label style={labelStyle} htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          placeholder="e.g. 45"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={inputStyle}
          min="0"
          required
        />

        <button type="submit" style={buttonStyle}>
          Add Member
        </button>
      </form>
    </div>
  )
}

export default AddMemberForm
