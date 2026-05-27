// client/src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()

  if (initializing) {
    return <div className="p-6 text-gray-600">Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
