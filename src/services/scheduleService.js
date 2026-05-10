import { isApiMode } from '../config/env'
import { mockScheduleOverview } from '../data/mock/schedules'
import { apiClient } from '../lib/apiClient'

export async function getScheduleOverview() {
  if (!isApiMode()) {
    return mockScheduleOverview
  }

  const response = await apiClient.get('/schedules/overview')
  return response.data
}

export async function saveSchedule(payload) {
  if (!isApiMode()) return { success: true, ...payload }
  const response = await apiClient.post('/schedules', payload)
  return response.data
}

export async function saveCycle(payload) {
  if (!isApiMode()) return { success: true, ...payload }
  const response = await apiClient.post('/schedules/cycles', payload)
  return response.data
}

export async function saveAssignment(payload) {
  if (!isApiMode()) return { success: true, ...payload }
  const response = await apiClient.post('/schedules/assignments', payload)
  return response.data
}
