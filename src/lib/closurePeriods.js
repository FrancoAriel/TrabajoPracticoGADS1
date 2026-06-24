const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function currentPeriodLabel(date = new Date()) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function isoYmd(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function periodRangeDates(periodLabel) {
  const anchor = parsePeriodLabel(periodLabel)
  if (!anchor) return null
  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  const last = new Date(y, m + 1, 0)
  return {
    desde: `${y}-${String(m + 1).padStart(2, '0')}-01`,
    hasta: `${y}-${String(m + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`,
  }
}

/**
 * Rango sugerido para reprocesar un período.
 * Mes en curso: hasta ayer (días completos). Meses pasados: hasta fin de mes.
 */
export function resolveReprocessRange(periodLabel, periodRange = null, now = new Date()) {
  const range = periodRange?.desde && periodRange?.hasta
    ? { desde: periodRange.desde, hasta: periodRange.hasta }
    : periodRangeDates(periodLabel)
  if (!range) return { desde: '', hasta: '', isCurrentMonth: false, isEmpty: true }

  const calendarCurrent = currentPeriodLabel(now)
  const isCurrentMonth = periodLabel === calendarCurrent
  if (!isCurrentMonth) {
    return { ...range, isCurrentMonth: false, isEmpty: false }
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const hastaAyer = isoYmd(yesterday)

  return {
    desde: range.desde,
    hasta: hastaAyer,
    isCurrentMonth: true,
    isEmpty: hastaAyer < range.desde,
  }
}

function parsePeriodLabel(label) {
  const [monthLabel, yearText] = String(label ?? '').trim().split(/\s+/)
  const monthIndex = MONTHS.findIndex((m) => m.toLowerCase() === String(monthLabel).toLowerCase())
  const year = Number(yearText)
  if (monthIndex < 0 || !Number.isInteger(year)) return null
  return new Date(year, monthIndex, 1)
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function comparePeriods(a, b) {
  const da = parsePeriodLabel(a)
  const db = parsePeriodLabel(b)
  if (!da || !db) return 0
  return da.getTime() - db.getTime()
}

/** Tarjetas de navegación: mes anterior | período en vista | mes siguiente. */
export function buildNavPeriodCards(viewedPeriod, availablePeriods = [], history = []) {
  const anchorLabel = viewedPeriod || currentPeriodLabel()
  const anchorDate = parsePeriodLabel(anchorLabel)
  if (!anchorDate) return []

  const calendarCurrent = currentPeriodLabel()
  const closed = new Set(
    (history ?? []).map((h) => h.periodo ?? h.label).filter(Boolean),
  )
  const metaByLabel = new Map((availablePeriods ?? []).map((p) => [p.label, p]))

  return [-1, 0, 1].map((delta) => {
    const label = currentPeriodLabel(addMonths(anchorDate, delta))
    const meta = metaByLabel.get(label)
    const isFuture = meta?.isFuture ?? comparePeriods(label, calendarCurrent) > 0

    let status = 'Pendiente'
    if (isFuture) status = 'Futuro'
    else if (closed.has(label) || meta?.status === 'Cerrado') status = 'Cerrado'
    else if (meta?.status) status = meta.status
    else if (label === calendarCurrent) status = 'En progreso'

    return {
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      status,
      isFuture,
    }
  })
}
