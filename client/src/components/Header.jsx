// Header.jsx
// Simple top navigation bar.

import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-[18px] font-bold tracking-tight text-emerald-700">
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
              className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link to="/login" className="text-slate-700 hover:text-emerald-700">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700"
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
