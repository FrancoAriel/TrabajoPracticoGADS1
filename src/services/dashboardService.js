import { isApiMode } from '../config/env'
import { mockDashboard } from '../data/mock/dashboard'
import { apiClient } from '../lib/apiClient'
import { routes } from '../lib/routes'
import { listNews } from './newsService'
import { listEmployees } from './employeeService'
import { listPunches } from './punchService'

const TYPE_LABEL = {
  horas_extra_50: 'Horas extra 50%',
  horas_extra_100: 'Horas extra 100%',
  justificacion: 'Justificación',
  ausencia: 'Ausencia',
  tardanza: 'Tardanza',
  suspension: 'Suspensión',
  licencia: 'Licencia',
  licencia_enfermedad: 'Licencia enfermedad',
  licencia_examen: 'Licencia examen',
  vacaciones: 'Vacaciones',
  permiso_especial: 'Permiso especial',
  salida_anticipada: 'Salida anticipada',
  horas_faltantes: 'Horas faltantes',
  doble_fichada: 'Doble fichada',
}

const TYPE_BADGE = {
  horas_extra_50: 'bg-tertiary-container/40 text-on-tertiary-container',
  horas_extra_100: 'bg-primary-container/40 text-on-primary-container',
  justificacion: 'bg-secondary-container/40 text-on-secondary-container',
  ausencia: 'bg-error/10 text-error',
  tardanza: 'bg-tertiary-container/40 text-on-tertiary-container',
  suspension: 'bg-error-container/20 text-error',
  licencia: 'bg-secondary-container/40 text-on-secondary-container',
  licencia_enfermedad: 'bg-secondary-container/40 text-on-secondary-container',
  licencia_examen: 'bg-secondary-container/40 text-on-secondary-container',
  vacaciones: 'bg-primary-container/40 text-on-primary-container',
  permiso_especial: 'bg-secondary-container/40 text-on-secondary-container',
  salida_anticipada: 'bg-tertiary-container/40 text-on-tertiary-container',
  horas_faltantes: 'bg-tertiary-container/40 text-on-tertiary-container',
  doble_fichada: 'bg-secondary-container/40 text-on-secondary-container',
}

function mapApiTipoToFilterKey(tipo) {
  if (!tipo) return ''
  return String(tipo).toLowerCase()
}

function formatApiDate(isoDate) {
  if (!isoDate) return '—'
  const [y, m, d] = String(isoDate).split('-')
  if (!y || !m || !d) return isoDate
  return `${d}/${m}/${y}`
}

function formatNewsQuantity(c, u) {
  if (c == null || c === '') return '—'
  const n = Number(c)
  if (u === 'Minutos') return `${Number.isFinite(n) ? Math.round(n) : c} min`
  if (u === 'Horas') return `${c} hs`
  if (u === 'Dias') return `${c} día(s)`
  return String(c)
}

function mapOriginToUi(o) {
  if (o === 'Automatica') return 'Automática'
  if (o === 'Manual') return 'Manual'
  return o || '—'
}

function isPendingNewsStatus(status) {
  if (status == null) return false
  const s = String(status).trim().toLowerCase()
  return s === 'pendiente' || s === 'pending'
}

function mapNewsRowForDashboard(n) {
  const uiType = mapApiTipoToFilterKey(n.type)
  const legajo = String(n.employeeId ?? '').padStart(4, '0')
  const employeeId = n.employeeId ?? n.employee_id
  return {
    id: n.id,
    legajo,
    employee: n.employee ?? '—',
    employeeRoute: employeeId != null ? `/empleados/${employeeId}` : undefined,
    type: TYPE_LABEL[uiType] || n.type || '—',
    typeClassName: TYPE_BADGE[uiType] || 'bg-surface-container text-on-surface-variant',
    date: formatApiDate(n.date),
    quantity: formatNewsQuantity(n.quantity, n.unit),
    origin: mapOriginToUi(n.origin),
    route: routes.novedades,
  }
}

