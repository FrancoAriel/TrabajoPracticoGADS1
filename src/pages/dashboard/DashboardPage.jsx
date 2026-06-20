import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import { routes } from '../../lib/routes'
import { isApiMode } from '../../config/env'
import { getDashboard } from '../../services/dashboardService'

const fallbackHeroMetrics = [
  {
    label: 'Empleados activos',
    value: '42',
    icon: 'groups',
    valueClassName: 'text-on-secondary-container',
    iconClassName: 'text-on-secondary-container/5',
  },
  {
    label: 'Horas del mes',
    value: (
      <>
        1,240<span className="ml-1 text-sm font-medium">hs</span>
      </>
    ),
    icon: 'more_time',
    valueClassName: 'text-primary',
    iconClassName: 'text-primary/5',
  },
  {
    label: 'Novedades pendientes',
    value: '9',
    icon: 'pending_actions',
    valueClassName: 'text-tertiary',
    iconClassName: 'text-tertiary/5',
  },
]

const fallbackDailySummary = [
  { label: 'Presentes', value: '34', suffix: '/ 37', valueClassName: 'text-on-secondary-container' },
  { label: 'Ausentes', value: '3', icon: 'person_off', valueClassName: 'text-error', iconClassName: 'text-error' },
  { label: 'Tardanzas', value: '7', icon: 'schedule', valueClassName: 'text-tertiary', iconClassName: 'text-tertiary' },
  { label: 'Doble fichada', value: '2', icon: 'error_outline', valueClassName: 'text-primary', iconClassName: 'text-primary' },
  { label: 'HE 50% hoy', value: '4h 30m', valueClassName: 'text-on-background' },
  { label: 'HE 100% hoy', value: '1h 00m', valueClassName: 'text-on-background' },
  { label: 'Sin fichar aun', value: '12', icon: 'hourglass_empty', valueClassName: 'text-on-surface-variant', iconClassName: 'text-on-surface-variant' },
  { label: 'Con licencia', value: '4', icon: 'beach_access', valueClassName: 'text-on-secondary-container', iconClassName: 'text-on-secondary-container' },
]

const fallbackAlerts = [
  { name: 'Juan Perez', legajo: 'Leg. 0042', status: 'Tardanza 6 min', icon: 'warning', border: 'border-error', accent: 'text-error', badge: 'bg-error/5 border-error/20 text-error', route: routes.empleadoJuanPerez, filled: true },
  { name: 'Ana Gomez', legajo: 'Leg. 0018', status: 'Doble fichada de entrada', icon: 'sync_problem', border: 'border-primary', accent: 'text-primary', badge: 'bg-primary/5 border-primary/20 text-primary', filled: true },
  { name: 'Luis Diaz', legajo: 'Leg. 0031', status: 'Posible ausencia', icon: 'person_alert', border: 'border-error', accent: 'text-error', badge: 'bg-error/5 border-error/20 text-error', filled: true },
  { name: 'Carla Ruiz', legajo: 'Leg. 0050', status: 'Descanso excedido', icon: 'coffee', border: 'border-tertiary', accent: 'text-tertiary', badge: 'bg-tertiary/5 border-tertiary/20 text-tertiary', filled: true },
  { name: 'Martin Sosa', legajo: 'Leg. 0027', status: 'Salida anticipada', icon: 'exit_to_app', border: 'border-tertiary', accent: 'text-tertiary', badge: 'bg-tertiary/5 border-tertiary/20 text-tertiary', filled: true },
]

const fallbackRecentActivity = [
  { initials: 'JP', name: 'Juan Perez', detail: 'Entrada · 09:15', status: 'Tardanza', avatar: 'bg-primary', statusClassName: 'text-tertiary' },
  { initials: 'CR', name: 'Carla Ruiz', detail: 'Entrada · 08:58', status: 'Normal', avatar: 'bg-secondary', statusClassName: 'text-green-600' },
  { initials: 'AG', name: 'Ana Gomez', detail: 'Entrada · 08:45', status: 'Doble', avatar: 'bg-tertiary', statusClassName: 'text-primary' },
  { initials: 'MS', name: 'Martin Sosa', detail: 'Salida · 08:40', status: 'Anticipada', avatar: 'bg-on-surface-variant', statusClassName: 'text-tertiary' },
  { initials: 'LD', name: 'Luis Diaz', detail: 'Sin registrar · Ausente', status: 'Ausente', avatar: 'bg-error', statusClassName: 'text-error' },
]

/** Iconos/estilos por label cuando el API solo devuelve { label, value } */
const heroMetricDefaultsByLabel = Object.fromEntries(
  fallbackHeroMetrics.map((m) => [m.label, m]),
)

