export const mockDashboard = {
  heroMetrics: [
    { key: 'activeEmployees', label: 'Empleados activos', value: '42', unit: '', icon: 'groups', valueClassName: 'text-on-secondary-container', iconClassName: 'text-on-secondary-container/5' },
    { key: 'monthHours', label: 'Horas del mes', value: '1,240', unit: 'hs', icon: 'more_time', valueClassName: 'text-primary', iconClassName: 'text-primary/5' },
    { key: 'pendingNews', label: 'Novedades pendientes', value: '9', unit: '', icon: 'pending_actions', valueClassName: 'text-tertiary', iconClassName: 'text-tertiary/5' },
  ],
  currentClosure: { periodLabel: 'Junio', status: 'BORRADOR' },
  dailySummary: [
    { key: 'present', label: 'Presentes', value: '34', suffix: '/ 37', valueClassName: 'text-on-secondary-container' },
    { key: 'absent', label: 'Ausentes', value: '3', icon: 'person_off', valueClassName: 'text-error', iconClassName: 'text-error' },
    { key: 'late', label: 'Tardanzas', value: '7', icon: 'schedule', valueClassName: 'text-tertiary', iconClassName: 'text-tertiary' },
    { key: 'double', label: 'Doble fichada', value: '2', icon: 'error_outline', valueClassName: 'text-primary', iconClassName: 'text-primary' },
    { key: 'he50Today', label: 'HE 50% hoy', value: '4h 30m', valueClassName: 'text-on-background' },
    { key: 'he100Today', label: 'HE 100% hoy', value: '1h 00m', valueClassName: 'text-on-background' },
    { key: 'pendingPunch', label: 'Sin fichar aun', value: '12', icon: 'hourglass_empty', valueClassName: 'text-on-surface-variant', iconClassName: 'text-on-surface-variant' },
    { key: 'license', label: 'Con licencia', value: '4', icon: 'beach_access', valueClassName: 'text-on-secondary-container', iconClassName: 'text-on-secondary-container' },
  ],
  alerts: [
    { id: 'alert_1', name: 'Juan Perez',  legajo: 'Leg. 0042', status: 'Tardanza 6 min',          icon: 'warning',      border: 'border-error',    accent: 'text-error',    badge: 'bg-error/5 border-error/20 text-error',       filled: true, route: '/empleado/juan-perez' },
    { id: 'alert_2', name: 'Ana Gomez',   legajo: 'Leg. 0018', status: 'Doble fichada de entrada', icon: 'sync_problem', border: 'border-primary',  accent: 'text-primary',  badge: 'bg-primary/5 border-primary/20 text-primary', filled: true },
    { id: 'alert_3', name: 'Luis Diaz',   legajo: 'Leg. 0031', status: 'Posible ausencia',         icon: 'person_alert', border: 'border-error',    accent: 'text-error',    badge: 'bg-error/5 border-error/20 text-error',       filled: true },
    { id: 'alert_4', name: 'Carla Ruiz',  legajo: 'Leg. 0050', status: 'Descanso excedido',        icon: 'coffee',       border: 'border-tertiary', accent: 'text-tertiary', badge: 'bg-tertiary/5 border-tertiary/20 text-tertiary', filled: true },
    { id: 'alert_5', name: 'Martin Sosa', legajo: 'Leg. 0027', status: 'Salida anticipada',        icon: 'exit_to_app',  border: 'border-tertiary', accent: 'text-tertiary', badge: 'bg-tertiary/5 border-tertiary/20 text-tertiary', filled: true },
  ],
  periodStatus: {
    period: 'Junio 2025', businessDaysElapsed: '9 / 21', progressPercent: 43, he50: '42h 15m', he100: '8h 00m', unjustifiedAbsences: '3', closureStatusLabel: 'Cierre en borrador - sin cerrar',
  },
  recentActivity: [
    { initials: 'JP', name: 'Juan Perez', detail: 'Entrada · 09:15', status: 'Tardanza', avatar: 'bg-primary', statusClassName: 'text-tertiary' },
    { initials: 'CR', name: 'Carla Ruiz', detail: 'Entrada · 08:58', status: 'Normal', avatar: 'bg-secondary', statusClassName: 'text-green-600' },
    { initials: 'AG', name: 'Ana Gomez', detail: 'Entrada · 08:45', status: 'Doble', avatar: 'bg-tertiary', statusClassName: 'text-primary' },
    { initials: 'MS', name: 'Martin Sosa', detail: 'Salida · 08:40', status: 'Anticipada', avatar: 'bg-on-surface-variant', statusClassName: 'text-tertiary' },
    { initials: 'LD', name: 'Luis Diaz', detail: 'Sin registrar · Ausente', status: 'Ausente', avatar: 'bg-error', statusClassName: 'text-error' },
  ],
  pendingNewsTable: [
    { id: 'pn_1', legajo: '0042', employee: 'Juan Perez', employeeRoute: '/empleado/juan-perez', type: 'Horas extra 50%', typeClassName: 'bg-tertiary-container/40 text-on-tertiary-container', date: '12/06/2025', quantity: '1h 45m', origin: 'Automatica', route: '/empleado/juan-perez' },
    { id: 'pn_2', legajo: '0018', employee: 'Ana Gomez',  type: 'Justificación',  typeClassName: 'bg-secondary-container/40 text-on-secondary-container', date: '12/06/2025', quantity: '1 día',   origin: 'Manual',     route: '/novedades' },
    { id: 'pn_3', legajo: '0031', employee: 'Luis Diaz',  type: 'Ausencia',       typeClassName: 'bg-error/10 text-error',                                date: '12/06/2025', quantity: '1 día',   origin: 'Automática', route: '/novedades' },
    { id: 'pn_4', legajo: '0050', employee: 'Carla Ruiz', type: 'Tardanza',       typeClassName: 'bg-tertiary-container/40 text-on-tertiary-container',   date: '12/06/2025', quantity: '22 min',  origin: 'Automática', route: '/novedades' },
  ],
}
