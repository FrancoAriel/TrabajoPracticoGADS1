import { isApiMode } from '../config/env'
import { mockEmployeeDetail, mockEmployees, mockEmployeeStats } from '../data/mock/employees'
import { apiClient } from '../lib/apiClient'

let employeesState = [...mockEmployees]

export async function listEmployees() {
  if (!isApiMode()) {
    return { items: employeesState, stats: mockEmployeeStats }
  }

  const response = await apiClient.get('/employees')
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
    return { ...mockEmployeeDetail, employee: { ...mockEmployeeDetail.employee, id: employeeId } }
  }

  const response = await apiClient.get(`/employees/${employeeId}`)
  return response.data
}

export async function updateEmployee(employeeId, payload) {
  if (!isApiMode()) {
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
