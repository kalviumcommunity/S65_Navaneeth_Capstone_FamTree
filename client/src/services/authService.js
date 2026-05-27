// client/src/services/authService.js

import api from './api'

export async function register({ name, email, password }) {
  const response = await api.post('/api/users/register', { name, email, password })
  return response.data
}

export async function login({ email, password }) {
  const response = await api.post('/api/users/login', { email, password })
  return response.data
}