const fallbackPendingNews = [
  { legajo: '0042', employee: 'Juan Perez', employeeRoute: routes.empleadoJuanPerez, type: 'Horas extra 50%', typeClassName: 'bg-tertiary-container/40 text-on-tertiary-container', date: '12/06/2025', quantity: '1h 45m', origin: 'Automatica', route: routes.empleadoJuanPerez },
  { legajo: '0018', employee: 'Ana Gomez', type: 'Justificacion', typeClassName: 'bg-secondary-container/40 text-on-secondary-container', date: '12/06/2025', quantity: '1 dia', origin: 'Manual', route: routes.novedades },
  { legajo: '0031', employee: 'Luis Diaz', type: 'Ausencia', typeClassName: 'bg-error/10 text-error', date: '12/06/2025', quantity: '1 dia', origin: 'Automatica', route: routes.novedades },
  { legajo: '0050', employee: 'Carla Ruiz', type: 'Tardanza', typeClassName: 'bg-tertiary-container/40 text-on-tertiary-container', date: '12/06/2025', quantity: '22 min', origin: 'Automatica', route: routes.novedades },
]

function getDashboardDates() {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const mesesCortos = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const today = new Date()
  const day = today.getDate()
  const month = today.getMonth()
  const year = today.getFullYear()

  return {
    long: `${dias[today.getDay()]}, ${day} de ${meses[month]} de ${year}`,
    short: `${day} ${mesesCortos[month]} ${year}`,
  }
}

/** Días hábiles lun–vie entre dos fechas (inclusive), en calendario local */
function countWeekdaysInclusive(startDay, endDay) {
  let n = 0
  const cur = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate())
  const end = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate())
  while (cur <= end) {
    const wd = cur.getDay()
    if (wd !== 0 && wd !== 6) n += 1
    cur.setDate(cur.getDate() + 1)
  }
  return n
}

/** Período = mes calendario actual; progreso sobre días hábiles del mes */
function getMonthPeriodStats(reference = new Date()) {
  const y = reference.getFullYear()
  const m = reference.getMonth()
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const monthStart = new Date(y, m, 1)
  const monthEnd = new Date(y, m + 1, 0)
  const totalBd = countWeekdaysInclusive(monthStart, monthEnd)
  const elapsedBd = countWeekdaysInclusive(monthStart, reference)
  const periodLabel = `${meses[m]} ${y}`
  const progressPercent = totalBd > 0 ? Math.min(100, Math.round((elapsedBd / totalBd) * 100)) : 0

  return {
    periodLabel,
    businessDaysElapsedText: `${elapsedBd} / ${totalBd}`,
    progressPercent,
  }
}

