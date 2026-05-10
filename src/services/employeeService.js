import { isApiMode } from '../config/env'
import { mockEmployeeDetail, mockEmployees, mockEmployeeStats } from '../data/mock/employees'
import { apiClient } from '../lib/apiClient'

let employeesState = [...mockEmployees]

/** Copia editable del detalle mock para que PATCH / refetch reflejen cambios locales */
let mockEmployeeDetailMutable = structuredClone(mockEmployeeDetail)

export async function listEmployees(params = {}) {
  if (!isApiMode()) {
    return { items: employeesState, stats: mockEmployeeStats }
  }

  const sp = new URLSearchParams()
  if (params.page) sp.set('page', String(params.page))
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  if (params.search) sp.set('search', params.search)
  const qs = sp.toString()
  const response = await apiClient.get(`/employees${qs ? `?${qs}` : ''}`)
  return response.data
}

export async function createEmployee(payload) {
  if (!isApiMode()) {
    const nextLegajo = String(Number(employeesState[employeesState.length - 1]?.legajo || '70') + 1).padStart(4, '0')
    const created = {
      id: `emp_${nextLegajo}`,
      legajo: nextLegajo,
      name: `${payload.nombre} ${payload.apellido}`.trim(),
      category: payload.categoria,
      convenio: payload.convenio,
      jornada: payload.jornada,
      schedule: payload.horario,
      status: 'Activo',
    }
    employeesState = [...employeesState, created]
    return created
  }

  const response = await apiClient.post('/employees', payload)
  return response.data
}

export async function getEmployeeDetail(employeeId) {
  if (!isApiMode()) {
    const base = mockEmployeeDetailMutable ?? mockEmployeeDetail
    return { ...base, employee: { ...base.employee, id: employeeId } }
  }

  const response = await apiClient.get(`/employees/${employeeId}`)
  return response.data
}

export async function updateEmployee(employeeId, payload) {
  if (!isApiMode()) {
    const prev = mockEmployeeDetailMutable ?? mockEmployeeDetail
    const e = { ...prev.employee }
    const p = payload
    const nextEstado = p.estado ?? p.status
    if (nextEstado !== undefined) e.status = nextEstado
    if (p.nombre != null || p.apellido != null) {
      const n = p.nombre ?? e.name?.split(' ')?.[0] ?? ''
      const a = p.apellido ?? e.name?.split(' ')?.slice(1)?.join(' ') ?? ''
      e.name = `${n} ${a}`.trim() || e.name
    }
    if (p.dni !== undefined) e.dni = p.dni
    if (p.cuil !== undefined) e.cuil = p.cuil
    if (p.fechaIngreso !== undefined) e.fechaIngreso = p.fechaIngreso
    if (p.categoria !== undefined) e.category = p.categoria
    if (p.convenio !== undefined) e.convenio = p.convenio
    if (p.jornada !== undefined) e.jornada = p.jornada
    if (p.parcialHoras !== undefined) {
      const v = p.parcialHoras
      e.parcialHoras = v === '' || v == null ? null : Number(v)
    }
    if (p.fichada !== undefined) e.modalidadFichada = p.fichada
    mockEmployeeDetailMutable = { ...prev, employee: e }
    return { id: employeeId, ...payload }
  }

  const response = await apiClient.patch(`/employees/${employeeId}`, payload)
  return response.data
}

export async function createEmployeeAssignment(employeeId, payload) {
  if (!isApiMode()) {
    return { success: true, employeeId, ...payload }
  }

  const response = await apiClient.post(`/employees/${employeeId}/assignments`, payload)
  return response.data
}

export async function createEmployeeNews(employeeId, payload) {
  if (!isApiMode()) {
    return { success: true, employeeId, ...payload }
  }

  const response = await apiClient.post(`/employees/${employeeId}/news`, payload)
  return response.data
}

export async function createEmployeeManualPunch(employeeId, payload) {
  if (!isApiMode()) {
    return { success: true, employeeId, ...payload }
  }

  const response = await apiClient.post(`/employees/${employeeId}/manual-punches`, payload)
  return response.data
}
