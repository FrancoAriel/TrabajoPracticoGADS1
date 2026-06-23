import { env } from '../config/env'
import { clearSession, getAuthToken } from './session'

async function request(path, options = {}) {
  const token = getAuthToken()
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'Request failed'
    try {
      const body = await response.json()
      message = body?.error?.message || message
    } catch {
      message = response.statusText || message
    }
    if (response.status === 401) clearSession()
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
