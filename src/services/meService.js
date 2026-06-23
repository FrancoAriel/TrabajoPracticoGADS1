import { isApiMode } from '../config/env'
import { apiClient } from '../lib/apiClient'

function buildQuery(params = {}) {
  const sp = new URLSearchParams()
  const keys = ['desde', 'hasta', 'status', 'type', 'date', 'origin', 'dateFrom', 'dateTo']
  for (const key of keys) {
    if (params[key]) sp.set(key, String(params[key]))
  }
  if (params.page) sp.set('page', String(params.page))
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  if (params.correction != null && params.correction !== '') sp.set('correction', String(params.correction))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export async function getMyProfile() {
  if (!isApiMode()) {
    return {
      employee: {
        legajo: '0001',
        name: 'Carlos Ramírez',
        dni: '28456789',
        status: 'Activo',
        jornada: 'Completa',
        category: 'Administrativo',
        fechaIngreso: '2020-03-01',
      },
      scheduleConfig: { schedule: 'Turno Mañana Fijo', cycle: null, jornada: 'Completa' },
      stats: { pendingNews: 1, recentPunches: 6 },
      recentPunches: [],
      recentNews: [],
      requestTypes: ['Licencia', 'Vacaciones', 'Permiso_especial', 'Justificacion'],
    }
  }
  const res = await apiClient.get('/me')
  return res.data
}

export async function getMyPunches(params = {}) {
  if (!isApiMode()) {
    if (params.page || params.date) {
      return { items: [], meta: { page: 1, pageSize: 15, totalItems: 0, totalPages: 1 } }
    }
    return { range: null, items: [] }
  }

  const envelope = await apiClient.get(`/me/punches${buildQuery(params)}`)
  if (envelope?.meta) {
    return {
      items: envelope.data?.items ?? [],
      meta: envelope.meta,
      range: envelope.data?.range ?? null,
    }
  }
  return envelope?.data ?? { range: null, items: [] }
}

export async function getMyNews(params = {}) {
  if (!isApiMode()) {
    if (params.page) {
      return {
        stats: { pending: 1, approved: 2, rejected: 0 },
        items: [],
        meta: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
      }
    }
    return { range: null, stats: { pending: 0, approved: 0, rejected: 0 }, items: [] }
  }

  const envelope = await apiClient.get(`/me/news${buildQuery(params)}`)
  if (envelope?.meta) {
    return {
      stats: envelope.data?.stats ?? {},
      items: envelope.data?.items ?? [],
      meta: envelope.meta,
      range: envelope.data?.range ?? null,
    }
  }
  return envelope?.data ?? { range: null, stats: { pending: 0, approved: 0, rejected: 0 }, items: [] }
}

export async function getMySummary(params = {}) {
  if (!isApiMode()) return null
  const envelope = await apiClient.get(`/me/summary${buildQuery(params)}`)
  return envelope?.data ?? null
}

export async function createMyNewsRequest(payload) {
  if (!isApiMode()) return { ok: true, ...payload }
  const res = await apiClient.post('/me/news', payload)
  return res.data
}

export async function createMyPunch({ tipo }) {
  if (!isApiMode()) {
    return {
      punch: { timestamp: new Date().toISOString(), type: tipo, origin: 'Api' },
      employee: { name: 'Carlos Ramírez', legajo: '0001' },
    }
  }
  const res = await apiClient.post('/me/punches', { tipo })
  return res.data
}
