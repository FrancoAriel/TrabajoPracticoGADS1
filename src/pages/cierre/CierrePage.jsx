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

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] text-on-surface-variant">{hint}</p> : null}
    </div>
  )
}

const INPUT = 'w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'

function ReprocessResultPanel({ result }) {
  if (!result) return null
  const totals = result.totals ?? {}
  const metrics = [
    { label: 'Creadas', value: totals.created ?? 0, className: 'text-green-700' },
    { label: 'OK', value: totals.ok ?? 0, className: 'text-primary' },
    { label: 'Omitidas', value: totals.skipped ?? 0, className: 'text-on-surface-variant' },
    { label: 'Errores', value: totals.error ?? 0, className: 'text-error' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-on-background">
          Resultado{result.dryRun ? ' · simulación' : ''}
        </p>
        {result.dryRun ? (
          <span className="rounded-full bg-tertiary-container/40 px-2 py-0.5 text-[10px] font-bold uppercase text-tertiary">Preview</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">Aplicado</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-surface-container-low p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{m.label}</p>
            <p className={`mt-1 font-headline text-xl font-black ${m.className}`}>{m.value}</p>
          </div>
        ))}
      </div>
      {result.byRule && Object.keys(result.byRule).length > 0 && (
        <div className="border-t border-slate-100 px-4 py-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Detalle por regla</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="pb-2 pr-3">Regla</th>
                  <th className="pb-2 px-2 text-center">Creadas</th>
                  <th className="pb-2 px-2 text-center">OK</th>
                  <th className="pb-2 pl-2 text-center">Omitidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(result.byRule).map(([rule, counts]) => (
                  <tr key={rule}>
                    <td className="py-2 pr-3 font-medium capitalize text-on-background">{rule.replace(/_/g, ' ')}</td>
                    <td className="px-2 py-2 text-center font-bold text-green-700">{counts.created ?? 0}</td>
                    <td className="px-2 py-2 text-center font-bold text-primary">{counts.ok ?? 0}</td>
                    <td className="pl-2 py-2 text-center font-bold text-on-surface-variant">{counts.skipped ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
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
  const [selectedPeriod, setSelectedPeriod] = useState('')
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
  const [closureConfirmOpen, setClosureConfirmOpen] = useState(false)

  useEffect(() => { document.title = 'Cierre Mensual - Executive Architect' }, [])

  async function loadClosure(periodo = selectedPeriod) {
    setClosureLoading(true)
    setClosureError('')
    try {
      const data = await getCurrentClosure(periodo || undefined)
      setClosureData(data)
      if (data?.currentPeriod) {
        setSelectedPeriod(data.currentPeriod)
      }
      if (data?.periodRange?.desde) setReprocessDesde(data.periodRange.desde)
      if (data?.periodRange?.hasta) setReprocessHasta(data.periodRange.hasta)
    } catch (e) {
      setClosureError(e?.message ?? 'No se pudo cargar el cierre.')
    } finally {
      setClosureLoading(false)
    }
  }

  useEffect(() => {
    loadClosure()
  }, [])

  function selectPeriod(periodo) {
    if (!periodo || periodo === selectedPeriod) return
    setSelected(null)
    loadClosure(periodo)
  }

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
  const closureStatus = closureData?.currentClosure?.estado ?? 'Abierto'
  const isClosedClosure = closureStatus === 'Cerrado'
  const isFuturePeriod = Boolean(closureData?.isFuture)
  const isCurrentMonth = Boolean(closureData?.isCurrentMonth)
  const canClosePeriod = closureData?.canClose ?? (!isClosedClosure && !isFuturePeriod && Number(stats.pending ?? 0) === 0)
  const availablePeriods = closureData?.availablePeriods ?? []

  function periodOptionSuffix(period) {
    if (period.status === 'Cerrado') return ' · Cerrado'
    if (period.status === 'En curso') return ' · En curso'
    if (period.isFuture) return ' · Futuro'
    if (period.status === 'Pendiente') return ' · Pendiente'
    if (period.status === 'Borrador') return ' · Borrador'
    return ''
  }

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

  async function executeRunClosure() {
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
      setClosureConfirmOpen(false)
      await loadClosure(currentPeriod)
    } catch (e) {
      setClosureError(e?.message ?? 'No se pudo ejecutar el cierre.')
    } finally {
      setClosureActionLoading(false)
    }
  }

  function openClosureConfirm() {
    setClosureConfirmOpen(true)
  }

  function closeClosureConfirm() {
    if (closureActionLoading) return
    setClosureConfirmOpen(false)
  }

  async function handleReprocess() {
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
      await loadClosure(selectedPeriod || currentPeriod)
    } catch (e) {
      setReprocessError(e?.message ?? 'Error al reprocesar')
    } finally {
      setReprocessLoading(false)
    }
  }

  function openReprocessModal() {
    setReprocessError(null)
    setReprocessResult(null)
    setReprocessDryRun(true)
    setReprocessOpen(true)
  }

  function closeReprocessModal() {
    if (reprocessLoading) return
    setReprocessOpen(false)
    setReprocessError(null)
    setReprocessResult(null)
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
          <p className="mt-1 text-sm text-on-surface-variant">Elegí cualquier mes anterior o el actual para revisar datos y ejecutar el cierre.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 text-sm text-on-surface-variant">calendar_month</span>
            <select
              value={selectedPeriod || currentPeriod}
              onChange={(e) => selectPeriod(e.target.value)}
              disabled={closureLoading}
              className="appearance-none rounded-lg border border-slate-200/70 bg-surface-container-lowest py-2 pl-9 pr-8 text-sm font-semibold text-on-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            >
              {(availablePeriods.length ? availablePeriods : [{ label: currentPeriod }]).map((p) => (
                <option key={p.label} value={p.label} disabled={p.isFuture}>
                  {p.label}{periodOptionSuffix(p)}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2 text-base text-on-surface-variant">expand_more</span>
          </div>
          <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
            isClosedClosure
              ? 'bg-green-50 text-green-700'
              : isFuturePeriod
                ? 'bg-surface-container-highest text-on-surface-variant'
                : 'bg-tertiary-container/40 text-on-tertiary-container'
          }`}>
            <span className="material-symbols-outlined text-sm">{isClosedClosure ? 'lock' : isFuturePeriod ? 'event_upcoming' : 'pending'}</span>
            <span className="text-xs font-bold uppercase tracking-widest">
              {isClosedClosure ? 'Cerrado' : isFuturePeriod ? 'Futuro' : isCurrentMonth ? 'En curso' : 'Abierto'}
            </span>
          </div>
          {canMutate ? (
            <>
              <button
                onClick={openReprocessModal}
                className="flex items-center gap-2 rounded-md border border-slate-200/70 bg-surface-container-lowest px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">replay</span> Reprocesar período
              </button>
              <button
                type="button"
                onClick={openClosureConfirm}
                disabled={!canClosePeriod || closureActionLoading || closureLoading}
                className="flex items-center gap-2 rounded-md bg-slate-900 dark:bg-primary dark:text-on-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {closureActionLoading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">lock_open</span>}
                {isClosedClosure ? 'Período cerrado' : isFuturePeriod ? 'Período futuro' : closureData?.currentClosure?.id ? 'Ejecutar cierre' : 'Crear y cerrar'}
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
          const isActive = card.label === (selectedPeriod || currentPeriod)
          const isFuture = normalizedStatus === 'futuro'
          const isInProgress = normalizedStatus === 'en curso' || normalizedStatus === 'en progreso'
          const wrapperClass = isActive
            ? 'relative cursor-pointer overflow-hidden rounded-xl bg-slate-900 dark:bg-surface-container-highest p-5 text-white ring-2 ring-primary/40'
            : isClosed
              ? 'flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/50 border-l-4 border-l-green-600 bg-surface-container-lowest p-5 transition-colors hover:bg-slate-50'
              : isFuture
                ? 'cursor-not-allowed rounded-xl bg-surface-container-highest p-5 opacity-50'
                : 'cursor-pointer rounded-xl bg-surface-container-highest p-5 transition-colors hover:bg-surface-container-low'
          const titleClass = isActive ? 'text-slate-400' : 'text-on-surface-variant'
          const statusClass = isClosed ? 'text-green-700 dark:text-green-400' : isActive ? 'text-white' : 'text-on-surface-variant'
          const subClass = isActive ? 'text-slate-400' : 'text-on-surface-variant'

          return (
            <button
              key={card.id ?? card.label}
              type="button"
              disabled={isFuture}
              onClick={() => selectPeriod(card.label)}
              className={`text-left ${wrapperClass}`}
            >
              {isActive ? <span className="material-symbols-outlined absolute -bottom-3 -right-3 text-7xl opacity-10">point_of_sale</span> : null}
              <div>
                <p className={`mb-1 font-headline text-[10px] font-bold uppercase tracking-widest ${titleClass}`}>{card.label}</p>
                <p className={`text-sm font-black uppercase ${statusClass}`}>{card.status}</p>
                <p className={`mt-0.5 text-xs ${subClass}`}>
                  {card.sub ?? (isActive ? `${stats.pending ?? 0} novedades pendientes` : isClosed ? 'Cierre finalizado' : isFuture ? 'Aún no iniciado' : isInProgress ? 'Mes en curso' : 'Pendiente de cierre')}
                </p>
                {isActive && !isClosed ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-300">
                    <span className="material-symbols-outlined text-sm">visibility</span> Período en vista
                  </span>
                ) : null}
              </div>
              {isClosed ? (
                <Link to={routes.exportaciones} onClick={(e) => e.stopPropagation()} className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary hover:underline">
                  <span className="material-symbols-outlined text-sm">download</span> Exportar
                </Link>
              ) : null}
            </button>
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
        <p className="mt-5 text-xs text-on-surface-variant">
          Elegí el período a cerrar con el selector o las tarjetas. Podés cerrar meses anteriores cuando no queden novedades pendientes.
        </p>
      </div>

      <Modal
        open={reprocessOpen}
        onClose={closeReprocessModal}
        title="Reprocesar período"
        subtitle="Recalculá las reglas del motor sobre un rango de fechas."
        size="max-w-lg"
      >
        <div className="space-y-5 px-8 py-6">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-surface-container-low px-4 py-3">
            <span className="material-symbols-outlined mt-0.5 text-base text-primary">info</span>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              El reproceso elimina novedades automáticas previas del rango y vuelve a evaluar las reglas.
              Usá <span className="font-bold text-on-background">simulación</span> antes de aplicar cambios reales.
              Si podés, indicá legajos puntuales para que termine más rápido.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Desde *">
              <input
                id="reprocess-desde"
                type="date"
                value={reprocessDesde}
                onChange={(e) => setReprocessDesde(e.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Hasta *">
              <input
                id="reprocess-hasta"
                type="date"
                value={reprocessHasta}
                onChange={(e) => setReprocessHasta(e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>

          <Field label="Legajos" hint="Opcional. Separados por coma. Vacío = todos los empleados activos.">
            <input
              id="reprocess-legajos"
              type="text"
              value={reprocessLegajos}
              onChange={(e) => setReprocessLegajos(e.target.value)}
              placeholder="Ej: 1, 2, 5"
              className={INPUT}
            />
          </Field>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Modo de ejecución</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReprocessDryRun(true)}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  reprocessDryRun
                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                    : 'border-slate-200/60 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${reprocessDryRun ? 'text-primary' : 'text-on-surface-variant'}`}>science</span>
                <p className={`mt-2 text-sm font-bold ${reprocessDryRun ? 'text-primary' : 'text-on-background'}`}>Simulación</p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant">No modifica datos</p>
              </button>
              <button
                type="button"
                onClick={() => setReprocessDryRun(false)}
                className={`rounded-xl border px-3 py-3 text-left transition-all ${
                  !reprocessDryRun
                    ? 'border-error/30 bg-error/5 shadow-sm'
                    : 'border-slate-200/60 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${!reprocessDryRun ? 'text-error' : 'text-on-surface-variant'}`}>published_with_changes</span>
                <p className={`mt-2 text-sm font-bold ${!reprocessDryRun ? 'text-error' : 'text-on-background'}`}>Aplicar cambios</p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant">Reemplaza novedades auto.</p>
              </button>
            </div>
          </div>

          {!reprocessDryRun && (
            <div className="flex items-start gap-3 rounded-xl border border-error/20 bg-error-container/10 px-4 py-3">
              <span className="material-symbols-outlined text-base text-error">warning</span>
              <p className="text-xs leading-relaxed text-error">
                Vas a reemplazar novedades automáticas del rango seleccionado. Esta acción impacta datos reales.
              </p>
            </div>
          )}

          {reprocessError && (
            <div className="flex items-start gap-3 rounded-xl border border-error/20 bg-error-container/15 px-4 py-3">
              <span className="material-symbols-outlined text-base text-error">error</span>
              <p className="text-sm font-semibold text-error">{reprocessError}</p>
            </div>
          )}

          <ReprocessResultPanel result={reprocessResult} />

          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={closeReprocessModal}
              disabled={reprocessLoading}
              className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleReprocess}
              disabled={reprocessLoading || !reprocessDesde || !reprocessHasta}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
                reprocessDryRun ? 'bg-primary' : 'bg-error'
              }`}
            >
              {reprocessLoading ? (
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">{reprocessDryRun ? 'science' : 'published_with_changes'}</span>
              )}
              {reprocessLoading ? 'Procesando...' : reprocessDryRun ? 'Ejecutar simulación' : 'Reprocesar y aplicar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={closureConfirmOpen}
        onClose={closeClosureConfirm}
        title="Confirmar cierre mensual"
        subtitle={currentPeriod}
        size="max-w-md"
      >
        <div className="space-y-5 px-8 py-6">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-surface-container-low px-4 py-3">
            <span className="material-symbols-outlined mt-0.5 text-base text-primary">lock</span>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Se generará un snapshot del período con las novedades aprobadas. Después del cierre podrás exportar la liquidación.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-container-low p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Novedades aprobadas</p>
              <p className="mt-1 font-headline text-xl font-black text-primary">{stats.liquidated ?? 0}</p>
            </div>
            <div className="rounded-lg bg-surface-container-low p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Pendientes</p>
              <p className="mt-1 font-headline text-xl font-black text-on-secondary-container">{stats.pending ?? 0}</p>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={closeClosureConfirm}
              disabled={closureActionLoading}
              className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={executeRunClosure}
              disabled={closureActionLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-primary dark:text-on-primary"
            >
              {closureActionLoading ? (
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">lock</span>
              )}
              {closureActionLoading ? 'Cerrando...' : 'Confirmar cierre'}
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
