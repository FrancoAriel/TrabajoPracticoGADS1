/**
 * Cliente del motor de reglas (backend V4).
 *
 * Endpoints expuestos:
 *  - POST /reasoning/evaluate-day      { fecha, dryRun?, legajos? }
 *  - POST /reasoning/reprocess-range   { desde, hasta, dryRun?, legajos? }
 *
 * El backend devuelve un objeto con:
 *  - totals:    { created, ok, skipped, error }
 *  - byRule:    { tardanza: {...}, salida_anticipada: {...}, ... }
 *  - results:   array completo de evaluaciones (una por regla y empleado/día)
 *  - createdSummary: novedades efectivamente creadas en esta corrida
 */

import { apiClient } from '../lib/apiClient'

/**
 * Evalúa todas las reglas para una fecha concreta.
 * @param {Object} params
 * @param {string} params.fecha YYYY-MM-DD
 * @param {boolean} [params.dryRun=false] Si true, simula sin insertar
 * @param {number[]} [params.legajos] Si se pasa, evalúa solo esos legajos
 */
export function evaluateDay({ fecha, dryRun = false, legajos } = {}) {
  return apiClient.post('/reasoning/evaluate-day', {
    fecha,
    dryRun,
    ...(Array.isArray(legajos) && legajos.length ? { legajos } : {}),
  })
}

/**
 * Reprocesa un rango de fechas. Borra novedades automáticas previas en el rango
 * y regenera. Útil cuando cambian horarios o se corrigen fichadas históricas.
 * @param {Object} params
 * @param {string} params.desde YYYY-MM-DD inclusive
 * @param {string} params.hasta YYYY-MM-DD inclusive
 * @param {boolean} [params.dryRun=false]
 * @param {number[]} [params.legajos]
 */
export function reprocessRange({ desde, hasta, dryRun = false, legajos } = {}) {
  return apiClient.post('/reasoning/reprocess-range', {
    desde,
    hasta,
    dryRun,
    ...(Array.isArray(legajos) && legajos.length ? { legajos } : {}),
  })
}
