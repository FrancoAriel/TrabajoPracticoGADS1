import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Modal from '../../components/ui/Modal'
import { isApiMode } from '../../config/env'
import { routes } from '../../lib/routes'
import { listEmployees } from '../../services/employeeService'
import {
  createManualPunch,
  createPunchCorrection,
  listPunches,
} from '../../services/punchService'

/** Mocks (solo VITE_DATA_SOURCE=mock). */
const baseItems = [
  { id: null, employeeId: 42, legajo: '0042', empleado: 'Juan Perez', initials: 'JP', avatarClass: 'bg-blue-100 text-primary', fecha: '12/06/2025 09:11', tipo: 'Entrada', origen: 'Biométrico', origenIcon: 'fingerprint', correction: false },
  { id: null, employeeId: 18, legajo: '0018', empleado: 'Ana Gomez', initials: 'AG', avatarClass: 'bg-purple-100 text-tertiary', fecha: '12/06/2025 09:03', tipo: 'Entrada', origen: 'Biométrico', origenIcon: 'fingerprint', correction: false },
  { id: null, employeeId: 50, legajo: '0050', empleado: 'Carla Ruiz', initials: 'CR', avatarClass: 'bg-purple-100 text-tertiary', fecha: '12/06/2025 08:55', tipo: 'Entrada', origen: 'Biométrico', origenIcon: 'fingerprint', correction: false },
  { id: null, employeeId: 27, legajo: '0027', empleado: 'Martin Sosa', initials: 'MS', avatarClass: 'bg-slate-200 text-slate-600', fecha: '12/06/2025 06:02', tipo: 'Entrada', origen: 'App móvil', origenIcon: 'smartphone', correction: false },
  { id: null, employeeId: 158, legajo: '0158', empleado: 'Maria Alvez', initials: 'MA', avatarClass: 'bg-slate-200 text-slate-600', fecha: '12/06/2025 09:18', tipo: 'Entrada', origen: 'Biométrico', origenIcon: 'fingerprint', correction: true },
  { id: null, employeeId: 892, legajo: '0892', empleado: 'Roberto Gomez', initials: 'RG', avatarClass: 'bg-blue-100 text-primary', fecha: '12/06/2025 18:02', tipo: 'Salida', origen: 'Biométrico', origenIcon: 'fingerprint', correction: false },
  { id: null, employeeId: 42, legajo: '0042', empleado: 'Juan Perez', initials: 'JP', avatarClass: 'bg-blue-100 text-primary', fecha: '12/06/2025 19:45', tipo: 'Salida', origen: 'Biométrico', origenIcon: 'fingerprint', correction: false },
  { id: null, employeeId: 31, legajo: '0031', empleado: 'Luis Diaz', initials: 'LD', avatarClass: 'bg-red-100 text-error', fecha: '12/06/2025 09:31', tipo: 'Entrada', origen: 'Manual', origenIcon: 'edit_note', correction: false },
]

const employeeOptionsMock = ['0042 — Juan Perez', '0018 — Ana Gomez', '0027 — Martin Sosa', '0031 — Luis Diaz', '0050 — Carla Ruiz', '0158 — Maria Alvez', '0892 — Roberto Gomez']

const mockHorario = {
  '0042': { horario: 'Mañana 09:00–18:00', jornada: '9h (completa)' },
  '0018': { horario: 'Mañana 09:00–18:00', jornada: '9h (completa)' },
  '0050': { horario: 'Temprano 08:00–17:00', jornada: '9h (completa)' },
  '0027': { horario: 'Rotativo A 06:00–14:00', jornada: '8h (completa)' },
  '0158': { horario: 'Mañana 09:00–18:00', jornada: '9h (completa)' },
  '0892': { horario: 'Tarde 14:00–22:00', jornada: '8h (completa)' },
  '0031': { horario: 'Mañana 09:00–13:00', jornada: '4h (parcial)' },
}

const ORIGIN_FILTERS_UI_TO_DB = {
  Biométrico: 'Biometrico',
  'App móvil': 'Api',
  Manual: 'Manual',
  QR: 'Qr',
  'PIN / Teclado': 'Pin',
}

