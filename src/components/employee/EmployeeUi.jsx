import { Link } from 'react-router-dom'
import StatCard from '../ui/StatCard'
import { formatLongDate, getInitials, statusDot } from '../../lib/employeePortalUi'

export function EmployeeFilterSelect({ value, onChange, children, minWidth = 'min-w-[8rem]' }) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={onChange}
        className={`${minWidth} appearance-none rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-8 text-xs font-medium text-on-surface-variant`}
      >
        {children}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base leading-none text-on-surface-variant">expand_more</span>
    </div>
  )
}

export function EmployeeFilterBar({ title, icon, children, onClear }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em] text-on-background">
        <span className="material-symbols-outlined text-sm">{icon}</span>
        {title}
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
            Limpiar
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function EmployeeLoadingState({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
      <p className="text-sm font-semibold">{message}</p>
    </div>
  )
}

export function EmployeeMetricCard({ label, value, icon, valueClassName = 'text-on-background' }) {
  return (
    <StatCard label={label} value={value} icon={icon} valueClassName={valueClassName} />
  )
}

export function EmployeePanel({ icon, title, action, children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest ${className}`}>
      {title || action ? (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          {title ? (
            <h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em] text-on-background">
              <span className="material-symbols-outlined text-sm">{icon}</span>
              {title}
            </h3>
          ) : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function EmployeeStatusPill({ status }) {
  const ui = status === 'Aprobada' || status === 'Aprobado'
    ? 'Aprobado'
    : status === 'Rechazada' || status === 'Rechazado'
      ? 'Rechazado'
      : 'Pendiente'

  if (ui === 'Pendiente') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-tertiary">
        <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
        Pendiente
      </span>
    )
  }
  if (ui === 'Aprobado') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 dark:text-green-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        Aprobado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-error">
      <span className="h-1.5 w-1.5 rounded-full bg-error" />
      Rechazado
    </span>
  )
}

export function EmployeeTypeBadge({ type }) {
  const key = String(type ?? '').toLowerCase()
  const label = type?.replace?.(/_/g, ' ') ?? type
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
      {
        licencia: 'bg-secondary-container/40 text-on-secondary-container',
        vacaciones: 'bg-primary-container/40 text-on-primary-container',
        permiso_especial: 'bg-secondary-container/40 text-on-secondary-container',
        justificacion: 'bg-secondary-container/40 text-on-secondary-container',
        tardanza: 'bg-tertiary-container/40 text-on-tertiary-container',
        ausencia: 'bg-error-container/20 text-error',
      }[key] ?? 'bg-surface-container text-on-surface-variant'
    }`}>
      {label}
    </span>
  )
}

export function EmployeeProfileHero({ employee, scheduleConfig, actions }) {
  if (!employee) return null
  const scheduleLabel = scheduleConfig?.schedule ?? scheduleConfig?.cycle ?? 'Sin horario asignado'

  return (
    <section className="mb-6 flex flex-col gap-6 rounded-xl bg-surface-container-lowest p-8 lg:flex-row lg:items-start">
      <div className="relative shrink-0">
        <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-primary font-headline text-4xl font-black text-on-primary shadow-lg shadow-primary/20">
          {getInitials(employee.name)}
        </div>
        <div className={`absolute -bottom-2 -right-2 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-white shadow-sm ${statusDot(employee.status)}`}>
          {employee.status}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-background">{employee.name}</h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-on-surface-variant">
              <span>Legajo <span className="font-mono font-bold text-primary">{employee.legajo}</span></span>
              {employee.category && (
                <>
                  <span className="hidden h-1 w-1 rounded-full bg-outline sm:inline-block" />
                  <span>{employee.category}</span>
                </>
              )}
              <span className="hidden h-1 w-1 rounded-full bg-outline sm:inline-block" />
              <span>{employee.jornada}</span>
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">DNI {employee.dni} · {formatLongDate()}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/60 bg-surface-container-low px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Horario</p>
            <p className="mt-1 text-sm font-bold text-on-background">{scheduleLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-surface-container-low px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Convenio</p>
            <p className="mt-1 text-sm font-bold text-on-background">{employee.convenio ?? '—'}</p>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-surface-container-low px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Ingreso</p>
            <p className="mt-1 text-sm font-bold text-on-background">{employee.fechaIngreso ?? '—'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EmployeeQuickAction({ to, icon, title, subtitle, primary = false }) {
  const className = `group flex min-w-[220px] flex-1 items-center gap-4 rounded-xl border p-4 transition-all active:scale-[0.99] ${
    primary
      ? 'border-primary/20 bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-95'
      : 'border-slate-200/60 bg-surface-container-lowest hover:border-primary/20 hover:bg-surface-container-low'
  }`
  const inner = (
    <>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
        primary ? 'bg-white/15' : 'bg-primary-container/30 text-primary group-hover:bg-primary-container/50'
      }`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="min-w-0 text-left">
        <p className={`text-sm font-bold ${primary ? 'text-on-primary' : 'text-on-background'}`}>{title}</p>
        <p className={`text-[11px] ${primary ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>{subtitle}</p>
      </div>
      <span className={`material-symbols-outlined ml-auto text-lg ${primary ? 'text-on-primary/80' : 'text-outline group-hover:text-primary'}`}>arrow_forward</span>
    </>
  )

  if (to) {
    return <Link to={to} className={className}>{inner}</Link>
  }
  return <button type="button" className={className}>{inner}</button>
}
