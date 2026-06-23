import { isApiMode } from '../config/env'
import { apiClient } from '../lib/apiClient'
import { routes } from '../lib/routes'
import { getSession, saveSession } from '../lib/session'

const mockAdmin = {
  token: 'mock-token-admin',
  user: { id: 1, name: 'Administrator', role: 'Admin', initials: 'AD', legajo: null },
}

const mockEmployee = {
  token: 'mock-token-emp',
  user: {
    id: 1,
    legajo: 1,
    name: 'Carlos Ramírez',
    role: 'Empleado',
    initials: 'CR',
  },
}

export function homeRouteForSession(session = getSession()) {
  return session?.user?.role === 'Empleado' ? routes.miArea : routes.dashboard
}

export async function login(username, password) {
  if (!isApiMode()) {
    if (username === 'admin' && password === 'admin') {
      saveSession(mockAdmin)
      return mockAdmin
    }
    const dni = String(username).replace(/\D/g, '')
    if (dni && dni === String(password).replace(/\D/g, '')) {
      saveSession(mockEmployee)
      return mockEmployee
    }
    throw new Error('Usuario o contrasena incorrectos. Intenta de nuevo.')
  }

  const response = await apiClient.post('/auth/login', { username, password })
  saveSession(response.data)
  return response.data
}