const AVATAR_CYCLE = [
  'bg-blue-100 text-primary',
  'bg-purple-100 text-tertiary',
  'bg-slate-200 text-slate-600',
  'bg-red-100 text-error',
]

function originDbToUi(db) {
  const m = {
    Biometrico: ['Biométrico', 'fingerprint'],
    Manual: ['Manual', 'edit_note'],
    Api: ['App móvil', 'smartphone'],
    Qr: ['QR', 'qr_code'],
    Pin: ['PIN / Teclado', 'keyboard'],
  }
  const row = m[db]
  if (row) return row
  return [db ? String(db) : '—', 'fingerprint']
}

function initialsFrom(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '—'
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}

function formatHeaderDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, da] = dateStr.split('-').map(Number)
  if (!y || !m || !da) return dateStr
  return `${String(da).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

function tsToParts(ts) {
  if (!ts) return { fecha: '', hora: '' }
  const d = new Date(ts)
  if (Number.isNaN(d.getTime()))
    return { fecha: typeof ts === 'string' ? ts.slice(0, 10) : '', hora: '09:00' }
  const pad = (n) => String(n).padStart(2, '0')
  return {
    fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

function pickOriginalPunchShape(api) {
  return api.originalPunch ?? api.fichadaOriginal ?? api.originalFichada ?? api.original ?? null
}

/** Id de la fichada corregida (varios aliases según backend / adaptador). */
function pickOriginalPunchId(api) {
  const o = pickOriginalPunchShape(api)
  return api.originalPunchId ?? api.originalId ?? api.idFichadaOriginal ?? api.originalFichadaId
    ?? api.id_fichada_original ?? api.idFichadaCorregida ?? o?.id ?? o?.originalId ?? null
}

function pickOriginalTimestamp(api, orig) {
  return api.originalTimestamp ?? api.originalFechaHora ?? api.original_fecha_hora
    ?? orig?.timestamp ?? orig?.fecha_hora ?? orig?.fechaHora ?? null
}

function mapApiPunch(api) {
  const name = api.employeeName || 'Sin datos'
  const [origLabel, origIcon] = originDbToUi(api.origin)
  const orig = pickOriginalPunchShape(api)
  const originalId = pickOriginalPunchId(api)
  const rawOrigTs = pickOriginalTimestamp(api, orig)
  const origTipo = api.originalType ?? orig?.tipo ?? orig?.type
  const origOrigenRaw = api.originalOrigin ?? orig?.origen ?? orig?.origin
  const [origOrigenUi] = origOrigenRaw != null ? originDbToUi(origOrigenRaw) : ['', '']
  return {
    id: api.id,
    employeeId: api.employeeId,
    legajo: api.legajo,
    empleado: name,
    initials: initialsFrom(name),
    avatarClass: AVATAR_CYCLE[(Number(api.legajo) || 0) % AVATAR_CYCLE.length],
    fecha: formatTimestamp(api.timestamp),
    tipo: api.type,
    origen: origLabel,
    origenIcon: origIcon,
    correction: !!(api.correction ?? api.es_correccion ?? api.esCorreccion),
    originalId,
    originalFecha: rawOrigTs ? formatTimestamp(rawOrigTs) : null,
    originalTipo: origTipo || null,
    originalOrigen: origOrigenUi || null,
    _ts: api.timestamp,
  }
}

/** `Entrada/Salida` - origen biométrico, manual, etc. */
function formatTipoOrigenLine(tipo, origen) {
  const t = (tipo ?? '').trim() || '—'
  const o = (origen ?? '').trim() || '—'
  return `${t} - ${o}`
}

/** Textos para “Trazabilidad de corrección” (layout docs/fichadas.html). */
function traceabilityTexts(row, apiMode) {
  if (!row?.correction) return null

  let origLine1
  let origLine2
  if (apiMode) {
    const hasEmbedded = !!(row.originalFecha || row.originalTipo || row.originalOrigen)
    if (hasEmbedded) {
      origLine1 = formatTipoOrigenLine(row.originalTipo, row.originalOrigen)
      origLine2 = row.originalFecha || '—'
    }
    else {
      origLine1 = formatTipoOrigenLine(null, null)
      origLine2 = '—'
    }
  }
  else {
    origLine1 = formatTipoOrigenLine(row.tipo, row.origen)
    origLine2 = row.fecha
  }

  const nuevoLine1 = `${row.tipo} - Manual (corregida)`
  const nuevoLine2 = apiMode ? row.fecha : '13/06/2025 10:05'
  const operador = 'admin'
  const motivo = 'Error del dispositivo'

  let origMotivo = row.originalOrigen ?? null
  if (!origMotivo && typeof origLine1 === 'string' && origLine1.includes(' - ')) {
    const parts = origLine1.split(' - ')
    parts.shift()
    origMotivo = parts.join(' - ').trim() || null
  }
  if (!origMotivo || origMotivo === '—') origMotivo = 'Marcación automática'
  const origOperador = 'Sistema'

  return {
    origLine1,
    origLine2,
    nuevoLine1,
    nuevoLine2,
    operador,
    motivo,
    origOperador,
    origMotivo,
  }
}

/** Pie compartido (person · info) entre registro original y corrección aplicada. */
function TrazabilidadPie({ operador, motivo, borderClass }) {
  return (
    <div className={`mt-2.5 flex items-center gap-3 border-t pt-2.5 text-xs text-on-surface-variant ${borderClass}`}>
      <span className="flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">person</span>
        <span className="font-semibold text-on-background">{operador}</span>
      </span>
      <span>·</span>
      <span className="flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">info</span>
        <span>{motivo}</span>
      </span>
    </div>
  )
}
function TrazabilidadCorreccion({ row, apiMode }) {
  const traz = traceabilityTexts(row, apiMode)
  if (!traz) return null
  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
        <span className="material-symbols-outlined text-sm text-tertiary">history</span> Trazabilidad de corrección
      </p>
      <div className="space-y-0">
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-outline-variant" />
            <div className="my-1 flex-1 w-px bg-outline-variant/40" />
          </div>
          <div className="flex-1 pb-4">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Registro original</p>
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3">
              <p className="text-sm font-semibold text-on-background">{traz.origLine1}</p>
              <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{traz.origLine2}</p>
              <TrazabilidadPie operador={traz.origOperador} motivo={traz.origMotivo} borderClass="border-outline-variant/40" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-tertiary" />
          </div>
          <div className="flex-1 pb-1">
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-tertiary">Corrección aplicada</p>
            <div className="rounded-xl border border-tertiary/25 bg-tertiary-container/25 px-4 py-3">
              <p className="text-sm font-semibold text-on-background">{traz.nuevoLine1}</p>
              <p className="mt-1 font-mono text-[11px] text-on-surface-variant">{traz.nuevoLine2}</p>
              <TrazabilidadPie operador={traz.operador} motivo={traz.motivo} borderClass="border-tertiary/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
  return (
    <select {...props} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">{children}</select>
  )
}

/** Tras POST fichada manual: resultado de tardanza/ausencia automática. */
function extraMsgFromAttendanceEvaluation(ev) {
  if (!ev) return ''
  if (ev.kind === 'created' && ev.details?.tipo === 'Tardanza') {
    return ` Se generó novedad de tardanza (${ev.details.minutos} min). Revisá Novedades.`
  }
  if (ev.kind === 'created' && ev.details?.tipo === 'Ausencia') {
    return ' Se generó novedad de ausencia. Revisá Novedades.'
  }
  if (ev.kind === 'ok') {
    return ' Sin tardanza (a tiempo o horario flexible).'
  }
  if (ev.kind === 'skipped') {
    const r = ev.details?.reason
    if (r === 'dia_no_laborable') return ' Día no laborable: no aplica control de ingreso.'
    if (r === 'sin_asignacion_horario') return ' Sin horario asignado: no se evaluó.'
    if (r === 'tardanza_ya_registrada') return ' Ya había tardanza registrada ese día.'
    if (r === 'ausencia_automatica_ya_registrada') return ' Ya había ausencia automática ese día.'
    if (r === 'ausencia_manual_u_otra_ya_cubre') return ''
    return ''
  }
  if (ev.kind === 'error') {
    return ` Error al evaluar: ${ev.details?.message || 'desconocido'}`
  }
  return ''
}

export default function FichadasPage() {
  const api = isApiMode()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterDate, setFilterDate] = useState(() => (api ? today : ''))
  const [filterType, setFilterType] = useState('')
  const [filterOrigin, setFilterOrigin] = useState('')
  const [clock, setClock] = useState('')
  const [selected, setSelected] = useState(null)
  const [openManual, setOpenManual] = useState(false)
  const [openCorrection, setOpenCorrection] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ page: 1, pageSize: 15, totalItems: 0, totalPages: 1 })
  const [punchStats, setPunchStats] = useState(null)
  const [page, setPage] = useState(1)
  const [employees, setEmployees] = useState([])
  const [correctionTargetId, setCorrectionTargetId] = useState(null)
  const [correctionSourceRow, setCorrectionSourceRow] = useState(null)
  const initialLoadPendingRef = useRef(api)
  const [initialLoading, setInitialLoading] = useState(api)
  const [manualForm, setManualForm] = useState({
    legajo: '', fecha: today, hora: '09:00', tipo: 'Entrada', origen: 'Manual',
  })
  const [corrForm, setCorrForm] = useState({
    fecha: today, hora: '09:00', tipo: 'Entrada',
  })

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3200)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    document.title = 'Fichadas - Executive Architect'
    const pad = (n) => String(n).padStart(2, '0')
    const update = () => {
      const now = new Date()
      setClock(`Última act. ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`)
    }
    update()
    const id = window.setInterval(update, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!api) return
    let c = false
    listEmployees({ pageSize: 500 })
      .then((data) => {
        if (!c) setEmployees(data.items || [])
      })
      .catch(() => {})
    return () => { c = true }
  }, [api])

  useLayoutEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterType, filterOrigin, filterDate])

  const mockFiltered = useMemo(() => baseItems.filter((item) => {
    const q = search.toLowerCase()
    return (
      (!q || item.legajo.includes(q) || item.empleado.toLowerCase().includes(q))
      && (!filterType || item.tipo === filterType)
      && (!filterOrigin || item.origen === filterOrigin)
    )
  }), [search, filterType, filterOrigin])

  const refreshPunches = useCallback(async () => {
    if (!api) return
    setLoading(true)
    const originDb = filterOrigin ? ORIGIN_FILTERS_UI_TO_DB[filterOrigin] : undefined
    try {
      const { items: rawItems, meta: m, stats } = await listPunches({
        search: debouncedSearch || undefined,
        type: filterType || undefined,
        origin: originDb,
        date: filterDate || today,
        page,
        pageSize: 15,
      })
      setRows((rawItems || []).map(mapApiPunch))
      setMeta(m || { page: 1, pageSize: 15, totalItems: 0, totalPages: 1 })
      setPunchStats(stats)
    } catch (e) {
      showToast(`Error al cargar fichadas: ${e.message}`)
      setRows([])
      setMeta({ page: 1, pageSize: 15, totalItems: 0, totalPages: 1 })
      setPunchStats(null)
    } finally {
      setLoading(false)
      if (initialLoadPendingRef.current) {
        initialLoadPendingRef.current = false
        setInitialLoading(false)
      }
    }
  }, [api, debouncedSearch, filterDate, filterOrigin, filterType, page, showToast, today])

  useEffect(() => {
    if (!api) return
    refreshPunches()
  }, [api, refreshPunches])

  const sourceRows = api ? rows : mockFiltered

  const items = sourceRows

  const mockStatsComputed = useMemo(() => ({
    totalDelDía: mockFiltered.length,
    entradas: mockFiltered.filter((i) => i.tipo === 'Entrada').length,
    salidas: mockFiltered.filter((i) => i.tipo === 'Salida').length,
  }), [mockFiltered])

  const statsForCards = api
    ? {
        totalDelDía: punchStats?.totalDelDía ?? 0,
        entradas: punchStats?.entradas ?? 0,
        salidas: punchStats?.salidas ?? 0,
      }
    : mockStatsComputed

  const clearFilters = () => {
    setFilterType('')
    setFilterOrigin('')
    if (api) setFilterDate(today)
    else setFilterDate('')
  }

  const infoFor = selected
    ? (mockHorario[selected.legajo] || { horario: '—', jornada: '—' })
    : null

  const submitManual = async (e) => {
    e.preventDefault()
    if (!manualForm.legajo) return
    const legajoNum = Number(manualForm.legajo)
    const fechaHora = `${manualForm.fecha}T${manualForm.hora}:00`
    if (!api) {
      setOpenManual(false)
      showToast('Fichada manual registrada (modo demo).')
      return
    }
    try {
      const res = await createManualPunch({ legajo: legajoNum, fechaHora, tipo: manualForm.tipo, origen: manualForm.origen })
      const extra = extraMsgFromAttendanceEvaluation(res?.attendanceEvaluation)
      showToast(`Fichada manual registrada.${extra}`.trim())
      setOpenManual(false)
      refreshPunches()
    } catch (err) {
      showToast(`No se pudo registrar: ${err.message}`)
    }
  }

  const submitCorrection = async (e) => {
    e.preventDefault()
    if (!api) {
      setOpenCorrection(false)
      setCorrectionTargetId(null)
      setCorrectionSourceRow(null)
      showToast('Corrección registrada (modo demo).')
      return
    }
    const id = correctionTargetId
    if (!id) {
      showToast('Falta la fichada a corregir.')
      return
    }
    try {
      const fechaHora = `${corrForm.fecha}T${corrForm.hora}:00`
      await createPunchCorrection(id, { fechaHora, tipo: corrForm.tipo })
      showToast('Corrección registrada.')
      setOpenCorrection(false)
      setCorrectionTargetId(null)
      setCorrectionSourceRow(null)
      refreshPunches()
    } catch (err) {
      showToast(`No se pudo registrar: ${err.message}`)
    }
  }

  const fechaTitulo = api ? formatHeaderDate(filterDate || today) : '12/06/2025'
  const totalFooter = api ? meta.totalItems : baseItems.length
  const mostrandoTxt = `${items.length} de ${totalFooter}`
  const pageLabel = api ? `${meta.page} / ${Math.max(1, meta.totalPages)}` : '1 / 1'

  const empleadoLink = (sel) =>
    `/empleados/${sel.employeeId != null ? sel.employeeId : Number(sel.legajo.replace(/\D/g, ''))}`

  const topbarSearch = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><span className="material-symbols-outlined text-sm">search</span></span>
        <input
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
          className="w-56 rounded-md border-none bg-surface-container-low py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary"
          placeholder="BUSCAR POR NOMBRE O LEGAJO..."
          type="text"
        />
      </div>
      <button type="button" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90">
        <span className="material-symbols-outlined text-sm">search</span> Buscar
      </button>
    </div>
  )

  if (initialLoading) {
    return (
      <AppShell topbarTitle="FICHADAS" topbarContent={topbarSearch}>
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
          <p className="text-sm font-semibold">Cargando fichadas...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      topbarTitle="FICHADAS"
      topbarContent={topbarSearch}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-background">Gestión de Fichadas</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Registros de asistencia del personal.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { if (api) showToast('Reprocesamiento no disponible en API básica.'); else showToast('Interpretación reprocesada correctamente.') }}
            className="flex items-center gap-2 rounded-md bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-secondary-container transition-colors hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-sm">auto_mode</span> Reprocesar
          </button>
          <button type="button" onClick={() => setOpenManual(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dim">
            <span className="material-symbols-outlined text-sm">add_circle</span> Nueva fichada manual
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total del día</p><p className="font-headline text-2xl font-black text-on-secondary-container">{statsForCards.totalDelDía}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Entradas</p><p className="font-headline text-2xl font-black text-green-600">{statsForCards.entradas}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Salidas</p><p className="font-headline text-2xl font-black text-red-600">{statsForCards.salidas}</p></div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
        {loading && !initialLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        )}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
              <span className="material-symbols-outlined text-sm">fingerprint</span>
              {` FICHADAS DEL DÍA — ${fechaTitulo || '—'} `}
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-green-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {api ? 'API' : 'Demo'}
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant">{clock}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={api ? (filterDate || today) : filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-3 text-xs font-medium text-on-surface-variant"
            />
            <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)} minWidth="min-w-[7rem]">
              <option value="">Todos los tipos</option>
              <option>Entrada</option>
              <option>Salida</option>
            </FilterSelect>
            <FilterSelect value={filterOrigin} onChange={(e) => setFilterOrigin(e.target.value)}>
              <option value="">Todos los orígenes</option>
              <option>Biométrico</option>
              <option>App móvil</option>
              <option>Manual</option>
              <option>QR</option>
              <option>PIN / Teclado</option>
            </FilterSelect>
            <button type="button" onClick={clearFilters} className="flex items-center gap-1 rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-sm">filter_alt_off</span> Limpiar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            {items.length > 0 && (
              <thead>
                <tr className="bg-surface-container-low">
                  {[
                    { label: 'Legajo' }, { label: 'Empleado' }, { label: 'Fecha / Hora' },
                    { label: 'Tipo', center: true }, { label: 'Origen' },
                    { label: 'Corrección', center: true }, { label: 'Acción' },
                  ].map(({ label, center }) => (
                    <th key={label} className={`px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant${center ? ' text-center' : ''}`}>{label}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100">
              {items.length ? items.map((item) => (
                <tr key={item.id ?? `${item.legajo}-${item.fecha}-${item.tipo}`} onClick={() => setSelected(item)} className="cursor-pointer transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm font-bold text-primary">{item.legajo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${item.avatarClass}`}>{item.initials}</div>
                      <span className="text-sm font-semibold">{item.empleado}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{item.fecha}</td>
                  <td className="px-4 py-3 text-center">
                    {item.tipo === 'Entrada'
                      ? <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-[10px] font-black uppercase text-green-700"><span className="material-symbols-outlined text-xs">login</span> Entrada</span>
                      : <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[10px] font-black uppercase text-red-700"><span className="material-symbols-outlined text-xs">logout</span> Salida</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">{item.origenIcon}</span> {item.origen}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-bold">
                    {item.correction
                      ? <span className="font-bold text-primary">Sí</span>
                      : <span className="text-on-surface-variant">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelected(item) }} className="rounded border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-blue-900">
                      Ver
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined mb-2 block text-3xl opacity-30">search_off</span>
                    No se encontraron fichadas con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <p className="text-xs text-on-surface-variant">{items.length === 0 ? 'Sin resultados' : `Mostrando ${mostrandoTxt} fichadas`}</p>
          <div className="flex items-center gap-2">
            <Link to={routes.exportaciones} className="mr-2 flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <span className="material-symbols-outlined text-sm">download</span> Exportar
            </Link>
            <button
              type="button"
              disabled={api && meta.page <= 1}
              onClick={() => api && setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="px-2 text-xs font-bold text-on-surface-variant">{pageLabel}</span>
            <button
              type="button"
              disabled={api && meta.page >= meta.totalPages}
              onClick={() => api && setPage((p) => p + 1)}
              className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <Modal open={!!selected} title={selected ? `Fichada — Legajo ${selected.legajo}` : ''} subtitle={selected ? `${selected.empleado} · ${selected.fecha}` : ''} onClose={() => setSelected(null)} size="max-w-xl">
        {selected ? (
          <div className="space-y-5 px-8 py-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Empleado', value: `${selected.empleado} (${selected.legajo})` },
                { label: 'Fecha / Hora', value: selected.fecha },
                { label: 'Tipo', value: selected.tipo },
                { label: 'Origen', value: selected.origen },
                { label: 'Corrección', value: selected.correction ? 'Sí' : 'No' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-primary">analytics</span> Interpretación del motor
              </p>
              <div className="mb-3 flex items-center gap-4 border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Horario:</span>
                  <span className="text-xs font-semibold text-on-background">{api ? '—' : infoFor?.horario}</span>
                </div>
                <span className="text-outline-variant">·</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">timelapse</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Jornada:</span>
                  <span className="text-xs font-semibold text-on-background">{api ? '—' : infoFor?.jornada}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border-b-2 border-error bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Tardanza</p>
                  <p className="text-base font-black text-error">{selected.tipo === 'Entrada' && !api ? '6 min' : '—'}</p>
                </div>
                <div className="rounded-lg border-b-2 border-primary bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Horas extra</p>
                  <p className="text-base font-black text-primary">{selected.tipo === 'Salida' && !api ? '105 min' : '—'}</p>
                </div>
                <div className="rounded-lg border-b-2 border-on-secondary-container bg-white p-3">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Efectivo</p>
                  <p className="text-base font-black text-on-secondary-container">{selected.tipo === 'Salida' && !api ? '9h 45m' : '—'}</p>
                </div>
              </div>
            </div>

            <TrazabilidadCorreccion row={selected} apiMode={api} />

            <div className="flex gap-2 border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  const id = selected.id
                  if (api && !id) showToast('No se puede corregir este registro (sin ID).')
                  else {
                    setCorrectionSourceRow({ ...selected })
                    const { fecha: fd, hora: th } = tsToParts(selected._ts)
                    setCorrForm({
                      fecha: fd || filterDate || today,
                      hora: th || '09:00',
                      tipo: selected.tipo || 'Entrada',
                    })
                    setCorrectionTargetId(id ?? null)
                    setSelected(null)
                    setOpenCorrection(true)
                  }
                }}
                disabled={api && selected.id == null}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span> Corregir
              </button>
              <Link
                to={empleadoLink(selected)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dim"
              >
                <span className="material-symbols-outlined text-sm">person</span> Ver empleado
              </Link>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={openManual} title="Nueva Fichada Manual" subtitle="Registrá una fichada en nombre del empleado." onClose={() => setOpenManual(false)} size="max-w-lg">
        <form className="space-y-4 px-8 py-6" onSubmit={submitManual}>
          <Field label="Empleado *">
            {api ? (
              <SelectInput required value={manualForm.legajo} onChange={(e) => setManualForm((f) => ({ ...f, legajo: e.target.value }))}>
                <option value="">Seleccionar empleado...</option>
                {employees.map((e) => (
                  <option key={e.id} value={String(e.legajo)}>{e.legajo} — {e.name}</option>
                ))}
              </SelectInput>
            ) : (
              <SelectInput required>
                <option value="">Seleccionar empleado...</option>
                {employeeOptionsMock.map((o) => <option key={o}>{o}</option>)}
              </SelectInput>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha *"><TextInput required type="date" value={manualForm.fecha} onChange={(e) => setManualForm((f) => ({ ...f, fecha: e.target.value }))} /></Field>
            <Field label="Hora *"><TextInput required type="time" value={manualForm.hora} onChange={(e) => setManualForm((f) => ({ ...f, hora: e.target.value }))} /></Field>
          </div>
          <Field label="Tipo *">
            <div className="flex gap-3">
              {['Entrada', 'Salida'].map((t) => (
                <label key={t} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 p-3 hover:bg-surface-container-low has-[:checked]:border-primary has-[:checked]:bg-primary-container/20`}>
                  <input type="radio" name="tipo-fich" value={t} checked={manualForm.tipo === t} onChange={() => setManualForm((f) => ({ ...f, tipo: t }))} className="accent-primary" required />
                  <span className={`material-symbols-outlined text-sm ${t === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>{t === 'Entrada' ? 'login' : 'logout'}</span>
                  <span className="text-sm font-semibold">{t}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Origen *">
            <SelectInput required value={manualForm.origen} onChange={(e) => setManualForm((f) => ({ ...f, origen: e.target.value }))}>
              <option value="Manual">Manual</option>
              <option value="Biometrico">Biométrico</option>
              <option value="Qr">QR</option>
              <option value="Pin">PIN / Teclado</option>
              <option value="Api">API externa</option>
            </SelectInput>
          </Field>
          <Field label="Motivo *">
            <textarea required rows={2} placeholder="Describí el motivo del registro manual..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <div className="flex items-start gap-2 rounded-lg border border-tertiary/20 bg-tertiary-container/20 p-3">
            <span className="material-symbols-outlined mt-0.5 text-sm text-tertiary">info</span>
            <p className="text-[11px] text-on-tertiary-container">Quedará registrada con origen trazable. Biométrico, QR, PIN y API son orígenes simulados para la entrega.</p>
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenManual(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">add_circle</span> Registrar
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={openCorrection} title="Registrar Corrección" subtitle="La fichada original no se modifica. Se registra una corrección con trazabilidad." onClose={() => { setOpenCorrection(false); setCorrectionTargetId(null); setCorrectionSourceRow(null) }} size="max-w-lg">
        <form className="space-y-4 px-8 py-6" onSubmit={submitCorrection}>
          {!api && (
            <Field label="Empleado *">
              <SelectInput required>
                <option value="">Seleccionar empleado...</option>
                {employeeOptionsMock.map((o) => <option key={o}>{o}</option>)}
              </SelectInput>
            </Field>
          )}
          {(correctionSourceRow || correctionTargetId != null) && (
            <div className="space-y-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Marcación que se corrige</p>
              {correctionSourceRow && (
                <>
                  <p className="font-semibold text-on-background">{correctionSourceRow.empleado} <span className="font-mono text-primary">({correctionSourceRow.legajo})</span></p>
                  <p className="text-on-surface-variant">{correctionSourceRow.fecha}</p>
                  <p className="text-xs text-on-surface-variant">{correctionSourceRow.tipo} · {correctionSourceRow.origen}</p>
                </>
              )}
              <p className="border-t border-outline-variant/30 pt-2 font-mono text-xs text-on-surface-variant">
                ID en base de datos:
                {' '}
                <span className="font-bold text-primary">{correctionTargetId != null ? `#${correctionTargetId}` : '—'}</span>
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nueva fecha *"><TextInput required type="date" value={corrForm.fecha} onChange={(e) => setCorrForm((f) => ({ ...f, fecha: e.target.value }))} /></Field>
            <Field label="Nueva hora *"><TextInput required type="time" value={corrForm.hora} onChange={(e) => setCorrForm((f) => ({ ...f, hora: e.target.value }))} /></Field>
          </div>
          <Field label="Tipo *">
            <div className="flex gap-3">
              {['Entrada', 'Salida'].map((t) => (
                <label key={t} className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 p-3 hover:bg-surface-container-low has-[:checked]:border-primary has-[:checked]:bg-primary-container/20">
                  <input type="radio" name="corr-tipo" value={t} checked={corrForm.tipo === t} onChange={() => setCorrForm((f) => ({ ...f, tipo: t }))} className="accent-primary" required />
                  <span className={`material-symbols-outlined text-sm ${t === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>{t === 'Entrada' ? 'login' : 'logout'}</span>
                  <span className="text-sm font-semibold">{t}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Motivo *">
            <SelectInput required>
              <option value="">Seleccionar motivo...</option>
              <option>Error del dispositivo</option>
              <option>El empleado olvidó fichar</option>
              <option>Hora incorrecta registrada</option>
              <option>Otro</option>
            </SelectInput>
          </Field>
          <Field label="Observación *">
            <textarea required rows={2} placeholder="Detalle adicional..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => { setOpenCorrection(false); setCorrectionTargetId(null); setCorrectionSourceRow(null) }} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">edit_note</span> Registrar corrección
            </button>
          </div>
        </form>
      </Modal>
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
          {toast}
        </div>
      )}
    </AppShell>
  )
}
