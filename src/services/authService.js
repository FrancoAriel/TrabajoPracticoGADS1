import { isApiMode } from '../config/env'
import { apiClient } from '../lib/apiClient'
import { mockUser } from '../data/mock/auth'
import { saveSession } from '../lib/session'

export async function login(username, password) {
  if (!isApiMode()) {
    if (username === 'admin' && password === 'admin') {
      const session = { token: 'mock-token', user: mockUser }
      saveSession(session)
      return session
    }
    throw new Error('Usuario o contrasena incorrectos. Intenta de nuevo.')
  }

  const response = await apiClient.post('/auth/login', { username, password })
  saveSession(response.data)
  return response.data
}
