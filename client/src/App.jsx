import './App.css'
import FamilyTreePage from './components/FamilyTree/FamilyTreePage'
import ChatBot from './components/ChatBot'

function App() {
  return (
    <>
      {/* Full-screen family tree builder */}
      <FamilyTreePage />

      {/* Floating chatbot overlay */}
      <ChatBot />
    </>
  )
}

export default App
