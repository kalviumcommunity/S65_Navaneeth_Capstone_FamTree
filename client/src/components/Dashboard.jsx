// Dashboard.jsx
// Main content container — shows AddMemberForm and a list of MemberCard components

import AddMemberForm from './AddMemberForm'
import MemberCard from './MemberCard'

// Mock family member data to show while there is no backend connected
const mockMembers = [
  { id: 1, name: 'Maria Navarro',  relation: 'Mother',      age: 52 },
  { id: 2, name: 'Carlos Navarro', relation: 'Father',      age: 55 },
  { id: 3, name: 'Sofia Navarro',  relation: 'Sister',      age: 24 },
  { id: 4, name: 'Luis Navarro',   relation: 'Grandfather', age: 78 },
]

const dashboardStyle = {
  padding: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
}

const sectionTitleStyle = {
  fontSize: '1.4rem',
  fontWeight: '600',
  color: '#1b4332',
  marginBottom: '1rem',
  borderBottom: '2px solid #d8f3dc',
  paddingBottom: '0.5rem',
}

const cardGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '0.5rem',
  marginTop: '1rem',
}

function Dashboard() {
  return (
    <div style={dashboardStyle}>
      {/* Form to add a new member — appears above the member list */}
      <AddMemberForm />

      {/* Section heading */}
      <p style={sectionTitleStyle}>Family Members</p>

      {/* Render one MemberCard per mock member */}
      <div style={cardGridStyle}>
        {mockMembers.map((member) => (
          <MemberCard
            key={member.id}
            name={member.name}
            relation={member.relation}
            age={member.age}
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
