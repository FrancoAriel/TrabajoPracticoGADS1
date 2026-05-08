import { isApiMode } from '../config/env'
import { mockExports } from '../data/mock/exports'
import { apiClient } from '../lib/apiClient'

export async function getExportOptions() {
  if (!isApiMode()) {
    return mockExports
  }

  const response = await apiClient.get('/exports/options')
  return response.data
}

export async function createExport(payload) {
  if (!isApiMode()) {
    return { exportId: 'exp_mock', downloadUrl: '#' }
  }

  const response = await apiClient.post('/exports', payload)
  return response.data
}
