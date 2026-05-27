// client/src/services/memberService.js

import api from './api'

export async function fetchMembers() {
  const response = await api.get('/api/members')
  return response.data
}

export async function fetchMember(id) {
  const response = await api.get(`/api/members/${id}`)
  return response.data
}

export async function createMember(payload) {
  const response = await api.post('/api/members', payload)
  return response.data
}

export async function updateMember(id, payload) {
  const response = await api.put(`/api/members/${id}`, payload)
  return response.data
}

export async function deleteMember(id) {
  const response = await api.delete(`/api/members/${id}`)
  return response.data
}
