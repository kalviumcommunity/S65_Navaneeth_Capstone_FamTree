// client/src/services/api.js
// Axios instance for calling our backend.
// In dev, Vite proxy (vite.config.js) forwards /api to http://localhost:5000.
// In production, set VITE_API_URL to your Render backend URL.

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
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
