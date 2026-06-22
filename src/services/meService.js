import { isApiMode } from '../config/env'
import { apiClient } from '../lib/apiClient'

// Autoconsulta del empleado logueado. El backend (router /api/me) filtra
// siempre por el legajo del token, asi que estos endpoints solo devuelven
// datos propios del usuario. Acepta rango opcional ?desde=&hasta= (YYYY-MM-DD).

function buildRangeQuery(params = {}) {
  const sp = new URLSearchParams()
  if (params.desde) sp.set('desde', params.desde)
  if (params.hasta) sp.set('hasta', params.hasta)
  if (params.status) sp.set('status', params.status)
  if (params.type) sp.set('type', params.type)
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export async function getMyPunches(params = {}) {
  if (!isApiMode()) return { range: null, items: [] }
  const envelope = await apiClient.get(`/me/punches${buildRangeQuery(params)}`)
  return envelope?.data ?? { range: null, items: [] }
}

export async function getMyNews(params = {}) {
  if (!isApiMode()) return { range: null, stats: { pending: 0, approved: 0, rejected: 0 }, items: [] }
  const envelope = await apiClient.get(`/me/news${buildRangeQuery(params)}`)
  return envelope?.data ?? { range: null, stats: { pending: 0, approved: 0, rejected: 0 }, items: [] }
}

export async function getMySummary(params = {}) {
  if (!isApiMode()) return null
  const envelope = await apiClient.get(`/me/summary${buildRangeQuery(params)}`)
  return envelope?.data ?? null
}
