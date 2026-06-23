export const ORIGIN_LABEL = {
  Biometrico: 'Biométrico',
  Manual: 'Manual',
  Qr: 'QR',
  Api: 'App móvil',
  Pin: 'Terminal',
}

export const ORIGIN_ICON = {
  Biometrico: 'fingerprint',
  Manual: 'edit_note',
  Qr: 'qr_code',
  Api: 'smartphone',
  Pin: 'keyboard',
}

export const ORIGIN_FILTERS_UI_TO_DB = {
  Biométrico: 'Biometrico',
  'App móvil': 'Api',
  Manual: 'Manual',
  QR: 'Qr',
  Terminal: 'Pin',
}

export const TYPE_LABEL = {
  Licencia: 'Licencia',
  Vacaciones: 'Vacaciones',
  Permiso_especial: 'Permiso especial',
  Justificacion: 'Justificación',
  Tardanza: 'Tardanza',
  Ausencia: 'Ausencia',
  Horas_extra_50: 'Horas extra 50%',
  Horas_extra_100: 'Horas extra 100%',
}

export const TYPE_BADGE = {
  Licencia: 'bg-secondary-container/40 text-on-secondary-container',
  Vacaciones: 'bg-primary-container/40 text-on-primary-container',
  Permiso_especial: 'bg-secondary-container/40 text-on-secondary-container',
  Justificacion: 'bg-secondary-container/40 text-on-secondary-container',
  Tardanza: 'bg-tertiary-container/40 text-on-tertiary-container',
  Ausencia: 'bg-error-container/20 text-error',
}

export function getInitials(name) {
  return String(name ?? '??')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function statusDot(status) {
  const s = String(status ?? '').toLowerCase()
  if (s === 'activo') return 'bg-green-500'
  if (s === 'inactivo') return 'bg-slate-400'
  if (s === 'suspendido') return 'bg-amber-500'
  return 'bg-slate-400'
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 16).replace('T', ' ')
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function formatLongDate(date = new Date()) {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`
}

export function formatQty(cantidad, unidad) {
  if (cantidad == null) return '—'
  if (unidad === 'Dias') return `${cantidad} día(s)`
  if (unidad === 'Horas') return `${cantidad} hs`
  if (unidad === 'Minutos') return `${cantidad} min`
  return String(cantidad)
}

export function mapEstadoUi(estado) {
  if (estado === 'Aprobada') return 'Aprobado'
  if (estado === 'Rechazada') return 'Rechazado'
  if (estado === 'Pendiente') return 'Pendiente'
  return estado
}

export function tipoUiKey(tipo) {
  return String(tipo ?? '').toLowerCase()
}
