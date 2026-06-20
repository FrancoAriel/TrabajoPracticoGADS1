import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Modal from '../../components/ui/Modal'
import { isApiMode } from '../../config/env'
import { getSession } from '../../lib/session'
import { routes } from '../../lib/routes'
import { createClosure, getCurrentClosure, runClosure } from '../../services/closureService'
import { reprocessRange } from '../../services/reasoningService'

const employees = [
  { name: 'Juan Perez', legajo: '0042', initials: 'JP', avatarClass: 'bg-blue-100 text-primary', normal: '176h', he50: '2h 30m', he100: '—', ausencias: '1 día', status: 'ok' },
  { name: 'Ana Gomez', legajo: '0018', initials: 'AG', avatarClass: 'bg-purple-100 text-tertiary', normal: '168h', he50: '—', he100: '—', ausencias: '—', status: 'pendiente' },
  { name: 'Martin Sosa', legajo: '0027', initials: 'MS', avatarClass: 'bg-blue-100 text-primary', normal: '184h', he50: '8h', he100: '2h', ausencias: '—', status: 'ok' },
  { name: 'Luis Diaz', legajo: '0031', initials: 'LD', avatarClass: 'bg-slate-200 text-slate-600', normal: '160h', he50: '—', he100: '—', ausencias: '1 día', status: 'pendiente' },
  { name: 'Carlos Méndez', legajo: '0093', initials: 'CM', avatarClass: 'bg-blue-100 text-primary', normal: '176h', he50: '24h', he100: '6h', ausencias: '—', status: 'ok' },
]

