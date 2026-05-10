export const env = {
  dataSource: import.meta.env.VITE_DATA_SOURCE || 'mock',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
}

export function isApiMode() {
  return env.dataSource === 'api'
}
