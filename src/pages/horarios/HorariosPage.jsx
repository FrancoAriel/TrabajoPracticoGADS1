import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Modal from '../../components/ui/Modal'
import { isApiMode } from '../../config/env'
import { routes } from '../../lib/routes'
import { createEmployeeAssignment, listEmployees } from '../../services/employeeService'
import {
  createCycle,
  createSchedule,
  createScheduleAssignment,
  getLaborCatalogs,
  getSchedulesOverview,
  updateCycle,
  updateCycleAssignment,
  updateSchedule,
  updateScheduleAssignment,
} from '../../services/scheduleService'

const schedulesSeed = [
  { id: 'H-001', name: 'Planta Mañana', type: 'Fijo', status: 'Activo', start: '08:00', end: '17:00', entryTol: 5, exitTol: 10, breakMin: 60, weeklyEnd: '16:00' },
  { id: 'H-002', name: 'Soporte Nocturno', type: 'Fijo', status: 'Activo', start: '22:00', end: '06:00', entryTol: 10, exitTol: 15, breakMin: 45, weeklyEnd: '06:00' },
  { id: 'H-003', name: 'Oficina Central', type: 'Fijo', status: 'Activo', start: '09:00', end: '18:00', entryTol: 5, exitTol: 10, breakMin: 60, weeklyEnd: '16:00' },
  { id: 'H-004', name: 'Planta Tarde', type: 'Fijo', status: 'Activo', start: '14:00', end: '22:00', entryTol: 5, exitTol: 10, breakMin: 60, weeklyEnd: '22:00' },
  { id: 'H-005', name: 'Parcial Mañana', type: 'Fijo', status: 'Activo', start: '09:00', end: '13:00', entryTol: 5, exitTol: 5, breakMin: 0, weeklyEnd: '13:00' },
  { id: 'H-006', name: 'Flexible Administrativo', type: 'Flexible', status: 'Activo', start: '—', end: '—', entryTol: 10, exitTol: 10, breakMin: 0, flexMode: 'semanal', flexModeLabel: 'Semanal', weeklyHours: 40 },
]

const cyclesSeed = [
  { id: 'C-001', name: '4x2 Producción', days: 6, status: 'Activo' },
  { id: 'C-002', name: 'Rotación Planta A', days: 14, status: 'Activo' },
  { id: 'C-003', name: 'Rotación Planta B', days: 21, status: 'Activo' },
]

const assignmentsSeed = [
  { id: 'A-0093', legajo: '0093', employee: 'Carlos Méndez', initials: 'CM', avatarClass: 'bg-blue-100 text-primary', type: 'horario', typeLabel: 'Horario fijo', resource: 'H-003 · Oficina Central', from: '01/01/2024', to: 'Indefinido', status: 'Activa', employeeRoute: '/empleados/93' },
  { id: 'A-0105', legajo: '0105', employee: 'Lucía Ferrero', initials: 'LF', avatarClass: 'bg-purple-100 text-tertiary', type: 'ciclo', typeLabel: 'Ciclo rotativo', resource: 'C-002 · Rotación Planta A', from: '15/02/2024', to: '31/12/2025', status: 'Activa', employeeRoute: '/empleados/105' },
  { id: 'A-0042', legajo: '0042', employee: 'Juan Perez', initials: 'JP', avatarClass: 'bg-blue-100 text-primary', type: 'horario', typeLabel: 'Horario fijo', resource: 'H-003 · Oficina Central', from: '01/06/2025', to: 'Indefinido', status: 'Activa', employeeRoute: routes.empleadoJuanPerez },
  { id: 'A-0090', legajo: '0090', employee: 'Martín Paz', initials: 'MP', avatarClass: 'bg-slate-200 text-slate-600', type: 'horario', typeLabel: 'Horario fijo', resource: 'H-001 · Planta Mañana', from: '10/01/2024', to: 'Indefinido', status: 'Activa', employeeRoute: '/empleados/90' },
]

const scheduleOptions = ['H-001 · Planta Mañana', 'H-002 · Soporte Nocturno', 'H-003 · Oficina Central', 'H-004 · Planta Tarde', 'H-005 · Parcial Mañana']
const cycleOptions = ['C-001 · 4x2 Producción (6 días)', 'C-002 · Rotación Planta A (14 días)', 'C-003 · Rotación Planta B (21 días)']
const employeeOptions = ['0042 · Juan Perez', '0018 · Ana Gomez', '0027 · Martin Sosa', '0031 · Luis Diaz', '0050 · Carla Ruiz', '0093 · Carlos Méndez', '0105 · Lucía Ferrero', '0158 · Maria Alvez']