function localDateISO(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function newsDateMatchesToday(raw, todayIso) {
  if (raw == null) return false
  const normalized = String(raw).trim()
  const head = normalized.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head === todayIso
  const t = Date.parse(normalized)
  if (!Number.isNaN(t)) return localDateISO(new Date(t)) === todayIso
  return false
}

function newsDateMatchesMonth(raw, reference = new Date()) {
  if (raw == null) return false
  const normalized = String(raw).trim()
  const head = normalized.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(head)) {
    const year = Number(head.slice(0, 4))
    const month = Number(head.slice(5, 7)) - 1
    return year === reference.getFullYear() && month === reference.getMonth()
  }
  const time = Date.parse(normalized)
  if (Number.isNaN(time)) return false
  const parsed = new Date(time)
  return parsed.getFullYear() === reference.getFullYear() && parsed.getMonth() === reference.getMonth()
}

function alertVisualForUiType(uiType) {
  if (uiType === 'ausencia' || uiType === 'suspension') {
    return { icon: 'person_alert', border: 'border-error', accent: 'text-error', badge: 'bg-error/5 border-error/20 text-error' }
  }
  if (uiType === 'tardanza' || uiType === 'salida_anticipada' || uiType === 'horas_faltantes') {
    return { icon: 'schedule', border: 'border-tertiary', accent: 'text-tertiary', badge: 'bg-tertiary/5 border-tertiary/20 text-tertiary' }
  }
  if (uiType === 'doble_fichada') {
    return { icon: 'sync_problem', border: 'border-primary', accent: 'text-primary', badge: 'bg-primary/5 border-primary/20 text-primary' }
  }
  if (uiType === 'horas_extra_50' || uiType === 'horas_extra_100') {
    return { icon: 'more_time', border: 'border-primary', accent: 'text-primary', badge: 'bg-primary/5 border-primary/20 text-primary' }
  }
  return { icon: 'edit_notifications', border: 'border-secondary', accent: 'text-on-secondary-container', badge: 'bg-secondary/5 border-secondary/20 text-on-secondary-container' }
}

function mapNewsToAlert(n) {
  const uiType = mapApiTipoToFilterKey(n.type)
  const label = TYPE_LABEL[uiType] || n.type || 'Novedad'
  const qty = formatNewsQuantity(n.quantity, n.unit)
  const statusText = qty && qty !== '—' ? `${label} · ${qty}` : label
  const legajoStr = String(n.employeeId ?? '').padStart(4, '0')
  const employeeId = n.employeeId ?? n.employee_id
  const vis = alertVisualForUiType(uiType)
  return {
    id: n.id != null ? String(n.id) : `${legajoStr}-${label}-${statusText}`,
    name: n.employee ?? '—',
    legajo: `Leg. ${legajoStr}`,
    status: statusText,
    route: employeeId != null ? `/empleados/${employeeId}` : routes.novedades,
    filled: true,
    ...vis,
  }
}

function initialsFrom(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '—'
}

const AVATAR_CYCLE = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-on-surface-variant', 'bg-error']

