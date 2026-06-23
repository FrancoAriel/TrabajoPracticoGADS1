import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import {
  EmployeeLoadingState,
  EmployeeMetricCard,
  EmployeePanel,
  EmployeeProfileHero,
  EmployeeQuickAction,
  EmployeeStatusPill,
  EmployeeTypeBadge,
} from '../../components/employee/EmployeeUi'
import { isApiMode } from '../../config/env'
import {
  formatDate,
  formatDateTime,
  formatLongDate,
  getInitials,
  ORIGIN_ICON,
  ORIGIN_LABEL,
} from '../../lib/employeePortalUi'
import { routes } from '../../lib/routes'
import { getMyProfile } from '../../services/meService'

function punchAccent(type) {
  return String(type).toLowerCase() === 'entrada' ? 'text-green-600' : 'text-primary'
}

function punchAvatar(type) {
  return String(type).toLowerCase() === 'entrada' ? 'bg-green-600' : 'bg-primary'
}

export default function MiAreaPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(isApiMode())
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Mi resumen - Executive Architect'
    let c = false
    getMyProfile()
      .then((res) => { if (!c) setData(res) })
      .catch((e) => { if (!c) setError(e.message) })
      .finally(() => { if (!c) setLoading(false) })
    return () => { c = true }
  }, [])

  const emp = data?.employee
  const sched = data?.scheduleConfig
  const lastPunch = data?.recentPunches?.[0]

  const statusMetricClass = useMemo(() => {
    const s = String(emp?.status ?? '').toLowerCase()
    if (s === 'activo') return 'text-green-700'
    if (s === 'suspendido') return 'text-amber-700'
    return 'text-on-surface-variant'
  }, [emp?.status])

  return (
    <AppShell topbarTitle="MI RESUMEN">
      {loading && <EmployeeLoadingState message="Cargando tu información..." />}

      {!loading && error && (
        <div className="rounded-xl border border-error/20 bg-error-container/15 px-4 py-3 text-sm text-error">{error}</div>
      )}

      {!loading && !error && emp && (
        <>
          <EmployeeProfileHero
            employee={emp}
            scheduleConfig={sched}
            actions={
              <>
                <Link
                  to={routes.miFichar}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  Fichar ahora
                </Link>
                <Link
                  to={routes.miNovedades}
                  className="rounded-md border border-slate-200/50 bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">assignment_add</span>
                    Nueva solicitud
                  </span>
                </Link>
              </>
            }
          />

          <PageHeader
            title="Resumen personal"
            subtitle={formatLongDate()}
          />

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <EmployeeMetricCard
              label="Estado laboral"
              value={emp.status}
              icon="badge"
              valueClassName={statusMetricClass}
            />
            <EmployeeMetricCard
              label="Novedades pendientes"
              value={data.stats?.pendingNews ?? 0}
              icon="pending_actions"
              valueClassName="text-tertiary"
            />
            <EmployeeMetricCard
              label="Fichadas recientes"
              value={data.stats?.recentPunches ?? data.recentPunches?.length ?? 0}
              icon="fingerprint"
              valueClassName="text-primary"
            />
            <EmployeeMetricCard
              label="Último registro"
              value={lastPunch ? lastPunch.type : '—'}
              icon="schedule"
              valueClassName={lastPunch ? punchAccent(lastPunch.type) : 'text-on-surface-variant'}
            />
          </div>

          <div className="mb-6 flex flex-col gap-3 lg:flex-row">
            <EmployeeQuickAction
              to={routes.miFichar}
              icon="login"
              title="Fichar entrada o salida"
              subtitle="Registro directo desde tu sesión"
              primary
            />
            <EmployeeQuickAction
              to={routes.miNovedades}
              icon="assignment_add"
              title="Solicitar licencia o permiso"
              subtitle="Envío directo a RRHH"
            />
            <EmployeeQuickAction
              to={routes.miFichadas}
              icon="history"
              title="Ver historial completo"
              subtitle="Todas tus fichadas registradas"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EmployeePanel
              icon="history"
              title="ÚLTIMAS FICHADAS"
              action={
                <Link to={routes.miFichadas} className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                  Ver todas
                </Link>
              }
            >
              <div className="divide-y divide-slate-100">
                {(data.recentPunches ?? []).length === 0 ? (
                  <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">fingerprint</span>
                    <p className="text-sm text-on-surface-variant">Todavía no tenés fichadas registradas.</p>
                    <Link to={routes.miFichar} className="text-xs font-bold text-primary hover:underline">Registrar fichada</Link>
                  </div>
                ) : (
                  data.recentPunches.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${punchAvatar(p.type)}`}>
                        {getInitials(p.type?.slice(0, 2))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-on-background">{p.type}</p>
                        <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">{ORIGIN_ICON[p.origin] ?? 'fingerprint'}</span>
                          {ORIGIN_LABEL[p.origin] ?? p.origin}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-on-surface-variant">{formatDateTime(p.timestamp)}</p>
                        <p className={`text-[10px] font-bold uppercase ${punchAccent(p.type)}`}>{p.type}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </EmployeePanel>

            <EmployeePanel
              icon="notification_important"
              title="MIS NOVEDADES"
              action={
                <Link to={routes.miNovedades} className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                  Ver todas
                </Link>
              }
            >
              <div className="divide-y divide-slate-100">
                {(data.recentNews ?? []).length === 0 ? (
                  <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">assignment</span>
                    <p className="text-sm text-on-surface-variant">Sin novedades registradas.</p>
                    <Link to={routes.miNovedades} className="text-xs font-bold text-primary hover:underline">Crear solicitud</Link>
                  </div>
                ) : (
                  data.recentNews.map((n) => (
                    <div key={n.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container/50 text-[10px] font-bold text-on-secondary-container">
                        {getInitials(String(n.type).replace(/_/g, ' '))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <EmployeeTypeBadge type={n.type} />
                          <EmployeeStatusPill status={n.status} />
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">{formatDate(n.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </EmployeePanel>
          </div>
        </>
      )}
    </AppShell>
  )
}
