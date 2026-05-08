import { isApiMode } from '../config/env'
import { apiClient } from '../lib/apiClient'
import { mockUser } from '../data/mock/auth'

export async function login(username, password) {
  if (!isApiMode()) {
    if (username === 'admin' && password === 'admin') {
      return { token: 'mock-token', user: mockUser }
    }
    throw new Error('Usuario o contrasena incorrectos. Intenta de nuevo.')
  }

  const response = await apiClient.post('/auth/login', { username, password })
  return response.data
}
