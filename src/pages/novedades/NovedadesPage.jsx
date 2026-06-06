import { useMemo, useState, useEffect, useCallback } from 'react'
import AppShell from '../../components/layout/AppShell'
import Modal from '../../components/ui/Modal'
import { isApiMode } from '../../config/env'
import { createNews, listNews, approveNews, rejectNews } from '../../services/newsService'

const TYPE_BADGE = {
  horas_extra_50: 'bg-tertiary-container/40 text-on-tertiary-container',
  horas_extra_100: 'bg-primary-container/40 text-on-primary-container',
  justificacion: 'bg-secondary-container/40 text-on-secondary-container',
  ausencia: 'bg-error-container/20 text-error',
  tardanza: 'bg-tertiary-container/40 text-on-tertiary-container',
  suspension: 'bg-error-container/20 text-error',
  licencia_enfermedad: 'bg-secondary-container/40 text-on-secondary-container',
  licencia_examen: 'bg-secondary-container/40 text-on-secondary-container',
  vacaciones: 'bg-primary-container/40 text-on-primary-container',
  permiso_especial: 'bg-secondary-container/40 text-on-secondary-container',
  salida_anticipada: 'bg-error-container/20 text-error',
  doble_fichada: 'bg-secondary-container/40 text-on-secondary-container',
  horas_faltantes: 'bg-error-container/20 text-error',
}

const initialItems = [
  { id: '#889', employee: 'Juan Perez', legajo: '0042', type: 'horas_extra_50', date: '12/06/2025', quantity: '30 min', origin: 'Automática', status: 'Pendiente', obs: '—', createdAt: '12/06/2025', createdBy: 'Sistema' },
  { id: '#890', employee: 'Juan Perez', legajo: '0042', type: 'justificacion', date: '10/06/2025', quantity: '1 día', origin: 'Manual', status: 'Aprobado', obs: 'Certificado médico presentado.', createdAt: '10/06/2025', createdBy: 'Administrator' },
  { id: '#891', employee: 'Juan Perez', legajo: '0042', type: 'tardanza', date: '12/06/2025', quantity: '15 min', origin: 'Automática', status: 'Rechazado', obs: 'No aplica criterio de tolerancia.', createdAt: '12/06/2025', createdBy: 'Sistema' },
  { id: '#892', employee: 'Ana Gomez', legajo: '0018', type: 'justificacion', date: '12/06/2025', quantity: '1 día', origin: 'Manual', status: 'Pendiente', obs: 'Solicita justificación por enfermedad.', createdAt: '12/06/2025', createdBy: 'Supervisor RRHH' },
  { id: '#893', employee: 'Luis Diaz', legajo: '0031', type: 'ausencia', date: '12/06/2025', quantity: '1 día', origin: 'Automática', status: 'Pendiente', obs: '—', createdAt: '12/06/2025', createdBy: 'Sistema' },
  { id: '#894', employee: 'Martin Sosa', legajo: '0027', type: 'horas_extra_100', date: '11/06/2025', quantity: '2h', origin: 'Automática', status: 'Aprobado', obs: '—', createdAt: '11/06/2025', createdBy: 'Sistema' },
]

const employeeOptions = ['0042 · Juan Perez', '0018 · Ana Gomez', '0027 · Martin Sosa', '0031 · Luis Diaz', '0050 · Carla Ruiz', '0093 · Carlos Méndez', '0105 · Lucía Ferrero', '0158 · Maria Alvez']

function StatusPill({ status }) {
  if (status === 'Pendiente') return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-tertiary"><span className="h-1.5 w-1.5 rounded-full bg-tertiary" />Pendiente</span>
  if (status === 'Aprobado') return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-600" />Aprobado</span>
  return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-error"><span className="h-1.5 w-1.5 rounded-full bg-error" />Rechazado</span>
}

const TYPE_LABEL = {
  horas_extra_50: 'Horas extra 50%',
  horas_extra_100: 'Horas extra 100%',
  justificacion: 'Justificación',
  ausencia: 'Ausencia',
  tardanza: 'Tardanza',
  suspension: 'Suspensión',
  licencia_enfermedad: 'Licencia enfermedad',
  licencia_examen: 'Licencia examen',
  vacaciones: 'Vacaciones',
  permiso_especial: 'Permiso especial',
  salida_anticipada: 'Salida anticipada',
  horas_faltantes: 'Horas faltantes',
  doble_fichada: 'Doble fichada',
  licencia: 'Licencia',
}

