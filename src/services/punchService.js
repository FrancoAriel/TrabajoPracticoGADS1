import { isApiMode } from '../config/env'
import { apiClient } from '../lib/apiClient'

/**
 * Lista paginada (API). tipo/origen valores como en BD: Entrada, Salida / Biometrico, Manual...
 */
export async function listPunches(params = {}) {
  if (!isApiMode()) {
    return {
      items: [],
      stats: null,
      meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
    }
  }

  const sp = new URLSearchParams()
  if (params.search) sp.set('search', params.search)
  if (params.type) sp.set('type', params.type)
  if (params.origin) sp.set('origin', params.origin)
  if (params.date) sp.set('date', params.date)
  if (params.page) sp.set('page', String(params.page))
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  const qs = sp.toString()
  const envelope = await apiClient.get(`/punches${qs ? `?${qs}` : ''}`)
  return {
    items: envelope.data?.items ?? [],
    stats: envelope.data?.stats ?? null,
    meta: envelope.meta ?? { page: 1, pageSize: Number(params.pageSize) || 15, totalItems: 0, totalPages: 1 },
  }
}

export async function createManualPunch(payload) {
  if (!isApiMode()) return { ok: true, ...payload }
  const raw = await apiClient.post('/punches', { origen: 'Manual', ...payload })
  return raw?.data ?? raw
}

export async function createPunchCorrection(punchId, payload) {
  if (!isApiMode()) return { ok: true, punchId, ...payload }
  const raw = await apiClient.post(`/punches/${punchId}/corrections`, payload)
  return raw?.data ?? raw
}

export async function deletePunch(id) {
  if (!isApiMode()) return
  await apiClient.delete(`/punches/${id}`)
}