const mockHorarioCatalog = scheduleOptions.map((label, i) => ({ rawId: i + 1, label }))
const mockCicloCatalog = cycleOptions.map((label, i) => ({
  rawId: i + 1,
  label,
  duracionDias: Number(label.match(/\((\d+)/)?.[1]) || 14,
}))
const mockEmployeeCatalog = employeeOptions.map((line) => {
  const parts = line.split('·').map((s) => s.trim())
  const legajoRaw = parts[0] || '1'
  return { id: Number(legajoRaw), legajo: legajoRaw.padStart(4, '0'), name: parts.slice(1).join(' · ') }
})
const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const PAGE_SIZE = 10

function fmtTime(val) {
  if (val == null || val === '') return '—'
  return String(val).slice(0, 5)
}

function formatIsoToAr(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function tipoHorarioUi(t) {
  const x = (t || '').toLowerCase()
  if (x === 'fijo') return 'Fijo'
  if (x === 'flexible') return 'Flexible'
  if (x === 'rotativo') return 'Rotativo'
  return t || '—'
}

function mapScheduleFromApi(row) {
  const typeLabel = tipoHorarioUi(row.type)
  const isFlex = (row.type || '').toLowerCase() === 'flexible'
  const wb = row.weeklyBreakdown || []
  const byDay = Object.fromEntries(wb.map((w) => [w.day, w]))
  const weeklyCells = [1, 2, 3, 4, 5, 6, 7].map((dow) => {
    const s = byDay[dow]
    const label = weekDays[dow - 1]
    if (!s || !s.laborable) return { label, free: true }
    return { label, free: false, start: fmtTime(s.start), end: fmtTime(s.end) }
  })
  const firstWork = wb.find((w) => w.laborable && w.start)
  const fri = byDay[5]
  const fm = row.flexMode ? String(row.flexMode).toLowerCase() : ''
  const flexModeLabel = fm ? (fm === 'diaria' ? 'Diaria' : fm === 'semanal' ? 'Semanal' : row.flexMode) : ''
  const status = row.estado === 'Inactivo' ? 'Inactivo' : 'Activo'
  return {
    id: `H-${String(row.id).padStart(3, '0')}`,
    rawId: row.id,
    name: row.name,
    type: typeLabel,
    status,
    start: isFlex ? '—' : firstWork ? fmtTime(firstWork.start) : '—',
    end: isFlex ? '—' : firstWork ? fmtTime(firstWork.end) : '—',
    weeklyEnd: isFlex ? '—' : fri?.laborable && fri.end ? fmtTime(fri.end) : firstWork ? fmtTime(firstWork.end) : '—',
    entryTol: row.entryToleranceMinutes ?? 0,
    exitTol: row.exitToleranceMinutes ?? 0,
    breakMin: row.breakMinutes ?? 0,
    flexMode: fm,
    flexModeLabel,
    weeklyHours: row.targetWeeklyHours != null ? Number(row.targetWeeklyHours) : null,
    dailyHours: row.targetDailyHours != null ? Number(row.targetDailyHours) : null,
    weeklyCells,
  }
}

function mapCycleFromApi(c) {
  const status = c.estado === 'Inactivo' ? 'Inactivo' : 'Activo'
  return {
    id: `C-${String(c.id).padStart(3, '0')}`,
    rawId: c.id,
    name: c.name,
    days: c.days,
    status,
    mappingRows: (c.mapping || []).map((m) => ({
      day: m.day,
      label: m.label || '—',
      scheduleId: m.scheduleId != null ? m.scheduleId : null,
    })),
  }
}

const AVATAR_POOL = ['bg-blue-100 text-primary', 'bg-purple-100 text-tertiary', 'bg-slate-200 text-slate-600', 'bg-red-100 text-error']

function mapAssignmentFromApi(a) {
  const name = a.employeeName || ''
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '—'
  const h = (a.legajo || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const kind = a.kind === 'ciclo' ? 'ciclo' : 'horario'
  const asignacionHorarioIdNum = kind === 'horario' ? Number(a.id) : null
  let empleadoCicloIdNum = null
  if (kind === 'ciclo') {
    const m = String(a.id ?? '').match(/^ec-(\d+)$/i)
    empleadoCicloIdNum = m ? Number(m[1]) : NaN
    if (Number.isNaN(empleadoCicloIdNum)) empleadoCicloIdNum = null
  }
  return {
    id: String(a.id),
    legajo: a.legajo,
    employee: name || '—',
    initials,
    avatarClass: AVATAR_POOL[h % AVATAR_POOL.length],
    type: kind,
    typeLabel: kind === 'ciclo' ? 'Ciclo rotativo' : 'Horario fijo',
    resource: a.resourceLabel || '—',
    from: formatIsoToAr(a.fromDate),
    to: a.toDate ? formatIsoToAr(a.toDate) : 'Indefinido',
    statusKey: a.status,
    status: a.status === 'vencida' ? 'Vencida' : 'Activa',
    employeeRoute: routes.empleadoDetalle.replace(':id', String(a.employeeId)),
    fromDateIso: a.fromDate || '',
    toDateIso: a.toDate || '',
    asignacionHorarioIdNum,
    empleadoCicloIdNum,
  }
}

function StatusPill({ children }) {
  return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-on-secondary-container"><span className="h-1.5 w-1.5 rounded-full bg-on-secondary-container" /> {children}</span>
}

function TypePill({ children, variant = 'default' }) {
  const classes = variant === 'primary' ? 'bg-primary-container text-on-primary-container' : variant === 'tertiary' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container text-on-surface-variant'
  return <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${classes}`}>{children}</span>
}

function FilterSelect({ value, onChange, children, minWidth = 'min-w-[8rem]' }) {
  return (
    <div className="relative flex items-center">
      <select value={value} onChange={onChange} className={`${minWidth} appearance-none rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-8 text-xs font-medium text-on-surface-variant`}>
        {children}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-base leading-none text-on-surface-variant">expand_more</span>
    </div>
  )
}

function EmptyTableRow({ colSpan, onClear }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-14 text-center">
        <span className="material-symbols-outlined mb-2 block text-4xl opacity-30">search_off</span>
        <p className="text-sm font-semibold text-on-surface-variant">Sin resultados para los filtros aplicados.</p>
        {onClear && <button type="button" onClick={onClear} className="mt-2 text-xs font-bold text-primary hover:underline">Limpiar filtros</button>}
      </td>
    </tr>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
      {children}
    </div>
  )
}

function TextInput(props) {
  return <input {...props} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
}

function SelectInput({ children, ...props }) {
  return <select {...props} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">{children}</select>
}

function ModalActions({ onCancel, submitLabel, disabled }) {
  return (
    <div className="flex gap-3 border-t border-slate-100 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">Cancelar</button>
      <button type="submit" disabled={disabled} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-50">{submitLabel}</button>
    </div>
  )
}

function toSqlTime(hhmm) {
  if (hhmm == null || hhmm === '' || hhmm === '—') return null
  const s = String(hhmm).trim().slice(0, 5)
  const padded = /^(\d{1,2}):(\d{2})$/.exec(s)
  if (!padded) return null
  return `${String(padded[1]).padStart(2, '0')}:${padded[2]}:00`
}

function weekdayInitialRowsFromScheduleItem(item) {
  const start = item?.start && item.start !== '—' ? String(item.start).slice(0, 5) : '09:00'
  const end = item?.end && item.end !== '—' ? String(item.end).slice(0, 5) : '18:00'
  const we = item?.weeklyEnd && item.weeklyEnd !== '—' ? String(item.weeklyEnd).slice(0, 5) : end
  const cells = item?.weeklyCells
  const rows = []
  if (cells?.length === 7) {
    for (let i = 0; i < 7; i += 1) {
      const cell = cells[i]
      const dow = i + 1
      if (cell?.free)
        rows.push({ diaSemana: dow, laborable: false, entrada: start, salida: end })
      else {
        const endCell = dow === 5 ? we : (cell?.end || end).slice(0, 5)
        rows.push({ diaSemana: dow, laborable: true, entrada: (cell?.start || start).slice(0, 5), salida: endCell })
      }
    }
    return rows
  }
  for (let i = 0; i < 7; i += 1) {
    const dow = i + 1
    const weekend = dow >= 6
    rows.push({ diaSemana: dow, laborable: !weekend, entrada: start, salida: dow === 5 ? we : end })
  }
  return rows
}

function diasPayloadFromWeekRows(rows) {
  return rows.map((r) => ({
    diaSemana: r.diaSemana,
    esLaborable: r.laborable,
    horaEntrada: r.laborable ? toSqlTime(r.entrada) : null,
    horaSalida: r.laborable ? toSqlTime(r.salida) : null,
  }))
}

export default function HorariosPage() {
  const api = isApiMode()
  const [activeTab, setActiveTab] = useState('horarios')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [scheduleType, setScheduleType] = useState('')
  const [scheduleStatus, setScheduleStatus] = useState('')
  const [cycleStatus, setCycleStatus] = useState('')
  const [assignmentType, setAssignmentType] = useState('')
  const [assignmentStatus, setAssignmentStatus] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ page: 1, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 1 })
  const [overviewStats, setOverviewStats] = useState(null)
  const [listLoading, setListLoading] = useState(false)
  const [apiSchedules, setApiSchedules] = useState([])
  const [apiCycles, setApiCycles] = useState([])
  const [apiAssignments, setApiAssignments] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [modal, setModal] = useState('')
  const initialLoadPendingRef = useRef(api)
  const [initialLoading, setInitialLoading] = useState(api)
  const [toast, setToast] = useState('')
  const [catalogEmployees, setCatalogEmployees] = useState([])
  const [catalogHorarios, setCatalogHorarios] = useState([])
  const [catalogCiclos, setCatalogCiclos] = useState([])

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3400)
  }, [])

  useEffect(() => {
    document.title = 'Horarios - Executive Architect'
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => window.clearTimeout(t)
  }, [search])

  useLayoutEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeTab, scheduleType, scheduleStatus, assignmentType, assignmentStatus, cycleStatus])

  const tipoQuery = useMemo(() => {
    if (!scheduleType) return undefined
    if (scheduleType === 'Fijo') return 'fijo'
    if (scheduleType === 'Flexible') return 'flexible'
    if (scheduleType === 'Rotativo') return 'rotativo'
    return undefined
  }, [scheduleType])

  const refreshOverview = useCallback(async () => {
    if (!api) return
    setListLoading(true)
    try {
      const params = {
        tab: activeTab,
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
      }
      if (activeTab === 'horarios' && tipoQuery) params.tipo = tipoQuery
      if (activeTab === 'horarios' && scheduleStatus === 'Activo') params.estado = 'activo'
      if (activeTab === 'horarios' && scheduleStatus === 'Inactivo') params.estado = 'inactivo'
      if (activeTab === 'ciclos' && cycleStatus === 'Activo') params.estado = 'activo'
      if (activeTab === 'ciclos' && cycleStatus === 'Inactivo') params.estado = 'inactivo'
      if (activeTab === 'asignaciones') {
        if (assignmentType) params.assignmentKind = assignmentType
        if (assignmentStatus) params.assignmentStatus = assignmentStatus
      }
      const data = await getSchedulesOverview(params)
      setOverviewStats(data.stats)
      setMeta(data.meta)
      if (activeTab === 'horarios') setApiSchedules((data.schedules || []).map(mapScheduleFromApi))
      else if (activeTab === 'ciclos') setApiCycles((data.cycles || []).map(mapCycleFromApi))
      else setApiAssignments((data.assignments || []).map(mapAssignmentFromApi))
    } catch (e) {
      console.error(e)
      setOverviewStats(null)
      setApiSchedules([])
      setApiCycles([])
      setApiAssignments([])
      setMeta((m) => ({ ...m, totalItems: 0, totalPages: 1 }))
    } finally {
      setListLoading(false)
      if (initialLoadPendingRef.current) {
        initialLoadPendingRef.current = false
        setInitialLoading(false)
      }
    }
  }, [
    api,
    activeTab,
    page,
    debouncedSearch,
    tipoQuery,
    scheduleStatus,
    cycleStatus,
    assignmentType,
    assignmentStatus,
  ])

  useEffect(() => {
    refreshOverview()
  }, [refreshOverview])

  useEffect(() => {
    if (!api) return
    let c = false
    Promise.all([listEmployees({ page: 1, pageSize: 500 }), getLaborCatalogs()])
      .then(([emp, cat]) => {
        if (c) return
        setCatalogEmployees(emp.items || [])
        const ch = cat.horarios || []
        setCatalogHorarios(
          ch.map((h) => ({
            rawId: h.id,
            label: `H-${String(h.id).padStart(3, '0')} · ${h.nombre}`,
          })),
        )
        const cc = cat.ciclos || []
        setCatalogCiclos(
          cc.map((ci) => ({
            rawId: ci.id,
            duracionDias: ci.duracionDias,
            label: `C-${String(ci.id).padStart(3, '0')} · ${ci.nombre}`,
          })),
        )
      })
      .catch(() => {})
    return () => { c = true }
  }, [api])

  const searchPlaceholder =
    activeTab === 'horarios' ? 'BUSCAR HORARIO...' : activeTab === 'ciclos' ? 'BUSCAR CICLO...' : 'BUSCAR EMPLEADO...'

  const filteredSchedules = useMemo(() => {
    if (api) {
      let rows = apiSchedules
      if (scheduleStatus) rows = rows.filter((item) => item.status === scheduleStatus)
      return rows
    }
    return schedulesSeed.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
        && (!scheduleType || item.type === scheduleType)
        && (!scheduleStatus || item.status === scheduleStatus),
    )
  }, [api, apiSchedules, scheduleStatus, scheduleType, search])

  const filteredCycles = useMemo(() => {
    if (api) {
      let rows = apiCycles
      if (cycleStatus) rows = rows.filter((item) => item.status === cycleStatus)
      return rows
    }
    return cyclesSeed.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) && (!cycleStatus || item.status === cycleStatus),
    )
  }, [api, apiCycles, cycleStatus, search])

  const filteredAssignments = useMemo(() => {
    if (api) return apiAssignments
    return assignmentsSeed.filter(
      (item) =>
        `${item.legajo} ${item.employee} ${item.resource}`.toLowerCase().includes(search.toLowerCase())
        && (!assignmentType || item.type === assignmentType)
        && (!assignmentStatus || item.status.toLowerCase() === assignmentStatus),
    )
  }, [api, apiAssignments, assignmentStatus, assignmentType, search])

  const kpi = useMemo(() => {
    if (api) {
      if (!overviewStats) return { horarios: 0, ciclos: 0, asignaciones: 0, sinAsignar: 0 }
      return {
        horarios: overviewStats.schedules ?? 0,
        ciclos: overviewStats.cycles ?? 0,
        asignaciones: overviewStats.assignments ?? 0,
        sinAsignar: overviewStats.unassigned ?? 0,
      }
    }
    return {
      horarios: 12,
      ciclos: 3,
      asignaciones: 48,
      sinAsignar: 4,
    }
  }, [api, overviewStats])

  const paginationLabel =
    activeTab === 'horarios'
      ? 'horarios'
      : activeTab === 'ciclos'
        ? 'ciclos'
        : 'asignaciones'

  const pageStart = meta.totalItems === 0 ? 0 : (meta.page - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(meta.page * PAGE_SIZE, meta.totalItems)

  const tableRowCount =
    activeTab === 'horarios'
      ? filteredSchedules.length
      : activeTab === 'ciclos'
        ? filteredCycles.length
        : filteredAssignments.length

  const footerPrimaryText = api
    ? meta.totalItems === 0
      ? `Sin registros (${paginationLabel})`
      : `Mostrando ${pageStart}–${pageEnd} de ${meta.totalItems} ${paginationLabel}`
    : tableRowCount === 0
      ? 'Sin resultados'
      : `Mostrando ${tableRowCount} ${paginationLabel}`

  const pageIndicator = api ? `${meta.page} / ${meta.totalPages}` : '1 / 1'

  const canPrevPage = api && meta.page > 1
  const canNextPage = api && meta.page < meta.totalPages

  const goPrevPage = () => {
    if (canPrevPage) setPage((p) => Math.max(1, p - 1))
  }
  const goNextPage = () => {
    if (canNextPage) setPage((p) => Math.min(meta.totalPages, p + 1))
  }

  const clearSelectionForTab = (tab) => {
    setActiveTab(tab)
    setSearch('')
    setDebouncedSearch('')
    setScheduleType('')
    setScheduleStatus('')
    setCycleStatus('')
    setAssignmentType('')
    setAssignmentStatus('')
    setSelectedSchedule(null)
    setSelectedCycle(null)
    setSelectedAssignment(null)
    setPage(1)
  }

  const horarioTopbar = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><span className="material-symbols-outlined text-sm">search</span></span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} className="w-56 rounded-md border-none bg-surface-container-low py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary" placeholder={searchPlaceholder} type="text" />
      </div>
      <button type="button" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90">
        <span className="material-symbols-outlined text-sm">search</span> Buscar
      </button>
    </div>
  )

  if (api && initialLoading) {
    return (
      <AppShell topbarTitle="HORARIOS" topbarContent={horarioTopbar}>
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
          <p className="text-sm font-semibold">Cargando horarios...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      topbarTitle="HORARIOS"
      topbarContent={horarioTopbar}
    >
      {toast ? <div className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-lg bg-slate-800 dark:bg-surface-container-highest px-4 py-3 text-xs font-semibold text-white shadow-lg">{toast}</div> : null}
      <div className="relative">
        {listLoading && api ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-container-lowest/75">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : null}
        <div className={listLoading && api ? 'pointer-events-none min-h-[320px]' : ''}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-background">Gestión de Horarios</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Horarios fijos, ciclos rotativos y asignaciones al personal.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'horarios' ? <button type="button" onClick={() => setModal('nuevo-horario')} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"><span className="material-symbols-outlined text-sm">add_circle</span> Nuevo horario</button> : null}
          {activeTab === 'ciclos' ? <button type="button" onClick={() => setModal('nuevo-ciclo')} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"><span className="material-symbols-outlined text-sm">add_circle</span> Nuevo ciclo</button> : null}
          {activeTab === 'asignaciones' ? <><button type="button" onClick={() => setModal('asignar-ciclo')} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"><span className="material-symbols-outlined text-sm">groups</span> Asignar ciclo</button><button type="button" onClick={() => setModal('asignar-horario')} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"><span className="material-symbols-outlined text-sm">person_add</span> Asignar horario</button></> : null}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Horarios activos</p><p className="font-headline text-2xl font-black text-primary">{kpi.horarios}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ciclos activos</p><p className="font-headline text-2xl font-black text-tertiary">{kpi.ciclos}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Asignaciones</p><p className="font-headline text-2xl font-black text-green-600">{kpi.asignaciones}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sin asignar</p><p className="font-headline text-2xl font-black text-error">{kpi.sinAsignar}</p></div>
      </div>

      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-0">
          <button type="button" onClick={() => clearSelectionForTab('horarios')} className={`tab-btn flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-colors hover:text-primary ${activeTab === 'horarios' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}><span className="material-symbols-outlined text-sm">schedule</span> Horarios</button>
          <button type="button" onClick={() => clearSelectionForTab('ciclos')} className={`tab-btn flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-colors hover:text-primary ${activeTab === 'ciclos' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}><span className="material-symbols-outlined text-sm">autorenew</span> Ciclos rotativos</button>
          <button type="button" onClick={() => clearSelectionForTab('asignaciones')} className={`tab-btn flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-colors hover:text-primary ${activeTab === 'asignaciones' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}><span className="material-symbols-outlined text-sm">person_pin</span> Asignaciones</button>
        </div>
      </div>

      {activeTab === 'horarios' ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest lg:col-span-7">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
              <h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm">schedule</span>
                LISTADO DE HORARIOS
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} minWidth="min-w-[7rem]">
                  <option value="">Todos los tipos</option>
                  <option>Fijo</option>
                  <option>Flexible</option>
                  <option>Rotativo</option>
                </FilterSelect>
                <FilterSelect value={scheduleStatus} onChange={(e) => setScheduleStatus(e.target.value)} minWidth="min-w-[7rem]">
                  <option value="">Todos los estados</option>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </FilterSelect>
                <button type="button" onClick={() => { setScheduleType(''); setScheduleStatus('') }} className="flex items-center gap-1 rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">ID</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.length ? filteredSchedules.map((item) => (
                    <tr key={item.id} onClick={() => setSelectedSchedule(item)} className="cursor-pointer transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-primary">{item.id}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold">{item.name}</td>
                      <td className="px-5 py-3.5">
                        <TypePill variant={item.type === 'Flexible' ? 'primary' : item.type === 'Rotativo' ? 'tertiary' : 'default'}>{item.type}</TypePill>
                      </td>
                      <td className="px-5 py-3.5"><StatusPill>{item.status}</StatusPill></td>
                    </tr>
                  )) : <EmptyTableRow colSpan={4} onClear={() => { setScheduleType(''); setScheduleStatus('') }} />}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-on-surface-variant">{footerPrimaryText}{listLoading && api ? ' …' : ''}</p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={goPrevPage} disabled={!canPrevPage} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-35">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="px-2 text-xs font-bold text-on-surface-variant">{pageIndicator}</span>
                <button type="button" onClick={goNextPage} disabled={!canNextPage} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-35">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-12 space-y-4 lg:col-span-5">{selectedSchedule ? <ScheduleDetail item={selectedSchedule} onEdit={() => setModal('editar-horario')} /> : <EmptyDetail title="Ningún horario seleccionado" />}</div>
        </div>
      ) : null}

      {activeTab === 'ciclos' ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest lg:col-span-7">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
              <h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm">autorenew</span>
                LISTADO DE CICLOS
              </h3>
              <div className="flex items-center gap-2">
                <FilterSelect value={cycleStatus} onChange={(e) => setCycleStatus(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </FilterSelect>
                <button type="button" onClick={() => setCycleStatus('')} className="flex items-center gap-1 rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">ID</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre</th>
                    <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Duración</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCycles.length ? filteredCycles.map((item) => (
                    <tr key={item.id} onClick={() => setSelectedCycle(item)} className="cursor-pointer transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-primary">{item.id}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold">{item.name}</td>
                      <td className="px-5 py-3.5 text-center"><TypePill>{item.days} días</TypePill></td>
                      <td className="px-5 py-3.5"><StatusPill>{item.status}</StatusPill></td>
                    </tr>
                  )) : <EmptyTableRow colSpan={4} onClear={() => setCycleStatus('')} />}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-on-surface-variant">{footerPrimaryText}{listLoading && api ? ' …' : ''}</p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={goPrevPage} disabled={!canPrevPage} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-35">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="px-2 text-xs font-bold text-on-surface-variant">{pageIndicator}</span>
                <button type="button" onClick={goNextPage} disabled={!canNextPage} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-35">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">{selectedCycle ? <CycleDetail item={selectedCycle} onEdit={() => setModal('editar-ciclo')} /> : <EmptyDetail title="Ningún ciclo seleccionado" />}</div>
        </div>
      ) : null}

      {activeTab === 'asignaciones' ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest lg:col-span-7">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
              <h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm">person_pin</span>
                ASIGNACIONES
              </h3>
              <div className="flex items-center gap-2">
                <FilterSelect value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)} minWidth="min-w-[9rem]">
                  <option value="">Todos los tipos</option>
                  <option value="horario">Horario fijo</option>
                  <option value="ciclo">Ciclo rotativo</option>
                </FilterSelect>
                <FilterSelect value={assignmentStatus} onChange={(e) => setAssignmentStatus(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option value="activa">Activa</option>
                  <option value="vencida">Vencida</option>
                </FilterSelect>
                <button type="button" onClick={() => { setAssignmentType(''); setAssignmentStatus('') }} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low">
                  <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Legajo</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Empleado</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Horario / Ciclo</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.length ? filteredAssignments.map((item) => (
                    <tr key={item.id} onClick={() => setSelectedAssignment(item)} className="cursor-pointer transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-primary">{item.legajo}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${item.avatarClass}`}>{item.initials}</div>
                          {item.employeeRoute ? (
                            <Link to={item.employeeRoute} onClick={(event) => event.stopPropagation()} className="text-sm font-semibold hover:text-primary hover:underline">{item.employee}</Link>
                          ) : (
                            <span className="text-sm font-semibold">{item.employee}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><TypePill variant={item.type === 'ciclo' ? 'tertiary' : 'default'}>{item.typeLabel}</TypePill></td>
                      <td className="px-5 py-3.5 text-sm font-medium">{item.resource}</td>
                      <td className="px-5 py-3.5"><StatusPill>{item.status}</StatusPill></td>
                    </tr>
                  )) : <EmptyTableRow colSpan={5} onClear={() => { setAssignmentType(''); setAssignmentStatus('') }} />}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-on-surface-variant">{footerPrimaryText}{listLoading && api ? ' …' : ''}</p>
              <div className="flex items-center gap-1">
                <button type="button" onClick={goPrevPage} disabled={!canPrevPage} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-35">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="px-2 text-xs font-bold text-on-surface-variant">{pageIndicator}</span>
                <button type="button" onClick={goNextPage} disabled={!canNextPage} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-35">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5">{selectedAssignment ? <AssignmentDetail item={selectedAssignment} onEdit={() => setModal('editar-asignacion')} /> : <EmptyDetail title="Ninguna asignación seleccionada" />}</div>
        </div>
      ) : null}

        </div>
      </div>

      <ScheduleModal
        open={modal === 'nuevo-horario' || modal === 'editar-horario'}
        mode={modal === 'editar-horario' ? 'edit' : 'create'}
        initialSchedule={modal === 'editar-horario' ? selectedSchedule : null}
        apiMode={api}
        onClose={() => setModal('')}
        onDone={(msg) => { setModal(''); refreshOverview(); showToast(msg) }}
      />
      <CycleModal
        open={modal === 'nuevo-ciclo' || modal === 'editar-ciclo'}
        mode={modal === 'editar-ciclo' ? 'edit' : 'create'}
        initialCycle={modal === 'editar-ciclo' ? selectedCycle : null}
        catalogHorarios={api ? catalogHorarios : mockHorarioCatalog}
        apiMode={api}
        onClose={() => setModal('')}
        onDone={(msg) => { setModal(''); refreshOverview(); showToast(msg) }}
      />
      <AssignmentModal
        open={modal === 'asignar-horario'}
        title="Asignar Horario"
        mode="horario"
        catalogEmployees={api ? catalogEmployees : mockEmployeeCatalog}
        catalogHorarios={api ? catalogHorarios : mockHorarioCatalog}
        catalogCiclos={api ? catalogCiclos : mockCicloCatalog}
        apiMode={api}
        onClose={() => setModal('')}
        onDone={(msg) => { setModal(''); refreshOverview(); showToast(msg) }}
      />
      <AssignmentModal
        open={modal === 'asignar-ciclo'}
        title="Asignar Ciclo Rotativo"
        mode="ciclo"
        catalogEmployees={api ? catalogEmployees : mockEmployeeCatalog}
        catalogHorarios={api ? catalogHorarios : mockHorarioCatalog}
        catalogCiclos={api ? catalogCiclos : mockCicloCatalog}
        apiMode={api}
        onClose={() => setModal('')}
        onDone={(msg) => { setModal(''); refreshOverview(); showToast(msg) }}
      />
      <EditAssignmentModal
        open={modal === 'editar-asignacion'}
        assignment={selectedAssignment}
        apiMode={api}
        onClose={() => setModal('')}
        onDone={(msg) => { setModal(''); refreshOverview(); showToast(msg) }}
      />
    </AppShell>
  )
}

function EmptyDetail({ title }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/50 bg-surface-container-lowest px-6 py-16 text-center"><span className="material-symbols-outlined mb-3 text-4xl text-outline-variant">touch_app</span><p className="text-sm font-semibold text-on-surface-variant">{title}</p><p className="mt-1 text-xs text-on-surface-variant/60">Hacé clic en una fila para ver el detalle</p></div>
}

function ScheduleDetail({ item, onEdit }) {
  return <><div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">info</span> DETALLE</h3><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-on-surface-variant">{item.id}</span><button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"><span className="material-symbols-outlined text-sm">edit</span> Editar</button></div></div><div className="space-y-3 p-5"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Nombre</span><span className="text-sm font-bold">{item.name}</span></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Tipo</span><TypePill variant={item.type === 'Flexible' ? 'primary' : item.type === 'Rotativo' ? 'tertiary' : 'default'}>{item.type}</TypePill></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Estado</span><StatusPill>{item.status}</StatusPill></div>{item.type === 'Flexible' ? <div className="space-y-2 rounded-xl bg-primary-container/20 p-3.5"><p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary"><span className="material-symbols-outlined text-sm">tune</span> Flexibilidad</p><div className="flex items-center justify-between"><span className="text-xs text-on-surface-variant">Modo</span><span className="text-xs font-bold capitalize">{item.flexModeLabel || item.flexMode}</span></div>{String(item.flexMode).toLowerCase() === 'semanal' ? <div className="flex items-center justify-between"><span className="text-xs text-on-surface-variant">Horas objetivo semanales</span><span className="text-sm font-black text-primary">{item.weeklyHours ?? '—'}</span></div> : <div className="flex items-center justify-between"><span className="text-xs text-on-surface-variant">Horas objetivo diarias</span><span className="text-sm font-black text-primary">{item.dailyHours ?? item.weeklyHours ?? '—'}</span></div>}</div> : null}<div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Tolerancia Entrada</p><p className="text-lg font-black text-primary">{item.entryTol}m</p></div><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Tolerancia Salida</p><p className="text-lg font-black text-primary">{item.exitTol}m</p></div></div><div className="flex items-center justify-between rounded-lg bg-tertiary-container/25 p-3.5"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-tertiary">coffee</span><span className="text-xs font-semibold text-on-tertiary-container">Descanso mínimo</span></div><span className="text-sm font-black text-tertiary">{item.breakMin}m</span></div></div></div><div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">calendar_view_week</span> DESGLOSE SEMANAL</h3></div><div className="grid grid-cols-7 gap-1.5 p-4">{item.weeklyCells?.length ? item.weeklyCells.map((cell) => (
                  <div
                    key={cell.label}
                    className={`${cell.free ? 'border-outline-variant bg-surface-container-high/50 opacity-75' : 'border-primary bg-primary-container/30'} rounded-lg border-t-2 p-2 text-center`}
                  >
                    <p className="text-[9px] font-black uppercase text-on-surface-variant">{cell.label}</p>
                    {cell.free ? <p className="mt-2 text-[10px] text-on-surface-variant">Libre</p> : <><p className="mt-1 text-[10px] font-bold text-primary">{cell.start}</p><p className="text-[10px] text-on-surface-variant">{cell.end}</p></>}
                  </div>
                )) : weekDays.map((day, index) => <div key={day} className={`${index > 4 ? 'bg-surface-container-high/50 border-outline-variant opacity-50' : 'bg-primary-container/30 border-primary'} rounded-lg border-t-2 p-2 text-center`}><p className="text-[9px] font-black uppercase text-on-surface-variant">{day}</p>{index > 4 ? <p className="mt-2 text-[10px] text-on-surface-variant">Libre</p> : <><p className="mt-1 text-[10px] font-bold text-primary">{item.start}</p><p className="text-[10px] text-on-surface-variant">{index === 4 ? item.weeklyEnd : item.end}</p></>}</div>)}</div></div></>
}

function CycleDetail({ item, onEdit }) {
  const fallback = Array.from({ length: Math.min(item.days ?? 6, 6) }, (_, i) => {
    const dayNum = i + 1
    return {
      day: dayNum,
      label: dayNum > 4 ? 'Libre' : dayNum > 2 ? 'H-004 · Tarde' : 'H-001 · Mañana',
    }
  })
  const rows = item.mappingRows?.length ? item.mappingRows : fallback
  return <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">info</span> DETALLE DEL CICLO</h3><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-on-surface-variant">{item.id}</span><button type="button" onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"><span className="material-symbols-outlined text-sm">edit</span> Editar</button></div></div><div className="p-5"><div className="mb-4 flex items-center justify-between rounded-xl bg-surface-container-low p-4"><div><p className="mb-0.5 text-[10px] font-bold uppercase text-on-surface-variant">Nombre</p><p className="text-sm font-bold">{item.name}</p></div><div className="text-right"><p className="mb-0.5 text-[10px] font-bold uppercase text-on-surface-variant">Total días</p><p className="text-2xl font-black text-tertiary">{item.days}</p></div></div><div className="mb-4 flex items-center justify-between rounded-xl border border-slate-100 bg-surface-container-low px-4 py-3"><span className="text-[10px] font-bold uppercase text-on-surface-variant">Estado</span><StatusPill>{item.status}</StatusPill></div><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mapeo de días</p><div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">{rows.map((r, idx) => {
    const stripes = ['border-primary', 'border-tertiary', 'border-outline-variant']
    const b = stripes[idx % 3]
    return (<div key={`${r.day}-${idx}`} className={`flex items-center justify-between rounded-lg bg-surface-container-low border-l-4 p-2.5 text-sm ${b}${r.label?.toLowerCase?.() === 'libre' ? ' opacity-65' : ''}`}><span className="w-12 shrink-0 text-xs font-bold">Día {r.day}</span><span className="material-symbols-outlined text-sm text-outline-variant">arrow_right_alt</span><span className="min-w-0 truncate text-xs font-medium text-on-surface">{r.label}</span></div>)
  })}</div></div></div>
}

function AssignmentDetail({ item, onEdit }) {
  return <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">info</span> DETALLE DE ASIGNACIÓN</h3><button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"><span className="material-symbols-outlined text-sm">edit</span> Editar</button></div><div className="space-y-4 p-5"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${item.avatarClass}`}>{item.initials}</div><div><p className="text-sm font-bold">{item.employee}</p><p className="font-mono text-xs text-on-surface-variant">{item.legajo}</p></div></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Tipo</span><TypePill variant={item.type === 'ciclo' ? 'tertiary' : 'default'}>{item.typeLabel}</TypePill></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Asignado</span><span className="text-sm font-bold">{item.resource}</span></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Desde</p><p className="text-sm font-black text-primary">{item.from}</p></div><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Hasta</p><p className="text-sm font-black text-on-background">{item.to}</p></div></div><div className="flex items-center justify-between pt-1"><span className="text-xs text-on-surface-variant">Estado</span><StatusPill>{item.status}</StatusPill></div></div></div>
}

function WeekdayRowsEditor({ rows, onChange }) {
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  return (
    <div>
      <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Días laborables *</label>
      <div className="space-y-2">
        <div className="grid grid-cols-[7rem_1fr_1fr] items-center gap-3 border-b border-slate-100 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          <span>Día</span>
          <span>Entrada</span>
          <span>Salida</span>
        </div>
        <div className="space-y-1.5">
          {rows.map((r, index) => (
            <label key={r.diaSemana} className={`grid cursor-pointer grid-cols-[7rem_1fr_1fr] items-center gap-3 ${!r.laborable ? 'opacity-50' : ''}`}>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={r.laborable}
                  className="accent-primary"
                  onChange={(e) => {
                    const next = [...rows]
                    next[index] = { ...r, laborable: e.target.checked }
                    onChange(next)
                  }}
                />
                {dayNames[index]}
              </span>
              <input
                type="time"
                value={r.entrada}
                disabled={!r.laborable}
                onChange={(e) => {
                  const next = [...rows]
                  next[index] = { ...r, entrada: e.target.value }
                  onChange(next)
                }}
                className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 py-1.5 text-xs"
              />
              <input
                type="time"
                value={r.salida}
                disabled={!r.laborable}
                onChange={(e) => {
                  const next = [...rows]
                  next[index] = { ...r, salida: e.target.value }
                  onChange(next)
                }}
                className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 py-1.5 text-xs"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScheduleModal({ open, mode, initialSchedule, apiMode, onClose, onDone }) {
  const isEdit = mode === 'edit'
  const title = isEdit ? 'Editar Horario' : 'Nuevo Horario'
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('Fijo')
  const [breakMin, setBreakMin] = useState('60')
  const [entryTol, setEntryTol] = useState('5')
  const [exitTol, setExitTol] = useState('10')
  const [flexMode, setFlexMode] = useState('semanal')
  const [dailyH, setDailyH] = useState('8')
  const [weeklyH, setWeeklyH] = useState('40')
  const [weekRows, setWeekRows] = useState(() => weekdayInitialRowsFromScheduleItem(null))
  const [estadoRow, setEstadoRow] = useState('Activo')
  const [busy, setBusy] = useState(false)
  const submitGuard = useRef(false)

  useEffect(() => {
    if (!open) return
    if (initialSchedule) {
      setNombre(initialSchedule.name || '')
      setTipo(initialSchedule.type || 'Fijo')
      setBreakMin(String(initialSchedule.breakMin ?? 0))
      setEntryTol(String(initialSchedule.entryTol ?? 5))
      setExitTol(String(initialSchedule.exitTol ?? 10))
      const fm = String(initialSchedule.flexMode || 'semanal').toLowerCase()
      setFlexMode(fm === 'diaria' ? 'diaria' : 'semanal')
      setDailyH(String(initialSchedule.dailyHours ?? 8))
      setWeeklyH(String(initialSchedule.weeklyHours ?? 40))
      setWeekRows(weekdayInitialRowsFromScheduleItem(initialSchedule))
      setEstadoRow(initialSchedule.status === 'Inactivo' ? 'Inactivo' : 'Activo')
    } else {
      setNombre('')
      setTipo('Fijo')
      setBreakMin('60')
      setEntryTol('5')
      setExitTol('10')
      setFlexMode('semanal')
      setDailyH('8')
      setWeeklyH('40')
      setWeekRows(weekdayInitialRowsFromScheduleItem(null))
      setEstadoRow('Activo')
    }
  }, [open, initialSchedule])

  const isFlexible = tipo === 'Flexible'

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    if (submitGuard.current) return
    submitGuard.current = true
    setBusy(true)
    try {
      const base = {
        nombre: nombre.trim(),
        tipo,
        toleranciaEntradaMin: Number(entryTol) || 0,
        toleranciaSalidaMin: Number(exitTol) || 0,
        descansoMinimoMin: Number(breakMin) || 0,
        estado: estadoRow,
      }
      if (isFlexible) {
        base.modoFlexibilidad = flexMode === 'diaria' ? 'Diaria' : 'Semanal'
        if (flexMode === 'diaria') base.horasObjetivoDiarias = Number(dailyH)
        else base.horasObjetivoSemanales = Number(weeklyH)
        base.dias = []
      } else {
        base.dias = diasPayloadFromWeekRows(weekRows)
      }

      if (!apiMode) {
        onDone(isEdit ? 'Cambios guardados (demo).' : 'Horario creado (demo).')
        return
      }
      if (isEdit && initialSchedule?.rawId != null) {
        await updateSchedule(initialSchedule.rawId, base)
        onDone('Horario actualizado.')
      } else {
        await createSchedule(base)
        onDone('Horario creado.')
      }
    } catch (err) {
      onDone(`Error: ${err.message}`)
    } finally {
      submitGuard.current = false
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose} size="max-w-xl">
      <form onSubmit={onSubmit} className="space-y-5 px-8 py-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre *">
            <TextInput required placeholder="Ej: Planta Mañana" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Field>
          <Field label="Tipo *">
            <SelectInput required value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Seleccionar...</option>
              <option value="Fijo">Fijo</option>
              <option value="Flexible">Flexible</option>
              <option value="Rotativo">Rotativo</option>
            </SelectInput>
          </Field>
          <Field label="Estado">
            <SelectInput value={estadoRow} onChange={(e) => setEstadoRow(e.target.value)}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </SelectInput>
          </Field>
          <Field label="Descanso mínimo (min)">
            <TextInput type="number" min="0" max="120" value={breakMin} onChange={(e) => setBreakMin(e.target.value)} />
          </Field>
        </div>
        {isFlexible ? (
          <div className="space-y-4 rounded-xl border border-primary/20 bg-primary-container/20 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-sm">tune</span>
              Configuración de flexibilidad
            </p>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3">
                <input type="radio" name="modo-flex-sch" checked={flexMode === 'diaria'} onChange={() => setFlexMode('diaria')} />
                <div>
                  <p className="text-sm font-semibold">Diaria</p>
                  <p className="text-[10px] text-on-surface-variant">Objetivo por día</p>
                </div>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3">
                <input type="radio" name="modo-flex-sch" checked={flexMode === 'semanal'} onChange={() => setFlexMode('semanal')} />
                <div>
                  <p className="text-sm font-semibold">Semanal</p>
                  <p className="text-[10px] text-on-surface-variant">Objetivo por semana</p>
                </div>
              </label>
            </div>
            {flexMode === 'diaria' ? (
              <Field label="Horas objetivo diarias *">
                <TextInput type="number" min="1" max="12" step="0.5" value={dailyH} onChange={(e) => setDailyH(e.target.value)} />
              </Field>
            ) : null}
            {flexMode === 'semanal' ? (
              <Field label="Horas objetivo semanales *">
                <TextInput type="number" min="1" max="60" step="0.5" value={weeklyH} onChange={(e) => setWeeklyH(e.target.value)} />
              </Field>
            ) : null}
          </div>
        ) : (
          <WeekdayRowsEditor rows={weekRows} onChange={setWeekRows} />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tolerancia entrada (min)">
            <TextInput type="number" min="0" max="60" value={entryTol} onChange={(e) => setEntryTol(e.target.value)} />
          </Field>
          <Field label="Tolerancia salida (min)">
            <TextInput type="number" min="0" max="60" value={exitTol} onChange={(e) => setExitTol(e.target.value)} />
          </Field>
        </div>
        <ModalActions onCancel={onClose} submitLabel={isEdit ? 'Guardar cambios' : 'Crear horario'} disabled={busy} />
      </form>
    </Modal>
  )
}

function CycleModal({ open, mode, initialCycle, catalogHorarios, apiMode, onClose, onDone }) {
  const isEdit = mode === 'edit'
  const title = isEdit ? 'Editar Ciclo' : 'Nuevo Ciclo Rotativo'
  const [nombre, setNombre] = useState('')
  const [duracionStr, setDuracionStr] = useState('7')
  const [horarioPorDia, setHorarioPorDia] = useState([])
  const [estadoCiclo, setEstadoCiclo] = useState('Activo')
  const [busy, setBusy] = useState(false)
  const submitGuard = useRef(false)

  useEffect(() => {
    if (!open) return
    const first = catalogHorarios[0]?.rawId != null ? String(catalogHorarios[0].rawId) : ''
    if (isEdit && initialCycle) {
      setNombre(initialCycle.name || '')
      const n = Math.max(2, Number(initialCycle.days) || 2)
      setDuracionStr(String(n))
      const next = []
      for (let d = 1; d <= n; d += 1) {
        const row = initialCycle.mappingRows?.find((m) => m.day === d)
        next.push(row?.scheduleId != null ? String(row.scheduleId) : first)
      }
      setHorarioPorDia(next)
      setEstadoCiclo(initialCycle.status === 'Inactivo' ? 'Inactivo' : 'Activo')
      return
    }
    setNombre('')
    setDuracionStr('7')
    const n = 7
    setHorarioPorDia(Array.from({ length: n }, () => first))
    setEstadoCiclo('Activo')
  }, [open, isEdit, initialCycle?.rawId, initialCycle?.days, initialCycle?.name])

  useEffect(() => {
    if (!open || !catalogHorarios.length) return
    setHorarioPorDia((prev) => {
      if (!prev.length) return prev
      const first = String(catalogHorarios[0].rawId)
      return prev.map((x) => (x === '' || x == null ? first : x))
    })
  }, [catalogHorarios, open])

  const onDuracionChange = (e) => {
    const v = e.target.value
    setDuracionStr(v)
    const n = Number(v)
    if (!Number.isFinite(n) || n < 2) return
    const first = catalogHorarios[0]?.rawId != null ? String(catalogHorarios[0].rawId) : ''
    setHorarioPorDia((prev) => {
      const out = prev.slice(0, n)
      while (out.length < n) out.push(first)
      return out
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    const n = Number(duracionStr)
    if (!Number.isFinite(n) || n < 2) {
      onDone('La duración debe ser al menos 2 días.')
      return
    }
    const detalle = horarioPorDia.slice(0, n).map((hid, i) => ({
      diaCiclo: i + 1,
      idHorario: Number(hid),
    }))
    if (detalle.some((d) => !Number.isFinite(d.idHorario))) {
      onDone(apiMode ? 'Seleccioná un horario en cada día (la base exige horario por día).' : 'Completá el mapeo de cada día.')
      return
    }

    if (submitGuard.current) return
    submitGuard.current = true
    setBusy(true)
    try {
      if (!apiMode) {
        onDone(isEdit ? 'Ciclo actualizado (demo).' : 'Ciclo creado (demo).')
        return
      }
      if (isEdit && initialCycle?.rawId != null) {
        await updateCycle(initialCycle.rawId, {
          nombre: nombre.trim(),
          duracionDias: n,
          detalle,
          estado: estadoCiclo,
        })
        onDone('Ciclo actualizado.')
      } else {
        await createCycle({
          nombre: nombre.trim(),
          duracionDias: n,
          detalle,
          estado: estadoCiclo,
        })
        onDone('Ciclo creado.')
      }
    } catch (err) {
      onDone(`Error: ${err.message}`)
    } finally {
      submitGuard.current = false
      setBusy(false)
    }
  }

  const len = Number(duracionStr)

  return (
    <Modal open={open} title={title} onClose={onClose} size="max-w-lg">
      <form onSubmit={onSubmit} className="space-y-5 px-8 py-6">
        <Field label="Nombre *">
          <TextInput required placeholder="Ej: Rotación Planta A" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Field>
        <Field label="Duración del ciclo (días) *">
          <TextInput required type="number" min="2" max="60" value={duracionStr} onChange={onDuracionChange} />
        </Field>
        <Field label="Estado">
          <SelectInput value={estadoCiclo} onChange={(e) => setEstadoCiclo(e.target.value)}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </SelectInput>
        </Field>
        <div>
          <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Mapeo de días *</label>
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {len >= 2 && Number.isFinite(len)
              ? Array.from({ length: len }, (_, index) => {
                const hid = horarioPorDia[index] ?? ''
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-bold text-on-surface-variant">Día {index + 1}</span>
                    <span className="material-symbols-outlined text-sm text-outline-variant">arrow_right_alt</span>
                    <SelectInput
                      required
                      value={hid}
                      onChange={(e) => {
                        const v = e.target.value
                        setHorarioPorDia((prev) => {
                          const next = [...prev]
                          next[index] = v
                          return next
                        })
                      }}
                    >
                      <option value="">— Horario —</option>
                      {catalogHorarios.map((h) => (
                        <option key={h.rawId ?? h.label} value={h.rawId != null ? String(h.rawId) : ''}>
                          {h.label}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                )
              })
              : <p className="text-xs italic text-on-surface-variant">Ingresá la duración para configurar los días.</p>}
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-tertiary/20 bg-tertiary-container/20 p-3">
          <span className="material-symbols-outlined mt-0.5 text-sm text-tertiary">info</span>
          <p className="text-[11px] text-on-tertiary-container">
            Cada día del ciclo debe referenciar un horario existente en la base de datos.
          </p>
        </div>
        <ModalActions onCancel={onClose} submitLabel={isEdit ? 'Guardar cambios' : 'Crear ciclo'} disabled={busy} />
      </form>
    </Modal>
  )
}

function AssignmentModal({ open, title, mode, catalogEmployees, catalogHorarios, catalogCiclos, apiMode, onClose, onDone }) {
  const [legajoId, setLegajoId] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [busy, setBusy] = useState(false)
  const submitGuard = useRef(false)

  useEffect(() => {
    if (!open) return
    setLegajoId('')
    setResourceId('')
    setFechaDesde('')
    setFechaHasta('')
  }, [open, mode])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!legajoId || !resourceId || !fechaDesde) {
      onDone('Completá empleado, recurso y fecha de inicio.')
      return
    }
    if (submitGuard.current) return
    submitGuard.current = true
    setBusy(true)
    try {
      if (!apiMode) {
        onDone('Asignación registrada (demo).')
        return
      }
      const legajoNum = Number(legajoId)
      if (mode === 'ciclo') {
        await createEmployeeAssignment(String(legajoNum), {
          type: 'ciclo',
          targetId: Number(resourceId),
          fechaDesde,
          fechaHasta: fechaHasta || null,
        })
        onDone('Ciclo asignado al empleado.')
      } else {
        await createScheduleAssignment({
          legajo: legajoNum,
          idHorario: Number(resourceId),
          fechaDesde,
          fechaHasta: fechaHasta || null,
        })
        onDone('Horario asignado al empleado.')
      }
    } catch (err) {
      onDone(`Error: ${err.message}`)
    } finally {
      submitGuard.current = false
      setBusy(false)
    }
  }

  const resourceList = mode === 'ciclo' ? catalogCiclos : catalogHorarios

  return (
    <Modal open={open} title={title} onClose={onClose} size="max-w-lg">
      <form onSubmit={onSubmit} className="space-y-4 px-8 py-6">
        <Field label="Empleado *">
          <SelectInput required value={legajoId} onChange={(e) => setLegajoId(e.target.value)}>
            <option value="">Seleccionar empleado...</option>
            {catalogEmployees.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.legajo} · {emp.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label={mode === 'ciclo' ? 'Ciclo *' : 'Horario *'}>
          <SelectInput required value={resourceId} onChange={(e) => setResourceId(e.target.value)}>
            <option value="">Seleccionar...</option>
            {resourceList.map((r) => (
              <option key={r.rawId ?? r.label} value={r.rawId != null ? String(r.rawId) : ''}>
                {r.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha desde / inicio *">
            <TextInput required type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </Field>
          <Field label="Fecha hasta (opcional)">
            <TextInput type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </Field>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-surface-container-low p-3">
          <span className="material-symbols-outlined mt-0.5 text-sm text-on-surface-variant">info</span>
          <p className="text-[11px] text-on-surface-variant">
            {mode === 'ciclo'
              ? 'La fecha hasta cierra el ciclo para el empleado; vacío = vigencia abierta según reglas de la base.'
              : 'Si hay solapamiento con otra asignación de horario, el servidor puede rechazar el alta.'}
          </p>
        </div>
        <ModalActions onCancel={onClose} submitLabel="Confirmar asignación" disabled={busy} />
      </form>
    </Modal>
  )
}

function EditAssignmentModal({ open, assignment, apiMode, onClose, onDone }) {
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [busy, setBusy] = useState(false)
  const submitGuard = useRef(false)

  useEffect(() => {
    if (!open || !assignment) return
    setFechaDesde(assignment.fromDateIso || '')
    setFechaHasta(assignment.toDateIso || '')
  }, [open, assignment])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (submitGuard.current) return
    submitGuard.current = true
    setBusy(true)
    try {
      if (!apiMode) {
        onDone('Cambios guardados (demo).')
        return
      }
      if (!assignment) return
      if (assignment.type === 'horario') {
        const id = assignment.asignacionHorarioIdNum
        if (id == null) {
          onDone('No se pudo identificar la asignación de horario.')
          return
        }
        await updateScheduleAssignment(id, { fechaHasta: fechaHasta || null })
        onDone('Fecha de fin actualizada.')
      } else {
        const id = assignment.empleadoCicloIdNum
        if (id == null) {
          onDone('No se pudo identificar la asignación de ciclo.')
          return
        }
        await updateCycleAssignment(id, {
          fechaInicio: fechaDesde,
          fechaFin: fechaHasta === '' ? null : fechaHasta,
        })
        onDone('Asignación de ciclo actualizada.')
      }
    } catch (err) {
      onDone(`Error: ${err.message}`)
    } finally {
      submitGuard.current = false
      setBusy(false)
    }
  }

  const title = 'Editar asignación'

  return (
    <Modal open={open} title={title} onClose={onClose} size="max-w-md">
      <form onSubmit={onSubmit} className="space-y-5 px-8 py-6">
        <Field label="Empleado">
          <TextInput readOnly value={assignment?.employee ?? ''} />
        </Field>
        <Field label="Tipo">
          <TextInput readOnly value={assignment?.typeLabel ?? ''} />
        </Field>
        <Field label="Recurso">
          <TextInput readOnly value={assignment?.resource ?? ''} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={assignment?.type === 'ciclo' ? 'Fecha inicio *' : 'Fecha desde'}>
            <TextInput
              type="date"
              required={assignment?.type === 'ciclo'}
              readOnly={assignment?.type === 'horario'}
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </Field>
          <Field label="Fecha hasta">
            <TextInput type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </Field>
        </div>
        {assignment?.type === 'horario' ? (
          <p className="text-[11px] text-on-surface-variant">Solo se puede ajustar la fecha de fin; “desde” viene de la base.</p>
        ) : null}
        <ModalActions onCancel={onClose} submitLabel="Guardar cambios" disabled={busy} />
      </form>
    </Modal>
  )
}