function TypeBadge({ type }) {
  const label = TYPE_LABEL[type] || type
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_BADGE[type] || 'bg-surface-container text-on-surface-variant'}`}>{label}</span>
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
  return <select {...props} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">{children}</select>
}

const HORAS_TYPES = ['horas_extra_50', 'horas_extra_100']
const MINUTOS_TYPES = ['tardanza']
const DIAS_TYPES = ['justificacion', 'ausencia', 'licencia_enfermedad', 'licencia_examen', 'vacaciones', 'permiso_especial', 'suspension']

function formatApiDate(isoDate) {
  if (!isoDate) return '—'
  const [y, m, d] = String(isoDate).split('-')
  if (!y || !m || !d) return isoDate
  return `${d}/${m}/${y}`
}

function formatApiDateTime(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return String(iso)
  }
}

function formatNewsQuantity(c, u) {
  if (c == null || c === '') return '—'
  const n = Number(c)
  if (u === 'Minutos') return `${Number.isFinite(n) ? Math.round(n) : c} min`
  if (u === 'Horas') return `${c} hs`
  if (u === 'Dias') return `${c} día(s)`
  return String(c)
}

/**
 * El backend usa convención PascalCase con underscores (ej: "Horas_Extra_50",
 * "Salida_Anticipada", "Doble_Fichada"). El frontend usa snake_case en TYPE_LABEL
 * y TYPE_BADGE. Normalizamos pasando todo a lowercase: el separador "_" ya viene
 * del backend, así no hay que adivinar dónde van las mayúsculas.
 */
function mapApiTipoToFilterKey(tipo) {
  if (!tipo) return ''
  return String(tipo).toLowerCase()
}

function mapFilterKeyToApiTipo(tipo) {
  if (!tipo) return ''
  return String(tipo)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('_')
}

function mapEstadoToPill(estado) {
  if (estado === 'Aprobada') return 'Aprobado'
  if (estado === 'Rechazada') return 'Rechazado'
  if (estado === 'Pendiente') return 'Pendiente'
  return estado
}

function mapOriginToUi(o) {
  if (o === 'Automatica') return 'Automática'
  if (o === 'Manual') return 'Manual'
  return o || '—'
}

function mapNewsItemFromApi(n) {
  const uiType = mapApiTipoToFilterKey(n.type)
  return {
    id: n.id,
    rawId: n.id,
    employee: n.employee ?? '—',
    legajo: String(n.employeeId ?? '').padStart(4, '0'),
    type: uiType,
    date: formatApiDate(n.date),
    status: mapEstadoToPill(n.status),
    quantity: formatNewsQuantity(n.quantity, n.unit),
    origin: mapOriginToUi(n.origin),
    obs: n.note ?? '—',
    createdAt: formatApiDateTime(n.createdAt),
    createdBy: n.origin === 'Automatica' ? 'Sistema' : 'Usuario',
  }
}

export default function NovedadesPage() {
  const api = isApiMode()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [items, setItems] = useState(() => (api ? [] : initialItems))
  const [kpiStats, setKpiStats] = useState(() => (api ? { pending: 0, approved: 0, rejected: 0, total: 0 } : { pending: 9, approved: 4, rejected: 1, total: 28 }))
  const [loading, setLoading] = useState(() => api)
  const [dataReady, setDataReady] = useState(() => !api)
  const [selectedId, setSelectedId] = useState(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [novType, setNovType] = useState('')
  const [toast, setToast] = useState('')
  const [loadError, setLoadError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => { document.title = 'Novedades - Executive Architect' }, [])

  const loadNews = useCallback(async () => {
    if (!api) return
    setLoading(true)
    setLoadError('')
    try {
      const data = await listNews({ pageSize: 500 })
      const rows = (data.items ?? []).map(mapNewsItemFromApi)
      setItems(rows)
      const st = data.stats ?? {}
      setKpiStats({
        pending: st.pending ?? 0,
        approved: st.approved ?? 0,
        rejected: st.rejected ?? 0,
        total: (st.pending ?? 0) + (st.approved ?? 0) + (st.rejected ?? 0),
      })
    } catch (error) {
      setItems([])
      setKpiStats({ pending: 0, approved: 0, rejected: 0, total: 0 })
      setLoadError(error?.message ?? 'No se pudieron cargar las novedades.')
    } finally {
      setLoading(false)
      setDataReady(true)
    }
  }, [api])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const filtered = useMemo(() => items.filter((item) => {
    const q = search.toLowerCase()
    const idStr = String(item.id).toLowerCase()
    return (
      (!q || idStr.includes(q) || item.employee.toLowerCase().includes(q) || item.legajo.includes(q)) &&
      (!filterType || item.type === filterType) &&
      (!filterStatus || item.status.toLowerCase() === filterStatus)
    )
  }), [items, search, filterType, filterStatus])

  const selected = items.find((i) => i.id === selectedId) ?? null

  const clearFilters = () => { setFilterType(''); setFilterStatus('') }

  const approve = async () => {
    if (!selected) return
    if (api) {
      try {
        await approveNews(selected.rawId ?? selected.id)
        showToast('Novedad aprobada correctamente.')
        await loadNews()
        setSelectedId(null)
      } catch (e) {
        showToast(`Error: ${e.message}`)
      }
      return
    }
    setItems((prev) => prev.map((i) => i.id === selected.id ? { ...i, status: 'Aprobado' } : i))
    showToast('Novedad aprobada correctamente.')
  }

  const reject = async () => {
    if (!selected) return
    if (api) {
      try {
        await rejectNews(selected.rawId ?? selected.id, '')
        showToast('Novedad rechazada.')
        setOpenReject(false)
        await loadNews()
        setSelectedId(null)
      } catch (e) {
        showToast(`Error: ${e.message}`)
      }
      return
    }
    setItems((prev) => prev.map((i) => i.id === selected.id ? { ...i, status: 'Rechazado' } : i))
    setOpenReject(false)
    showToast('Novedad rechazada.')
  }

  const topbarContent = (
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><span className="material-symbols-outlined text-sm">search</span></span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 rounded-md border-none bg-surface-container-low py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary" placeholder="BUSCAR POR EMPLEADO O ID..." type="text" />
          </div>
          <button type="button" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90">
            <span className="material-symbols-outlined text-sm">search</span> Buscar
          </button>
        </div>
      )

  if (api && !dataReady) {
    return (
      <AppShell topbarTitle="NOVEDADES" topbarContent={topbarContent}>
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
          <p className="text-sm font-semibold">Cargando novedades...</p>
        </div>
      </AppShell>
      )
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!api) {
      setOpenCreate(false)
      showToast('Novedad cargada. Estado: Pendiente.')
      return
    }

    const formData = new FormData(e.currentTarget)
    const employeeRef = String(formData.get('employeeRef') ?? '')
    const legajo = Number(employeeRef.split('·')[0]?.trim())
    const tipo = String(formData.get('tipo') ?? '')
    const fechaDesde = String(formData.get('fechaDesde') ?? '')
    const fechaHasta = String(formData.get('fechaHasta') ?? '')
    const cantidadRaw = String(formData.get('cantidad') ?? '').trim()
    const observacion = String(formData.get('observacion') ?? '').trim()
    const unidad = HORAS_TYPES.includes(tipo) ? 'Horas' : MINUTOS_TYPES.includes(tipo) ? 'Minutos' : 'Dias'

    if (!Number.isFinite(legajo) || !tipo || !fechaDesde) {
      showToast('Completá empleado, tipo y fecha desde.')
      return
    }

    setCreateLoading(true)
    try {
      await createNews({
        legajo,
        tipo: mapFilterKeyToApiTipo(tipo),
        fechaDesde,
        fechaHasta: fechaHasta || null,
        cantidad: cantidadRaw === '' ? null : Number(cantidadRaw),
        unidad,
        observacion: observacion || null,
        idUsuarioCreacion: null,
      })
      await loadNews()
      setOpenCreate(false)
      setNovType('')
      e.currentTarget.reset()
      setSelectedId(null)
      showToast('Novedad cargada. Estado: Pendiente.')
    } catch (error) {
      showToast(`Error: ${error.message}`)
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <AppShell topbarTitle="NOVEDADES" topbarContent={topbarContent}>
      {loadError ? (
        <div className="mb-4 rounded-lg border border-error/20 bg-error-container/20 px-4 py-3 text-sm text-error">
          {loadError}
        </div>
      ) : null}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-background">Gestión de Novedades</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Revisión y aprobación de novedades del período.</p>
        </div>
        <button type="button" onClick={() => setOpenCreate(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90">
          <span className="material-symbols-outlined text-sm">add</span> Nueva novedad
        </button>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pendientes</p><p className="font-headline text-2xl font-black text-tertiary">{kpiStats.pending}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Aprobadas</p><p className="font-headline text-2xl font-black text-on-secondary-container">{kpiStats.approved}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Rechazadas</p><p className="font-headline text-2xl font-black text-error">{kpiStats.rejected}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total (en vista)</p><p className="font-headline text-2xl font-black text-primary">{kpiStats.total}</p></div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="relative col-span-12 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest lg:col-span-7">
          {loading && api && dataReady ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
            <h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
              <span className="material-symbols-outlined text-sm">playlist_add_check</span> NOVEDADES DEL PERÍODO
            </h3>
            <div className="flex items-center gap-2">
              <FilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Todos los tipos</option>
                <option value="tardanza">Tardanza</option>
                <option value="ausencia">Ausencia</option>
                <option value="salida_anticipada">Salida anticipada</option>
                <option value="horas_extra_50">Horas extra 50%</option>
                <option value="horas_extra_100">Horas extra 100%</option>
                <option value="doble_fichada">Doble fichada</option>
                <option value="justificacion">Justificación</option>
                <option value="licencia">Licencia</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="permiso_especial">Permiso especial</option>
                <option value="suspension">Suspensión</option>
              </FilterSelect>
              <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </FilterSelect>
              <button type="button" onClick={clearFilters} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              {filtered.length > 0 && (
                <thead>
                  <tr className="bg-surface-container-low">
                    {['ID', 'Empleado', 'Tipo', 'Fecha', 'Estado'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-100">
                {filtered.length ? filtered.map((item) => (
                  <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === item.id ? 'bg-primary-container/20' : ''}`}>
                    <td className={`px-5 py-3.5 font-mono text-xs font-bold text-primary${selected?.id === item.id ? ' border-l-4 border-primary' : ''}`}>{typeof item.id === 'number' ? `#${item.id}` : item.id}</td>
                    <td className="px-5 py-3.5"><span className="text-sm font-semibold">{item.employee}</span><span className="ml-1.5 text-xs text-on-surface-variant">{item.legajo}</span></td>
                    <td className="px-5 py-3.5"><TypeBadge type={item.type} /></td>
                    <td className="px-5 py-3.5 text-sm text-on-surface-variant">{item.date}</td>
                    <td className="px-5 py-3.5"><StatusPill status={item.status} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined mb-2 block text-3xl opacity-30">search_off</span>
                      No se encontraron novedades con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-on-surface-variant">Mostrando {filtered.length} novedad{filtered.length !== 1 ? 'es' : ''}</p>
            <div className="flex items-center gap-1">
              <button disabled className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant opacity-30"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
              <span className="px-2 text-xs font-bold text-on-surface-variant">1 / 1</span>
              <button disabled className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant opacity-30"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          {!selected ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/50 bg-surface-container-lowest px-6 py-16 text-center">
              <span className="material-symbols-outlined mb-3 text-4xl text-outline-variant">touch_app</span>
              <p className="text-sm font-semibold text-on-surface-variant">Ninguna novedad seleccionada</p>
              <p className="mt-1 text-xs text-on-surface-variant/60">Hacé clic en una fila para ver el detalle</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
                  <span className="material-symbols-outlined text-sm">info</span> DETALLE DE NOVEDAD
                </h3>
                <span className="font-mono text-xs font-bold text-on-surface-variant">{typeof selected.id === 'number' ? `#${selected.id}` : selected.id}</span>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-on-surface-variant">Empleado</span>
                  <div className="text-right">
                    <span className="text-sm font-bold">{selected.employee}</span>
                    <span className="ml-1.5 font-mono text-xs text-on-surface-variant">{selected.legajo}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-on-surface-variant">Tipo</span>
                  <TypeBadge type={selected.type} />
                </div>
                <div className="grid grid-cols-2 gap-3 border-b border-slate-100 pb-3">
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Fecha</p>
                    <p className="text-sm font-black text-primary">{selected.date}</p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Cantidad</p>
                    <p className="text-sm font-black text-on-background">{selected.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-on-surface-variant">Origen</span>
                  <span className="text-xs font-semibold uppercase">{selected.origin}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-on-surface-variant">Fecha de creación</span>
                  <span className="text-xs font-semibold">{selected.createdAt}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-on-surface-variant">Creado por</span>
                  <span className="text-xs font-semibold">{selected.createdBy}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-on-surface-variant">Estado</span>
                  <StatusPill status={selected.status} />
                </div>
                <div className="rounded-lg bg-surface-container-low p-3">
                  <p className="mb-1.5 text-[10px] font-bold uppercase text-on-surface-variant">Observación</p>
                  <p className="text-xs text-on-background">{selected.obs}</p>
                </div>
                {selected.status === 'Pendiente' && (
                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={approve} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-on-secondary-container/30 bg-on-secondary-container/15 py-2.5 text-xs font-bold text-on-secondary-container transition-colors hover:bg-on-secondary-container/25">
                      <span className="material-symbols-outlined text-sm">check_circle</span> Aprobar
                    </button>
                    <button type="button" onClick={() => setOpenReject(true)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-error/25 bg-error/10 py-2.5 text-xs font-bold text-error transition-colors hover:bg-error/15">
                      <span className="material-symbols-outlined text-sm">cancel</span> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={openCreate} title="Nueva novedad" subtitle="Cargá una novedad manual para un empleado." onClose={() => setOpenCreate(false)} size="max-w-lg">
        <form className="space-y-5 px-8 py-6" onSubmit={handleCreate}>
          <Field label="Empleado *">
            <SelectInput required name="employeeRef">
              <option value="">Seleccionar empleado...</option>
              {employeeOptions.map((o) => <option key={o}>{o}</option>)}
            </SelectInput>
          </Field>
          <Field label="Tipo de novedad *">
            <SelectInput required name="tipo" value={novType} onChange={(e) => setNovType(e.target.value)}>
              <option value="">Seleccionar tipo...</option>
              <optgroup label="Horas extra">
                <option value="horas_extra_50">Horas extra 50%</option>
                <option value="horas_extra_100">Horas extra 100%</option>
              </optgroup>
              <optgroup label="Ausencias y licencias">
                <option value="justificacion">Justificación de ausencia</option>
                <option value="ausencia">Ausencia injustificada</option>
                <option value="licencia_enfermedad">Licencia por enfermedad</option>
                <option value="licencia_examen">Licencia por examen</option>
                <option value="vacaciones">Vacaciones parciales</option>
                <option value="permiso_especial">Permiso especial</option>
              </optgroup>
              <optgroup label="Disciplinarias">
                <option value="tardanza">Tardanza</option>
                <option value="suspension">Suspensión disciplinaria</option>
              </optgroup>
            </SelectInput>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha desde *"><TextInput required type="date" name="fechaDesde" /></Field>
            <Field label="Fecha hasta"><TextInput type="date" name="fechaHasta" /></Field>
          </div>
          {HORAS_TYPES.includes(novType) && (
            <Field label="Cantidad de horas *">
              <div className="relative">
                <TextInput type="number" min="0.5" max="24" step="0.5" placeholder="Ej: 2" required name="cantidad" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">hs</span>
              </div>
            </Field>
          )}
          {MINUTOS_TYPES.includes(novType) && (
            <Field label="Cantidad de minutos *">
              <div className="relative">
                <TextInput type="number" min="1" max="480" placeholder="Ej: 15" required name="cantidad" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">min</span>
              </div>
            </Field>
          )}
          {DIAS_TYPES.includes(novType) && (
            <Field label="Cantidad de días *">
              <div className="relative">
                <TextInput type="number" min="1" max="365" placeholder="Ej: 1" required name="cantidad" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">días</span>
              </div>
            </Field>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha de creación *"><TextInput required type="date" defaultValue={new Date().toISOString().slice(0, 10)} disabled /></Field>
            <Field label="Creado por *">
              <SelectInput required disabled>
                <option>Administrator</option>
                <option>Supervisor RRHH</option>
                <option>Jefe de área</option>
              </SelectInput>
            </Field>
          </div>
          <Field label="Observación">
            <textarea name="observacion" rows={2} placeholder="Detalle adicional (opcional)..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenCreate(false)} disabled={createLoading} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={createLoading} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
              {createLoading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">add</span>}
              Cargar novedad
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={openReject} title="Rechazar novedad" onClose={() => setOpenReject(false)} size="max-w-sm">
        <form className="space-y-4 px-8 py-6" onSubmit={(e) => { e.preventDefault(); reject() }}>
          <Field label="Motivo de rechazo *">
            <textarea required rows={3} placeholder="Indicá el motivo del rechazo..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-error focus:outline-none focus:ring-2 focus:ring-error/30" />
          </Field>
          <div className="flex gap-3">
            <button type="button" onClick={() => setOpenReject(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex-1 rounded-lg bg-error py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">Confirmar rechazo</button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {toast}
        </div>
      )}
    </AppShell>
  )
}