function formatClock(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function mapPunchToRecent(api, index) {
  const name = api.employeeName || api.empleado || api.employee || 'Sin datos'
  const tipo = (api.type ?? api.tipo ?? '—').trim() || '—'
  return {
    key: api.id != null ? String(api.id) : `p-${api.employeeId}-${api.timestamp}-${index}`,
    initials: initialsFrom(name),
    name,
    detail: `${tipo} · ${formatClock(api.timestamp)}`,
    status: tipo,
    avatar: AVATAR_CYCLE[(Number(api.legajo) || index) % AVATAR_CYCLE.length],
    statusClassName: 'text-on-surface-variant',
  }
}

const RECENT_ACTIVITY_LIMIT = 5

function normPunchType(t) {
  return String(t ?? '').trim().toLowerCase()
}

function employeeKey(p) {
  if (p.employeeId != null) return `id:${p.employeeId}`
  if (p.legajo != null) return `leg:${p.legajo}`
  return null
}

function sumHeMinutesFromNews(todayNews, horasExtraUiType) {
  let minutes = 0
  for (const n of todayNews) {
    if (mapApiTipoToFilterKey(n.type) !== horasExtraUiType) continue
    const q = Number(n.quantity)
    if (!Number.isFinite(q) || q < 0) continue
    const u = n.unit
    if (u === 'Horas') minutes += q * 60
    else if (u === 'Minutos') minutes += q
  }
  return minutes
}

function formatHoursMinutesShort(totalMin) {
  if (!totalMin || totalMin < 1) return '0 min'
  const h = Math.floor(totalMin / 60)
  const m = Math.round(totalMin % 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function isLicenciaLikeNews(n) {
  const k = mapApiTipoToFilterKey(n.type)
  return (
    k === 'licencia'
    || k === 'licencia_enfermedad'
    || k === 'licencia_examen'
    || k === 'vacaciones'
    || k === 'permiso_especial'
  )
}

/** Resumen coherente con la data del día (fichadas + novedades + plantilla); no depende solo del GET /dashboard */
function buildDailySummary({ activeTotal, punchItems, todayNewsItems }) {
  const entradaList = punchItems.filter((p) => normPunchType(p.type) === 'entrada')
  const presentKeys = new Set()
  for (const p of entradaList) {
    const k = employeeKey(p)
    if (k) presentKeys.add(k)
  }
  const present = presentKeys.size
  const active = Number(activeTotal) || 0
  const sinFichar = Math.max(0, active - present)

  const entradaCountByKey = new Map()
  for (const p of entradaList) {
    const k = employeeKey(p)
    if (!k) continue
    entradaCountByKey.set(k, (entradaCountByKey.get(k) || 0) + 1)
  }
  let dobleEntradaEmpleados = 0
  entradaCountByKey.forEach((c) => {
    if (c >= 2) dobleEntradaEmpleados += 1
  })

  let tardanzas = 0
  let ausenciasNov = 0
  let licencias = 0
  let dobleFichadasNov = 0
  for (const n of todayNewsItems) {
    const k = mapApiTipoToFilterKey(n.type)
    if (k === 'tardanza') tardanzas += 1
    if (k === 'ausencia') ausenciasNov += 1
    if (k === 'doble_fichada') dobleFichadasNov += 1
    if (isLicenciaLikeNews(n)) licencias += 1
  }

  const he50m = sumHeMinutesFromNews(todayNewsItems, 'horas_extra_50')
  const he100m = sumHeMinutesFromNews(todayNewsItems, 'horas_extra_100')

  return [
    {
      key: 'present',
      label: 'Presentes',
      value: String(present),
      suffix: active > 0 ? `/ ${active}` : '',
      valueClassName: 'text-on-secondary-container',
    },
    {
      key: 'absent',
      label: 'Ausentes',
      value: String(ausenciasNov),
      icon: 'person_off',
      valueClassName: 'text-error',
      iconClassName: 'text-error',
    },
    {
      key: 'late',
      label: 'Tardanzas',
      value: String(tardanzas),
      icon: 'schedule',
      valueClassName: 'text-tertiary',
      iconClassName: 'text-tertiary',
    },
    {
      key: 'double',
      label: 'Doble fichada',
      value: String(Math.max(dobleEntradaEmpleados, dobleFichadasNov)),
      icon: 'error_outline',
      valueClassName: 'text-primary',
      iconClassName: 'text-primary',
    },
    {
      key: 'he50Today',
      label: 'HE 50% hoy',
      value: formatHoursMinutesShort(he50m),
      valueClassName: 'text-on-background',
    },
    {
      key: 'he100Today',
      label: 'HE 100% hoy',
      value: formatHoursMinutesShort(he100m),
      valueClassName: 'text-on-background',
    },
    {
      key: 'pendingPunch',
      label: 'Sin fichar aun',
      value: String(sinFichar),
      icon: 'hourglass_empty',
      valueClassName: 'text-on-surface-variant',
      iconClassName: 'text-on-surface-variant',
    },
    {
      key: 'license',
      label: 'Con licencia',
      value: String(licencias),
      icon: 'beach_access',
      valueClassName: 'text-on-secondary-container',
      iconClassName: 'text-on-secondary-container',
    },
  ]
}

export async function getDashboard() {
  if (!isApiMode()) {
    return mockDashboard
  }

  let base
  try {
    const raw = await apiClient.get('/dashboard')
    base = raw?.data ?? raw
  } catch {
    return null
  }

  const todayIso = localDateISO()

  let newsEnvelope = { items: [] }
  let empEnvelope = { items: [], stats: {} }
  let punchRes = { items: [], stats: null }
  try {
    ;[newsEnvelope, empEnvelope, punchRes] = await Promise.all([
      listNews({ pageSize: 500 }).catch(() => ({ items: [] })),
      listEmployees({ pageSize: 500 }).catch(() => ({ items: [], stats: {} })),
      listPunches({ date: todayIso, pageSize: 500 }).catch(() => ({ items: [], stats: null })),
    ])
  } catch {
    newsEnvelope = { items: [] }
    empEnvelope = { items: [], stats: {} }
    punchRes = { items: [], stats: null }
  }

  const empItems = empEnvelope?.items ?? empEnvelope?.data?.items ?? []
  const stats = empEnvelope?.stats ?? empEnvelope?.data?.stats ?? {}
  const activeTotal =
    stats.active ?? stats.totalActivos ?? empItems.filter((e) => String(e.status).toLowerCase() === 'activo').length

  const rawItems = newsEnvelope?.items ?? newsEnvelope?.data?.items ?? []
  const pendingItems = rawItems.filter((n) => isPendingNewsStatus(n.status))
  const todayNewsItems = rawItems.filter((n) => newsDateMatchesToday(n.date, todayIso))
  const monthNewsItems = rawItems.filter((n) => newsDateMatchesMonth(n.date))
  const monthHe50 = sumHeMinutesFromNews(monthNewsItems, 'horas_extra_50')
  const monthHe100 = sumHeMinutesFromNews(monthNewsItems, 'horas_extra_100')
  const monthDoublePunches = monthNewsItems.filter((n) => mapApiTipoToFilterKey(n.type) === 'doble_fichada').length

  let punchItems = punchRes?.items ?? []
  punchItems = [...punchItems].sort((a, b) => {
    const ta = new Date(a.timestamp).getTime()
    const tb = new Date(b.timestamp).getTime()
    return Number.isFinite(tb) && Number.isFinite(ta) ? tb - ta : 0
  })

  const dailySummary = buildDailySummary({
    activeTotal,
    punchItems,
    todayNewsItems,
  })

  const recentSlice = punchItems.slice(0, RECENT_ACTIVITY_LIMIT)

  return {
    ...base,
    dailySummarySource: 'api',
    dailySummary,
    periodStatus: {
      ...(base?.periodStatus || {}),
      he50: formatHoursMinutesShort(monthHe50),
      he100: formatHoursMinutesShort(monthHe100),
      doublePunches: String(monthDoublePunches),
    },
    pendingNewsSource: 'api',
    pendingNewsTable: pendingItems.map(mapNewsRowForDashboard),
    pendingNewsCount: pendingItems.length,
    alertsSource: 'api',
    alerts: todayNewsItems.map(mapNewsToAlert),
    recentActivitySource: 'api',
    recentActivity: recentSlice.map((p, i) => mapPunchToRecent(p, i)),
  }
}
