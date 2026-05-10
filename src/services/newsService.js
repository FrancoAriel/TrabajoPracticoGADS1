import { isApiMode } from '../config/env'
import { mockNews, mockNewsStats } from '../data/mock/news'
import { apiClient } from '../lib/apiClient'

let newsState = [...mockNews]

export async function listNews(params = {}) {
  if (!isApiMode()) {
    return { stats: mockNewsStats, items: newsState }
  }

  const sp = new URLSearchParams()
  if (params.pageSize) sp.set('pageSize', String(params.pageSize))
  if (params.page) sp.set('page', String(params.page))
  if (params.status) sp.set('status', params.status)
  if (params.type) sp.set('type', params.type)
  if (params.search) sp.set('search', params.search)
  const qs = sp.toString()
  const response = await apiClient.get(`/news${qs ? `?${qs}` : ''}`)
  return response.data
}

export async function createNews(payload) {
  if (!isApiMode()) {
    return { id: `NOV-${100 + newsState.length + 1}`, ...payload }
  }

  const response = await apiClient.post('/news', payload)
  return response.data
}

export async function approveNews(newsId) {
  if (!isApiMode()) {
    newsState = newsState.map((item) => item.id === newsId ? { ...item, status: 'Aprobada' } : item)
    return { success: true }
  }

  const response = await apiClient.post(`/news/${newsId}/approve`, {})
  return response.data
}

export async function rejectNews(newsId, reason) {
  if (!isApiMode()) {
    newsState = newsState.map((item) => item.id === newsId ? { ...item, status: 'Rechazada', rejectionReason: reason } : item)
    return { success: true }
  }

  const response = await apiClient.post(`/news/${newsId}/reject`, { reason })
  return response.data
}
