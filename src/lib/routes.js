export const routes = {
  dashboard: '/',
  login: '/login',
  miArea: '/mi-area',
  miFichadas: '/mi-area/fichadas',
  miNovedades: '/mi-area/novedades',
  miFichar: '/mi-area/fichar',
  empleados: '/empleados',
  empleadoDetalle: '/empleados/:id',
  empleadoJuanPerez: '/empleados/juan-perez',
  fichadas: '/fichadas',
  fichar: '/fichar',
  horarios: '/horarios',
  novedades: '/novedades',
  cierre: '/cierre',
  exportaciones: '/exportaciones',
}

export const primaryNavigation = [
  { label: 'Dashboard', icon: 'dashboard', to: routes.dashboard },
  { label: 'Empleados', icon: 'groups', to: routes.empleados },
  { label: 'Horarios', icon: 'calendar_today', to: routes.horarios },
  { label: 'Fichadas', icon: 'fingerprint', to: routes.fichadas },
  { label: 'Novedades', icon: 'notification_important', to: routes.novedades },
  { label: 'Cierre mensual', icon: 'payments', to: routes.cierre },
  { label: 'Exportaciones', icon: 'output', to: routes.exportaciones },
]

export const employeeNavigation = [
  { label: 'Mi resumen', icon: 'dashboard', to: routes.miArea },
  { label: 'Mis fichadas', icon: 'fingerprint', to: routes.miFichadas },
  { label: 'Mis novedades', icon: 'notification_important', to: routes.miNovedades },
]
