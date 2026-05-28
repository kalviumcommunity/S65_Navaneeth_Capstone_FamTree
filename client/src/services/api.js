// client/src/services/api.js
// Axios instance for calling our backend.
// In dev, Vite proxy (vite.config.js) forwards /api to http://localhost:5000.
// In production, set VITE_API_URL to your Render backend URL.

import axios from 'axios'

const configuredBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

if (import.meta.env.PROD && !configuredBaseUrl) {
  // In production (Vercel), you almost always need VITE_API_URL pointing at your backend.
  // Without it, requests will go to the frontend origin and likely 404 / rewrite to index.html.
  console.warn('VITE_API_URL is not set. API calls may fail. Set it in your Vercel project env vars.')
}

const api = axios.create({
  baseURL: configuredBaseUrl,
})

// Attach JWT token (if available) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
