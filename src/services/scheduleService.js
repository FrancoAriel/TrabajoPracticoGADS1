import { isApiMode } from '../config/env'
import { apiClient } from '../lib/apiClient'

/** Catálogo (horarios, ciclos) desde GET /catalogs */
export async function getLaborCatalogs() {
  if (!isApiMode()) return { horarios: [], ciclos: [], tiposHorario: [] }
  const envelope = await apiClient.get('/catalogs')
  return envelope?.data ?? { horarios: [], ciclos: [] }
}

/** Resumen (+ tablas) desde GET /schedules/overview */
export async function getSchedulesOverview(params = {}) {
  if (!isApiMode()) {
    return {
      stats: null,
      schedules: [],
      cycles: [],
      assignments: [],
      meta: { page: 1, pageSize: Number(params.pageSize) || 10, totalItems: 0, totalPages: 1 },
    }
  }

  const sp = new URLSearchParams()
  if (params.tab) sp.set('tab', params.tab)
  if (params.search != null && params.search !== '') sp.set('search', String(params.search))
  if (params.page) sp.set('page', String(params.page))
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  if (params.tipo) sp.set('tipo', params.tipo)
  if (params.assignmentKind) sp.set('assignmentKind', params.assignmentKind)
  if (params.assignmentStatus) sp.set('assignmentStatus', params.assignmentStatus)
  if (params.estado) sp.set('estado', params.estado)
  const qs = sp.toString()
  const envelope = await apiClient.get(`/schedules/overview${qs ? `?${qs}` : ''}`)
  const d = envelope?.data ?? {}
  return {
    stats: d.stats ?? null,
    schedules: d.schedules ?? [],
    cycles: d.cycles ?? [],
    assignments: d.assignments ?? [],
    meta: envelope?.meta ?? { page: 1, pageSize: Number(params.pageSize) || 10, totalItems: 0, totalPages: 1 },
  }
}

export async function createSchedule(body) {
  if (!isApiMode()) throw new Error('Solo modo API')
  const j = await apiClient.post('/schedules', body)
  return j.data
}

export async function updateSchedule(idHorario, body) {
  if (!isApiMode()) throw new Error('Solo modo API')
  const j = await apiClient.patch(`/schedules/${idHorario}`, body)
  return j.data
}

export async function createCycle(body) {
  if (!isApiMode()) throw new Error('Solo modo API')
  const j = await apiClient.post('/schedules/cycles', body)
  return j.data
}

export async function updateCycle(idCiclo, body) {
  if (!isApiMode()) throw new Error('Solo modo API')
  const j = await apiClient.patch(`/schedules/cycles/${idCiclo}`, body)
  return j.data
}

export async function createScheduleAssignment(body) {
  if (!isApiMode()) throw new Error('Solo modo API')
  const j = await apiClient.post('/schedules/assignments', body)
  return j.data
}

export async function updateScheduleAssignment(idAsignacion, body) {
  if (!isApiMode()) throw new Error('Solo modo API')
  const j = await apiClient.patch(`/schedules/assignments/${idAsignacion}`, body)
  return j.data
}

export async function updateCycleAssignment(empleadoCicloId, body) {
  if (!isApiMode()) throw new Error('Solo modo API')
  const j = await apiClient.patch(`/schedules/cycle-assignments/${empleadoCicloId}`, body)
  return j.data
}
