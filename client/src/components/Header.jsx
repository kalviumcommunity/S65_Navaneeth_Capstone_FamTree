// Header.jsx
// Simple top navigation bar.

import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-emerald-700">
          FamTree
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4 text-sm">
            <nav className="flex items-center gap-3">
              <Link to="/dashboard" className="text-gray-700 hover:text-emerald-700">
                Dashboard
              </Link>
              <Link to="/tree" className="text-gray-700 hover:text-emerald-700">
                Family Tree
              </Link>
            </nav>

            <span className="hidden sm:inline text-gray-500">{user?.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/login" className="text-gray-700 hover:text-emerald-700">
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Register
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