const checklist = [
  { icon: 'check_circle', iconFill: true, iconClass: 'text-green-600', bg: 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900/50', title: 'Novedades del período 1–10 aprobadas', sub: '4 novedades procesadas', badge: 'Completado', badgeClass: 'text-green-700 dark:text-green-400' },
  { icon: 'pending', iconFill: false, iconClass: 'text-tertiary', bg: 'bg-tertiary-container/20 border-tertiary/20', title: 'Aprobar novedades pendientes', sub: '9 novedades esperando revisión', badge: null, link: true },
  { icon: 'radio_button_unchecked', iconFill: false, iconClass: 'text-outline-variant', bg: 'bg-surface-container-low opacity-50', title: 'Validar totales con RRHH', sub: 'Pendiente de novedades aprobadas', badge: 'Pendiente', badgeClass: 'text-on-surface-variant' },
  { icon: 'radio_button_unchecked', iconFill: false, iconClass: 'text-outline-variant', bg: 'bg-surface-container-low opacity-50', title: 'Exportar liquidación final', sub: 'Disponible al cerrar el período', badge: 'Pendiente', badgeClass: 'text-on-surface-variant' },
]

function StatusPill({ status }) {
  if (status === 'ok') return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-600" />OK</span>
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-tertiary"><span className="h-1.5 w-1.5 rounded-full bg-tertiary" />Pendiente</span>
}

function isoYmd(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function firstDayOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function CierrePage() {
  const api = isApiMode()
  const canMutate = !api || getSession()?.user?.role === 'Admin'
  const [selected, setSelected] = useState(null)
  const [closureData, setClosureData] = useState(null)
  const [closureLoading, setClosureLoading] = useState(true)
  const [closureActionLoading, setClosureActionLoading] = useState(false)
  const [closureMessage, setClosureMessage] = useState('')
  const [closureError, setClosureError] = useState('')
  const [reprocessOpen, setReprocessOpen] = useState(false)
  const [reprocessDesde, setReprocessDesde] = useState(() => firstDayOfMonth())
  const [reprocessHasta, setReprocessHasta] = useState(() => isoYmd())
  const [reprocessDryRun, setReprocessDryRun] = useState(true)
  const [reprocessLegajos, setReprocessLegajos] = useState('')
  const [reprocessLoading, setReprocessLoading] = useState(false)
  const [reprocessResult, setReprocessResult] = useState(null)
  const [reprocessError, setReprocessError] = useState(null)

  useEffect(() => { document.title = 'Cierre Mensual - Executive Architect' }, [])

  async function loadClosure() {
    setClosureLoading(true)
    setClosureError('')
    try {
      setClosureData(await getCurrentClosure())
    } catch (e) {
      setClosureError(e?.message ?? 'No se pudo cargar el cierre.')
    } finally {
      setClosureLoading(false)
    }
  }

  useEffect(() => {
    loadClosure()
  }, [])

  const currentPeriod = closureData?.currentPeriod ?? (api ? '—' : 'Junio 2025')
  const stats = closureData?.stats ?? (api ? { liquidated: 0, pending: 0, he50: '0', he100: '0' } : { liquidated: 39, pending: 3, he50: '42h 15m', he100: '8h 00m' })
  const periodCards = closureData?.periodCards?.length ? closureData.periodCards : (api ? [] : [
    { id: 'may-2025', label: 'Mayo 2025', status: 'Cerrado', sub: 'Cerrado el 05/06/2025' },
    { id: 'jun-2025', label: 'Junio 2025', status: 'En progreso', sub: '3 novedades pendientes' },
    { id: 'jul-2025', label: 'Julio 2025', status: 'Futuro', sub: 'Aún no iniciado' },
  ])
  const rawEmployees = closureData?.employeeBreakdown?.length ? closureData.employeeBreakdown : (api ? [] : employees)
  const closureEmployees = rawEmployees.map((emp) => ({
    name: emp.name,
    legajo: emp.legajo ?? String(emp.id ?? '').padStart(4, '0'),
    initials: emp.initials ?? String(emp.name ?? 'NA').split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase(),
    avatarClass: emp.avatarClass ?? 'bg-blue-100 text-primary',
    normal: emp.normal ?? `${emp.workedDays ?? 0} días`,
    he50: emp.he50 ?? '0',
    he100: emp.he100 ?? '0',
    ausencias: emp.ausencias ?? String(emp.unjustifiedAbsences ?? 0),
    status: emp.status ?? (emp.estado === 'OK' ? 'ok' : 'pendiente'),
  }))
  const closureChecklist = closureData?.checklist?.length
    ? closureData.checklist.map((item, index) => {
        if (typeof item === 'string') {
          return {
            key: `checklist-${index}`,
            icon: 'pending',
            iconFill: false,
            iconClass: 'text-tertiary',
            bg: 'bg-tertiary-container/20 border-tertiary/20',
            title: item,
            sub: 'Pendiente de validación',
            badge: 'Pendiente',
            badgeClass: 'text-on-surface-variant',
            link: index === 0,
          }
        }

        return {
          key: item.key ?? `checklist-${index}`,
          icon: item.done ? 'check_circle' : 'pending',
          iconFill: item.done,
          iconClass: item.done ? 'text-green-600' : 'text-tertiary',
          bg: item.done ? 'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900/50' : 'bg-tertiary-container/20 border-tertiary/20',
          title: item.title,
          sub: item.sub,
          badge: item.done ? 'Completado' : 'Pendiente',
          badgeClass: item.done ? 'text-green-700 dark:text-green-400' : 'text-on-surface-variant',
          link: item.key === 'review-pending-news' && !item.done,
        }
      })
    : (api ? [] : checklist)

  const hasClosureData = Boolean(closureData)
  const closureStatus = closureData?.currentClosure?.estado ?? 'Borrador'
  const isClosedClosure = closureStatus === 'Cerrado'

  if (api && closureLoading && !hasClosureData) {
    return (
      <AppShell topbarTitle="CIERRE MENSUAL">
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
          <p className="text-sm font-semibold">Cargando datos de cierre...</p>
        </div>
      </AppShell>
    )
  }

  async function handleRunClosure() {
    if (!window.confirm(`Vas a cerrar el período ${currentPeriod}. Esta acción genera snapshot de cierre. ¿Continuar?`)) return
    setClosureActionLoading(true)
    setClosureMessage('')
    setClosureError('')
    try {
      let closure = closureData?.currentClosure
      if (!closure?.id) {
        const created = await createClosure({ periodo: currentPeriod })
        closure = { id: created.id_cierre ?? created.id, periodo: created.periodo, estado: created.estado }
      }
      const result = await runClosure(closure.id, {
        archivoExportado: `cierre_${currentPeriod.replace(/\s+/g, '_')}.csv`,
      })
      setClosureMessage(`Cierre ejecutado. Novedades incluidas: ${result.novedadesIncluidas ?? 0}.`)
      await loadClosure()
    } catch (e) {
      setClosureError(e?.message ?? 'No se pudo ejecutar el cierre.')
    } finally {
      setClosureActionLoading(false)
    }
  }

  async function handleReprocess() {
    if (!reprocessDryRun && !window.confirm('Vas a reprocesar el período y reemplazar novedades automáticas del rango. ¿Continuar?')) return
    setReprocessLoading(true)
    setReprocessError(null)
    setReprocessResult(null)
    try {
      const legajosArr = String(reprocessLegajos)
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0)
      const res = await reprocessRange({
        desde: reprocessDesde,
        hasta: reprocessHasta,
        dryRun: reprocessDryRun,
        legajos: legajosArr.length ? legajosArr : undefined,
      })
      setReprocessResult(res?.data ?? res)
      await loadClosure()
    } catch (e) {
      setReprocessError(e?.message ?? 'Error al reprocesar')
    } finally {
      setReprocessLoading(false)
    }
  }

  return (
    <AppShell topbarTitle="CIERRE MENSUAL">
      {api && closureLoading && hasClosureData ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          Actualizando datos del cierre...
        </div>
      ) : null}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-background">Cierre Mensual</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Proceso de cierre y liquidación de horas del período.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-tertiary-container/40 px-4 py-2">
            <span className="material-symbols-outlined text-sm text-tertiary">pending</span>
            <span className="text-xs font-bold uppercase tracking-widest text-on-tertiary-container">
              Período {isClosedClosure ? 'cerrado' : 'abierto'}: {currentPeriod}
            </span>
          </div>
          {canMutate ? (
            <>
              <button
                onClick={() => setReprocessOpen(true)}
                className="flex items-center gap-2 rounded-md border border-slate-200/70 bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">replay</span> Reprocesar período
              </button>
              <button
                type="button"
                onClick={handleRunClosure}
                disabled={isClosedClosure || closureActionLoading || closureLoading || Number(stats.pending ?? 0) > 0}
                className="flex items-center gap-2 rounded-md bg-slate-900 dark:bg-primary dark:text-on-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {closureActionLoading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">lock_open</span>}
                {isClosedClosure ? 'Período cerrado' : closureData?.currentClosure?.id ? 'Ejecutar cierre' : 'Crear y cerrar'}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {(closureMessage || closureError) && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm font-semibold ${closureError ? 'bg-error-container/30 text-error' : 'bg-green-50 text-green-700'}`}>
          {closureError || closureMessage}
        </div>
      )}

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Novedades aprobadas</p><p className="font-headline text-2xl font-black text-primary">{stats.liquidated ?? 0}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">HE 50% acumuladas</p><p className="font-headline text-2xl font-black text-tertiary">{stats.he50 ?? '0'}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">HE 100% acumuladas</p><p className="font-headline text-2xl font-black text-error">{stats.he100 ?? '0'}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Novedades pendientes</p><p className="font-headline text-2xl font-black text-on-secondary-container">{stats.pending ?? 0}</p></div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {periodCards.length ? periodCards.map((card) => {
          const normalizedStatus = String(card.status ?? '').toLowerCase()
          const isClosed = normalizedStatus === 'cerrado'
          const isCurrent = normalizedStatus === 'en progreso'
          const wrapperClass = isCurrent
            ? 'relative overflow-hidden rounded-xl bg-slate-900 dark:bg-surface-container-highest p-5 text-white'
            : isClosed
              ? 'flex items-center justify-between rounded-xl border border-slate-200/50 border-l-4 border-l-green-600 bg-surface-container-lowest p-5'
              : 'rounded-xl bg-surface-container-highest p-5 opacity-50'
          const titleClass = isCurrent ? 'text-slate-400' : 'text-on-surface-variant'
          const statusClass = isClosed ? 'text-green-700 dark:text-green-400' : isCurrent ? 'text-white' : 'text-on-surface-variant'
          const subClass = isCurrent ? 'text-slate-400' : 'text-on-surface-variant'

          return (
            <div key={card.id ?? card.label} className={wrapperClass}>
              {isCurrent ? <span className="material-symbols-outlined absolute -bottom-3 -right-3 text-7xl opacity-10">point_of_sale</span> : null}
              <div>
                <p className={`mb-1 font-headline text-[10px] font-bold uppercase tracking-widest ${titleClass}`}>{card.label}</p>
                <p className={`text-sm font-black uppercase ${statusClass}`}>{card.status}</p>
                <p className={`mt-0.5 text-xs ${subClass}`}>{card.sub ?? (isCurrent ? `${stats.pending ?? 0} novedades pendientes` : 'Sin detalle adicional')}</p>
                {isCurrent ? (
                  <Link to={routes.novedades} className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-300 hover:underline">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span> Revisar novedades
                  </Link>
                ) : null}
              </div>
              {isClosed ? (
                <Link to={routes.exportaciones} className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary hover:underline">
                  <span className="material-symbols-outlined text-sm">download</span> Exportar
                </Link>
              ) : null}
            </div>
          )
        }) : (
          <div className="col-span-3 rounded-xl border border-dashed border-slate-200 bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
            No hay tarjetas de período disponibles para mostrar.
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest lg:col-span-7">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
            <h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
              <span className="material-symbols-outlined text-sm">analytics</span> DESGLOSE POR EMPLEADO — {currentPeriod.toUpperCase()}
            </h3>
            <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${isClosedClosure ? 'bg-green-50 text-green-700' : 'bg-tertiary-container/30 text-tertiary'}`}>
              {closureStatus}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Empleado</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Hs norm.</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">HE 50%</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">HE 100%</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ausencias</th>
                  <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closureEmployees.length ? closureEmployees.map((emp) => (
                  <tr key={emp.legajo} onClick={() => setSelected(emp)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.legajo === emp.legajo ? 'bg-primary-container/20' : ''}`}>
                    <td className={`px-5 py-3.5${selected?.legajo === emp.legajo ? ' border-l-4 border-primary' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${emp.avatarClass}`}>{emp.initials}</div>
                        <div>
                          <p className="text-sm font-semibold">{emp.name}</p>
                          <p className="font-mono text-xs text-on-surface-variant">{emp.legajo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm font-bold text-primary">{emp.normal}</td>
                    <td className={`px-5 py-3.5 text-center text-sm font-bold ${emp.he50 !== '—' ? 'text-tertiary' : 'text-on-surface-variant'}`}>{emp.he50}</td>
                    <td className={`px-5 py-3.5 text-center text-sm font-bold ${emp.he100 !== '—' ? 'text-error' : 'text-on-surface-variant'}`}>{emp.he100}</td>
                    <td className="px-5 py-3.5 text-center text-sm text-on-surface-variant">{emp.ausencias}</td>
                    <td className="px-5 py-3.5 text-center"><StatusPill status={emp.status} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined mb-2 block text-3xl opacity-30">group_off</span>
                      No hay empleados con datos de cierre para el período actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          {!selected ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/50 bg-surface-container-lowest px-6 py-16 text-center">
              <span className="material-symbols-outlined mb-3 text-4xl text-outline-variant">touch_app</span>
              <p className="text-sm font-semibold text-on-surface-variant">Ningún empleado seleccionado</p>
              <p className="mt-1 text-xs text-on-surface-variant/60">Hacé clic en una fila para ver el desglose</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                  <span className="material-symbols-outlined text-sm">person</span> DESGLOSE INDIVIDUAL
                </h3>
                <span className="font-mono text-xs font-bold text-on-surface-variant">{selected.legajo}</span>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${selected.avatarClass}`}>{selected.initials}</div>
                  <div>
                    <p className="text-sm font-bold">{selected.name}</p>
                    <p className="text-xs text-on-surface-variant">Período: {currentPeriod}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Horas normales</p>
                    <p className="text-xl font-black text-primary">{selected.normal}</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Ausencias</p>
                    <p className="text-xl font-black text-on-background">{selected.ausencias}</p>
                  </div>
                  <div className="rounded-lg bg-tertiary-container/25 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-on-tertiary-container">HE 50%</p>
                    <p className="text-xl font-black text-tertiary">{selected.he50}</p>
                  </div>
                  <div className="rounded-lg bg-error-container/15 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-error">HE 100%</p>
                    <p className="text-xl font-black text-error">{selected.he100}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-on-surface-variant">Estado del desglose</span>
                  <StatusPill status={selected.status} />
                </div>
                <Link to={routes.novedades} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant/40 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-sm">open_in_new</span> Ver novedades del empleado
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/50 bg-surface-container-lowest p-6">
        <h3 className="mb-5 flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
          <span className="material-symbols-outlined text-sm">checklist</span> CHECKLIST DE CIERRE
        </h3>
        <div className="space-y-2.5">
          {closureChecklist.length ? closureChecklist.map((item) => (
            <div key={item.key ?? item.title} className={`flex items-center gap-4 rounded-lg border p-4 ${item.bg}`}>
              <span className={`material-symbols-outlined shrink-0 text-sm ${item.iconClass ?? ''}`} style={item.iconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs text-on-surface-variant">{item.sub}</p>
              </div>
              {item.link ? (
                <Link to={routes.novedades} className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase text-primary hover:underline">
                  Ir a novedades <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              ) : (
                <span className={`shrink-0 text-[10px] font-bold uppercase ${item.badgeClass}`}>{item.badge}</span>
              )}
            </div>
          )) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-on-surface-variant">
              No hay validaciones de cierre disponibles para este período.
            </div>
          )}
        </div>
        <p className="mt-5 text-xs text-on-surface-variant">El botón "Ejecutar cierre" se habilita cuando no quedan novedades pendientes del período.</p>
      </div>

      <Modal
        open={reprocessOpen}
        onClose={() => setReprocessOpen(false)}
        title="Reprocesar período"
        subtitle="Borra novedades automáticas previas del rango y vuelve a evaluar las 5 reglas del motor."
      >
        <div className="space-y-4 px-8 py-6">
          <div className="rounded-lg border border-tertiary/20 bg-tertiary-container/20 px-4 py-3 text-xs text-on-tertiary-container">
            El reproceso elimina novedades automáticas previas del rango seleccionado y recalcula reglas. Usá simulación para validar antes de impactar datos.
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="reprocess-desde" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Desde</label>
              <input
                id="reprocess-desde"
                type="date"
                value={reprocessDesde}
                onChange={(e) => setReprocessDesde(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label htmlFor="reprocess-hasta" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Hasta</label>
              <input
                id="reprocess-hasta"
                type="date"
                value={reprocessHasta}
                onChange={(e) => setReprocessHasta(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reprocess-legajos" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Legajos (opcional, separados por coma)
            </label>
            <input
              id="reprocess-legajos"
              type="text"
              value={reprocessLegajos}
              onChange={(e) => setReprocessLegajos(e.target.value)}
              placeholder="Ej: 1, 2, 5 (vacío = todos los activos)"
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reprocessDryRun}
              onChange={(e) => setReprocessDryRun(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant"
            />
            <span>Simulación (no inserta novedades) — recomendado para previsualizar</span>
          </label>

          {reprocessError && (
            <div className="rounded-md bg-error-container/30 px-3 py-2 text-sm text-error">
              {reprocessError}
            </div>
          )}

          {reprocessResult && (
            <div className="rounded-md border border-outline-variant/40 bg-surface-container-low p-3 text-sm">
              <p className="mb-2 font-bold">Resultado{reprocessResult.dryRun ? ' (simulación)' : ''}</p>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded bg-green-50 px-2 py-1">
                  <span className="font-bold text-green-700">{reprocessResult.totals?.created ?? 0}</span> creadas
                </div>
                <div className="rounded bg-blue-50 px-2 py-1">
                  <span className="font-bold text-blue-700">{reprocessResult.totals?.ok ?? 0}</span> OK
                </div>
                <div className="rounded bg-slate-100 px-2 py-1">
                  <span className="font-bold text-slate-700">{reprocessResult.totals?.skipped ?? 0}</span> omitidas
                </div>
                <div className="rounded bg-red-50 px-2 py-1">
                  <span className="font-bold text-red-700">{reprocessResult.totals?.error ?? 0}</span> errores
                </div>
              </div>
              {reprocessResult.byRule && (
                <div className="mt-3">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Por regla</p>
                  <ul className="space-y-0.5 text-xs">
                    {Object.entries(reprocessResult.byRule).map(([rule, counts]) => (
                      <li key={rule} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <span className="capitalize">{rule.replace(/_/g, ' ')}</span>
                        <span className="text-on-surface-variant">
                          creadas: <b className="text-on-surface">{counts.created}</b>, ok: {counts.ok}, omitidas: {counts.skipped}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReprocessOpen(false)}
              className="rounded-md border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleReprocess}
              disabled={reprocessLoading || !reprocessDesde || !reprocessHasta}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-40"
            >
              {reprocessLoading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              {reprocessDryRun ? 'Simular' : 'Reprocesar'}
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
