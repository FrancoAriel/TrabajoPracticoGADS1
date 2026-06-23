import { isApiMode } from '../config/env'
import { env } from '../config/env'
import { mockExports } from '../data/mock/exports'
import { apiClient } from '../lib/apiClient'
import { getAuthToken } from '../lib/session'

export async function getExportOptions() {
  if (!isApiMode()) {
    return mockExports
  }

  const response = await apiClient.get('/exports/options')
  return response.data
}

export async function createExport(payload) {
  if (!isApiMode()) {
    const csv = 'Reporte,Periodo,Formato\nDemo,' + (payload?.period ?? 'Junio 2025') + ',CSV\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    return { exportId: 'exp_mock', downloadUrl: URL.createObjectURL(blob) }
  }

  const response = await apiClient.post('/exports', payload)
  return response.data
}

export function resolveDownloadUrl(downloadUrl) {
  if (!downloadUrl) return '#'
  if (/^(https?:|blob:)/.test(downloadUrl)) return downloadUrl
  const base = env.apiBaseUrl || ''
  const raw = downloadUrl.startsWith('/api/')
    ? downloadUrl
    : downloadUrl.startsWith('/')
      ? `${base}${downloadUrl}`
      : `${base}/${downloadUrl}`
  const token = getAuthToken()
  if (!token || !raw.includes('/exports/')) return raw
  const sep = raw.includes('?') ? '&' : '?'
  return `${raw}${sep}access_token=${encodeURIComponent(token)}`
}
