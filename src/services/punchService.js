import { isApiMode } from '../config/env'
import { mockPunches, mockPunchStats } from '../data/mock/punches'
import { apiClient } from '../lib/apiClient'

export async function listPunches() {
  if (!isApiMode()) {
    return { stats: mockPunchStats, items: mockPunches }
  }

  const response = await apiClient.get('/punches')
  return response.data
}

export async function createManualPunch(payload) {
  if (!isApiMode()) {
    return { success: true, ...payload }
  }

  const response = await apiClient.post('/punches/manual', payload)
  return response.data
}

export async function createPunchCorrection(punchId, payload) {
  if (!isApiMode()) {
    return { success: true, punchId, ...payload }
  }

  const response = await apiClient.post(`/punches/${punchId}/corrections`, payload)
  return response.data
}