function HeroMetricCard({ metric }) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-surface-container-highest p-5">
      <p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{metric.label}</p>
      <h3 className={`font-headline text-2xl font-black ${metric.valueClassName}`}>
        {metric.value}
        {metric.unit && <span className="ml-1 text-sm font-medium">{metric.unit}</span>}
      </h3>
      <span className={`material-symbols-outlined absolute -bottom-2 -right-2 text-6xl transition-transform group-hover:scale-110 ${metric.iconClassName}`}>
        {metric.icon}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const dashboardDates = useMemo(() => getDashboardDates(), [])
  const monthPeriod = useMemo(() => getMonthPeriodStats(new Date()), [])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(() => isApiMode())

  useEffect(() => {
    document.title = 'Labor Pulse - Dashboard'
    let cancelled = false

    getDashboard()
      .then((data) => {
        if (!cancelled) setDashboard(data ?? null)
      })
      .catch(() => {
        if (!cancelled) setDashboard(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const heroMetrics = useMemo(() => {
    const raw = dashboard?.heroMetrics
    const baseList = raw?.length ? raw : fallbackHeroMetrics
    const mapped = baseList.map((m) => {
      const fb = heroMetricDefaultsByLabel[m.label] ?? {}
      const value = m.value != null && typeof m.value !== 'object' ? m.value : fb.value
      return {
        ...fb,
        ...m,
        label: m.label,
        value,
        icon: m.icon ?? fb.icon,
        valueClassName: m.valueClassName ?? fb.valueClassName,
        iconClassName: m.iconClassName ?? fb.iconClassName,
        unit: m.unit ?? fb.unit,
      }
    })
    if (dashboard?.pendingNewsSource === 'api' && dashboard.pendingNewsCount != null) {
      return mapped.map((m) =>
        m.label === 'Novedades pendientes' || m.key === 'pendingNews'
          ? { ...m, value: String(dashboard.pendingNewsCount) }
          : m,
      )
    }
    return mapped
  }, [dashboard])

  const dailySummary =
    dashboard?.dailySummarySource === 'api'
      ? (Array.isArray(dashboard.dailySummary) && dashboard.dailySummary.length > 0
          ? dashboard.dailySummary
          : fallbackDailySummary)
      : dashboard?.dailySummary && dashboard.dailySummary.length > 0
        ? dashboard.dailySummary
        : fallbackDailySummary
  const alerts =
    dashboard?.alertsSource === 'api'
      ? (Array.isArray(dashboard.alerts) ? dashboard.alerts : [])
      : dashboard?.alerts && dashboard.alerts.length > 0
        ? dashboard.alerts
        : fallbackAlerts
  const recentActivity =
    dashboard?.recentActivitySource === 'api'
      ? (Array.isArray(dashboard.recentActivity) ? dashboard.recentActivity : [])
      : dashboard?.recentActivity && dashboard.recentActivity.length > 0
        ? dashboard.recentActivity
        : fallbackRecentActivity
  const pendingNews =
    dashboard?.pendingNewsSource === 'api'
      ? (Array.isArray(dashboard.pendingNewsTable) ? dashboard.pendingNewsTable : [])
      : dashboard?.pendingNewsTable?.length > 0
        ? dashboard.pendingNewsTable
        : fallbackPendingNews
  const periodStatus = useMemo(
    () => ({
      ...(dashboard?.periodStatus || {}),
      period: monthPeriod.periodLabel,
      businessDaysElapsed: monthPeriod.businessDaysElapsedText,
      progressPercent: monthPeriod.progressPercent,
    }),
    [dashboard?.periodStatus, monthPeriod],
  )

  const currentClosure = useMemo(
    () => ({
      ...(dashboard?.currentClosure || {}),
      periodLabel: monthPeriod.periodLabel,
    }),
    [dashboard?.currentClosure, monthPeriod],
  )

  if (loading && isApiMode()) {
    return (
      <AppShell topbarTitle="DASHBOARD">
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
          <p className="text-sm font-semibold">Cargando dashboard...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell topbarTitle="DASHBOARD">
      <PageHeader
        title="Dashboard"
        subtitle={dashboardDates.long}
        actions={
          <>
            <Link
              to={routes.fichadas}
              className="rounded-md border border-slate-200/50 bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">fingerprint</span>
                Ver fichadas
              </span>
            </Link>
            <Link to={routes.novedades} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">notification_important</span>
                Ver novedades
              </span>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-4 gap-4">
        {heroMetrics.map((metric) => (
          <HeroMetricCard key={metric.label} metric={metric} />
        ))}
        <Link to={routes.cierre} className="group relative block overflow-hidden rounded-lg bg-on-background dark:bg-surface-container-highest p-5 transition-colors hover:bg-slate-800 dark:hover:bg-surface-container-high">
          <p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-slate-400">Cierre actual</p>
          <h3 className="flex items-center gap-2 font-headline text-2xl font-black text-white">
            {currentClosure?.periodLabel || monthPeriod.periodLabel}{' '}
            <span className="text-[10px] font-normal opacity-50">{currentClosure?.status || 'BORRADOR'}</span>
          </h3>
          <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-6xl text-white/5 transition-transform group-hover:scale-110">
            payments
          </span>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-5 lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm">analytics</span>
                RESUMEN DEL DIA
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{dashboardDates.short}</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-100 md:grid-cols-4">
              {dailySummary.map((item) => (
                <div key={item.label} className="bg-surface-container-lowest p-5 transition-colors hover:bg-slate-50">
                  <p className="mb-1.5 text-[10px] font-bold uppercase text-on-surface-variant">{item.label}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-headline text-2xl font-black ${item.valueClassName}`}>{item.value}</span>
                    {item.suffix ? <span className="text-[10px] font-bold text-on-surface-variant">{item.suffix}</span> : null}
                    {item.icon ? <span className={`material-symbols-outlined text-sm ${item.iconClassName}`}>{item.icon}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm text-error">campaign</span>
                ALERTAS DEL DIA
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {alerts.length === 0 && dashboard?.alertsSource === 'api' ? (
                <p className="px-5 py-8 text-center text-sm text-on-surface-variant">No hay novedades registradas para hoy.</p>
              ) : null}
              {alerts.map((alert) => {
                const content = (
                  <>
                    <span className={`material-symbols-outlined text-lg ${alert.accent} ${alert.filled ? "[font-variation-settings:'FILL'_1]" : ''}`}>
                      {alert.icon}
                    </span>
                    <div className="flex-1">
                      <span className="text-sm font-bold">{alert.name}</span>
                      <span className="ml-2 text-xs text-on-surface-variant">{alert.legajo}</span>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${alert.badge}`}>{alert.status}</span>
                  </>
                )

                const className = `flex items-center gap-4 border-l-4 px-5 py-3.5 transition-all hover:bg-slate-50 ${alert.border}`
                const rowKey = alert.id ?? `${alert.name}-${alert.legajo}-${alert.status}`

                if (alert.route) {
                  return (
                    <Link key={rowKey} to={alert.route} className={className}>
                      {content}
                    </Link>
                  )
                }

                return (
                  <div key={rowKey} className={className}>
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-5 lg:col-span-4">
          <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                ESTADO DEL PERIODO
              </h2>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Periodo</span>
                <span className="text-sm font-bold">{periodStatus?.period || monthPeriod.periodLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Dias habiles transcurridos</span>
                <span className="text-sm font-bold">{periodStatus?.businessDaysElapsed || monthPeriod.businessDaysElapsedText}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container-high">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${periodStatus?.progressPercent ?? monthPeriod.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">HE 50% acumuladas</span>
                <span className="text-sm font-bold text-primary">{periodStatus?.he50 || '00h 00m'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">HE 100% acumuladas</span>
                <span className="text-sm font-bold text-primary">{periodStatus?.he100 || '00h 00m'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Dobles fichadas</span>
                <span className="text-sm font-bold text-primary">{periodStatus?.doublePunches || '0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">Ausencias sin justificar</span>
                <span className="text-sm font-bold text-error">{periodStatus?.unjustifiedAbsences || '0'}</span>
              </div>
              <div className="border-t border-slate-100 pt-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="text-xs font-bold text-yellow-700">{periodStatus?.closureStatusLabel || 'Cierre en borrador - sin cerrar'}</span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Link to={routes.cierre} className="block w-full rounded-lg bg-on-background dark:bg-primary dark:text-on-primary py-2.5 text-center text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90">
                Ir al cierre mensual
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm">history</span>
                ULTIMA ACTIVIDAD
              </h2>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                En vivo
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {recentActivity.length === 0 && dashboard?.recentActivitySource === 'api' ? (
                <p className="px-5 py-8 text-center text-sm text-on-surface-variant">Sin fichadas registradas hoy.</p>
              ) : null}
              {recentActivity.map((item) => (
                <div key={item.key ?? `${item.name}-${item.detail}`} className="flex items-center gap-3 px-5 py-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${item.avatar}`}>
                    {item.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{item.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{item.detail}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold ${item.statusClassName}`}>{item.status}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 pt-2">
              <Link to={routes.fichadas} className="block w-full py-2 text-center text-xs font-bold text-primary hover:underline">
                Ver todas las fichadas
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
            <span className="material-symbols-outlined text-sm">playlist_add_check</span>
            NOVEDADES PENDIENTES
          </h2>
          <Link to={routes.novedades} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
            Ver todas <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Legajo</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Empleado</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Fecha</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cantidad</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Origen</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingNews.length === 0 && dashboard?.pendingNewsSource === 'api' ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    No hay novedades pendientes.
                  </td>
                </tr>
              ) : null}
              {pendingNews.map((item) => (
                <tr key={item.id ?? `${item.legajo}-${item.type}-${item.date}`} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 text-sm font-medium">{item.legajo}</td>
                  <td className="px-5 py-3.5 text-sm font-bold">
                    {item.employeeRoute ? (
                      <Link to={item.employeeRoute} className="hover:text-primary hover:underline">
                        {item.employee}
                      </Link>
                    ) : (
                      item.employee
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.typeClassName}`}>{item.type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm">{item.date}</td>
                  <td className="px-5 py-3.5 text-sm font-bold">{item.quantity}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-tertiary">
                      <span className="h-1.5 w-1.5 rounded-full bg-tertiary" /> Pendiente
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[10px] font-bold text-on-surface-variant">{item.origin}</td>
                  <td className="px-5 py-3.5">
                    <Link to={item.route} className="rounded border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/5 hover:text-blue-900">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Link to={routes.fichadas} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-primary/90">
          <span className="material-symbols-outlined text-sm">history</span>
          Fichadas del dia
        </Link>
        <Link to={routes.novedades} className="flex items-center gap-2 rounded-lg bg-on-secondary-container dark:bg-primary dark:text-on-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-opacity hover:opacity-90">
          <span className="material-symbols-outlined text-sm">edit_notifications</span>
          Gestionar novedades
        </Link>
        <Link to={routes.cierre} className="flex items-center gap-2 rounded-lg bg-on-background dark:bg-primary dark:text-on-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-opacity hover:opacity-90">
          <span className="material-symbols-outlined text-sm">point_of_sale</span>
          Cierre mensual
        </Link>
        <Link to={routes.exportaciones} className="ml-auto flex items-center gap-2 rounded-lg border border-primary/20 bg-surface-container-lowest px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/5">
          <span className="material-symbols-outlined text-sm">download</span>
          Exportar resumen
        </Link>
      </div>
    </AppShell>
  )
}
