import './App.css'
import ChatBot from './components/ChatBot'

function App() {
  return (
    <>
      <main className="app-container">
        <h1 className="app-title">FamTree</h1>
        <p className="app-subtitle">Family Tree Visualization Platform</p>
      </main>
      <ChatBot />
    </>
  )
}

export default App
