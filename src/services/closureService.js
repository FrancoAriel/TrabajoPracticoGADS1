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

export async function createClosure(payload) {
  if (!isApiMode()) {
    return {
      id_cierre: `closure_${Date.now()}`,
      periodo: payload?.periodo ?? mockClosure.currentPeriod,
      estado: 'Borrador',
    }
  }

  const response = await apiClient.post('/closures', payload)
  return response.data
}

export async function runClosure(closureId, payload = {}) {
  if (!isApiMode()) {
    return {
      id: closureId,
      estado: 'Cerrado',
      periodo: mockClosure.currentPeriod,
      novedadesIncluidas: Number(mockClosure.stats?.liquidated ?? 0),
      employeeBreakdown: mockClosure.employeeBreakdown,
      totals: mockClosure.stats,
    }
  }

  const response = await apiClient.post(`/closures/${closureId}/run`, payload)
  return response.data
}
