import { isApiMode } from '../config/env'
import { mockDashboard } from '../data/mock/dashboard'
import { apiClient } from '../lib/apiClient'

export async function getDashboard() {
  if (!isApiMode()) {
    return mockDashboard
  }

  const response = await apiClient.get('/dashboard')
  return response.data
}
