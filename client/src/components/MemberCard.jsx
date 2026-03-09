// MemberCard.jsx
// Displays a single family member's details inside a styled card
// Props: name, relation, age

const cardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d0e8da',
  borderRadius: '10px',
  padding: '1rem 1.5rem',
  margin: '0.5rem',
  minWidth: '180px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  textAlign: 'center',
  transition: 'transform 0.1s ease',
}

const nameStyle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#1b4332',
  marginBottom: '0.3rem',
}

const detailStyle = {
  fontSize: '0.9rem',
  color: '#555',
  margin: '0.15rem 0',
}

const badgeStyle = {
  display: 'inline-block',
  backgroundColor: '#d8f3dc',
  color: '#2d6a4f',
  borderRadius: '20px',
  padding: '0.15rem 0.75rem',
  fontSize: '0.8rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
}

// MemberCard receives name, relation, and age as props
function MemberCard({ name, relation, age }) {
  return (
    <div style={cardStyle}>
      {/* Relation badge */}
      <span style={badgeStyle}>{relation}</span>

      {/* Member name */}
      <p style={nameStyle}>{name}</p>

      {/* Member age */}
      <p style={detailStyle}>Age: {age}</p>
    </div>
  )
}

export default MemberCard
