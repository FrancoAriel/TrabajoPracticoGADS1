import { isApiMode } from '../config/env'
import { mockClosure } from '../data/mock/closures'
import { apiClient } from '../lib/apiClient'

export async function getCurrentClosure() {
  if (!isApiMode()) {
    return mockClosure
  }

  const response = await apiClient.get('/closures/current')
  return response.data
}
