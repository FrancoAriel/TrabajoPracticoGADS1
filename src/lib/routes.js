export const routes = {
  dashboard: '/',
  login: '/login',
  empleados: '/empleados',
  empleadoJuanPerez: '/empleados/juan-perez',
  fichadas: '/fichadas',
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
