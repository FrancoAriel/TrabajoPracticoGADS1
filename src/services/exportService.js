import { isApiMode } from '../config/env'
import { env } from '../config/env'
import { mockExports } from '../data/mock/exports'
import { apiClient } from '../lib/apiClient'

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
  if (downloadUrl.startsWith('/api/')) return downloadUrl
  if (downloadUrl.startsWith('/')) return `${base}${downloadUrl}`
  return `${base}/${downloadUrl}`
}
