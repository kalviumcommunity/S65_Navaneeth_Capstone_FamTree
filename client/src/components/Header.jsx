// Header.jsx
// Displays the app title and subtitle at the top of the page

const headerStyle = {
  backgroundColor: '#2d6a4f',
  color: '#ffffff',
  padding: '1.5rem 2rem',
  textAlign: 'center',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
}

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: '700',
  margin: '0 0 0.25rem 0',
  letterSpacing: '2px',
}

const subtitleStyle = {
  fontSize: '1rem',
  fontWeight: '400',
  margin: '0',
  opacity: '0.85',
}

function Header() {
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>FamTree</h1>
      <p style={subtitleStyle}>Family Tree Visualization Platform</p>
    </header>
  )
}

export default Header
