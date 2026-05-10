const dataSource = import.meta.env.VITE_DATA_SOURCE || 'mock'
const rawApiBase = import.meta.env.VITE_API_BASE_URL

/**
 * Con VITE_DATA_SOURCE=api, si no definís URL, usamos `/api` para el proxy de Vite → backend.
 * Así `fetch('/api/dashboard')` no va al puerto de Vite por error.
 */
export const env = {
  dataSource,
  apiBaseUrl:
    rawApiBase != null && String(rawApiBase).trim() !== ''
      ? String(rawApiBase).replace(/\/$/, '')
      : dataSource === 'api'
        ? '/api'
        : '',
}

export function isApiMode() {
  return env.dataSource === 'api'
}
