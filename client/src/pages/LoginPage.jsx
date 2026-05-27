// client/src/pages/LoginPage.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Login</h1>
      <p className="mt-1 text-sm text-gray-600">
        New here?{' '}
        <Link className="text-emerald-700 hover:underline" to="/register">
          Create an account
        </Link>
      </p>

      {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          type="submit"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}
