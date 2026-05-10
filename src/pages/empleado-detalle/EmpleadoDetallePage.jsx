import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Modal from '../../components/ui/Modal'
import { routes } from '../../lib/routes'
import { createEmployeeAssignment, createEmployeeManualPunch, createEmployeeNews, getEmployeeDetail, updateEmployee } from '../../services/employeeService'

const INPUT = 'w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'
const LABEL = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant'

const ESTADOS_LABORALES = ['Activo', 'Inactivo', 'Suspendido']

function Field({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="text-sm font-semibold text-on-surface">{value || <span className="italic text-on-surface-variant/40">—</span>}</p>
    </div>
  )
}

function calcCuil(dni, sexo) {
  if (!dni || dni.length < 7) return ''
  const prefix = sexo === 'F' ? '27' : sexo === 'M' ? '20' : '23'
  return `${prefix}-${dni}-${dni.slice(-1)}`
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function statusDot(status) {
  const s = status?.toLowerCase()
  if (s === 'activo')     return 'bg-green-500'
  if (s === 'inactivo')   return 'bg-red-500'
  if (s === 'suspendido') return 'bg-amber-400'
  return 'bg-slate-400'
}

function statusTextStrong(status) {
  const s = status?.toLowerCase()
  if (s === 'activo')     return 'text-green-700'
  if (s === 'inactivo')   return 'text-red-600'
  if (s === 'suspendido') return 'text-amber-700'
  return 'text-on-surface'
}

function newsStatusColor(status) {
  const s = status?.toLowerCase()
  if (s === 'aprobada')  return { text: 'text-green-700',  dot: 'bg-green-500' }
  if (s === 'rechazada') return { text: 'text-red-600',    dot: 'bg-red-500' }
  return { text: 'text-yellow-700', dot: 'bg-yellow-400' }
}

function formatDateTime(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
}

/** Texto ficha: tipo de jornada y, si aplica, horas en el mismo rótulo — ej. Parcial (6hs) */
function textoTipoJornada(jornada, parcialHoras) {
  if (jornada !== 'Parcial') return jornada || ''
  const has =
    parcialHoras != null &&
    parcialHoras !== '' &&
    !Number.isNaN(Number(parcialHoras))
  if (!has) return 'Parcial'
  const n = String(Number(parcialHoras)).replace(/\.0$/, '')
  return `Parcial (${n}hs)`
}

export default function EmpleadoDetallePage() {
  const { id } = useParams()

  const [loading, setLoading]       = useState(true)
  const [detail, setDetail]         = useState(null)
  const [openEdit, setOpenEdit]     = useState(false)
  const [openHorario, setOpenHorario] = useState(false)
  const [openCiclo, setOpenCiclo]   = useState(false)
  const [openNews, setOpenNews]     = useState(false)
  const [openPunch, setOpenPunch]   = useState(false)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [editForm, setEditForm] = useState({
    nombre: '', apellido: '', dni: '', sexo: 'M',
    fechaIngreso: '', categoria: '', convenio: '', jornada: 'Completa', parcialHoras: '', fichada: 'Biométrico',
    estado: 'Activo',
  })
  const editCuil = useMemo(() => calcCuil(editForm.dni, editForm.sexo), [editForm.dni, editForm.sexo])

  const [novForm, setNovForm] = useState({ tipo: '', fechaDesde: '', fechaHasta: '', cantidad: '', unidad: 'Horas', observacion: '' })
  const [punchForm, setPunchForm] = useState({ fecha: '', hora: '', tipo: 'Entrada', motivo: '' })
  const [horarioForm, setHorarioForm] = useState({ targetId: '', fechaDesde: '' })
  const [cicloForm, setCicloForm] = useState({ targetId: '', fechaDesde: '' })

  const [editToast, setEditToast] = useState(null)
  const editToastTimerRef = useRef(null)

  const [statusSelect, setStatusSelect] = useState('Activo')
  const [estadoSaving, setEstadoSaving] = useState(false)

  const showEditToast = (message, ok) => {
    if (editToastTimerRef.current) clearTimeout(editToastTimerRef.current)
    setEditToast({ message, ok })
    editToastTimerRef.current = window.setTimeout(() => {
      setEditToast(null)
      editToastTimerRef.current = null
    }, 3800)
  }

  useEffect(() => () => {
    if (editToastTimerRef.current) clearTimeout(editToastTimerRef.current)
  }, [])

  const applyEmployeeToEditForm = (employee) => {
    if (!employee) return
    const ph = employee.parcialHoras
    const parcialStr =
      ph != null && ph !== ''
        ? String(Number(ph)).replace(/\.0$/, '')
        : ''
    setEditForm({
      nombre:       employee.name?.split(' ')[0] ?? '',
      apellido:     employee.name?.split(' ').slice(1).join(' ') ?? '',
      dni:          employee.dni ?? '',
      sexo:         'M',
      fechaIngreso: employee.fechaIngreso ?? '',
      categoria:    employee.category ?? '',
      convenio:     employee.convenio ?? '',
      jornada:      employee.jornada ?? 'Completa',
      parcialHoras: employee.jornada === 'Parcial' ? (parcialStr || '4') : '',
      fichada:      employee.modalidadFichada || 'Biométrico',
      estado:       employee.status ?? 'Activo',
    })
    document.title = `${employee.name} - Labor Pulse`
  }

  useEffect(() => {
    if (!id) return
    document.title = 'Detalle de empleado'
    let cancelled = false
    setLoading(true)
    getEmployeeDetail(id).then((data) => {
      if (!cancelled) {
        setDetail(data)
        applyEmployeeToEditForm(data?.employee)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id])

  const emp          = detail?.employee
  const sched        = detail?.scheduleConfig
  const recentPunches = detail?.recentPunches || []
  const recentNews   = detail?.recentNews || []

  useEffect(() => {
    const s = detail?.employee?.status
    if (s) setStatusSelect(s)
  }, [detail?.employee?.status])

  const horarioOCicloActivo =
    sched?.cycle
      ? `Ciclo · ${sched.cycle}`
      : sched?.schedule
        ? `Horario · ${sched.schedule}`
        : null

  const ef = (field) => (e) => setEditForm(f => ({ ...f, [field]: e.target.value }))

  const handleEdit = async (e) => {
    e.preventDefault()
    if (editForm.jornada === 'Parcial') {
      const h = Number(editForm.parcialHoras)
      if (!editForm.parcialHoras?.trim() || Number.isNaN(h) || h < 1 || h > 7) {
        showEditToast('Indicá las horas diarias de la jornada parcial (entre 1 y 7).', false)
        return
      }
    }
    try {
      const { parcialHoras, ...editRest } = editForm
      await updateEmployee(id, {
        ...editRest,
        cuil: editCuil,
        parcialHoras: editForm.jornada === 'Parcial' ? Number(parcialHoras) : null,
      })
      const updated = await getEmployeeDetail(id)
      setDetail(updated)
      applyEmployeeToEditForm(updated?.employee)
      setOpenEdit(false)
      showEditToast('Empleado actualizado correctamente.', true)
    } catch (err) {
      showEditToast(err?.message || 'No se pudieron guardar los cambios.', false)
    }
  }

  const handleEstadoSave = async () => {
    if (!id || statusSelect === emp?.status) return
    setEstadoSaving(true)
    try {
      await updateEmployee(id, { estado: statusSelect })
      const updated = await getEmployeeDetail(id)
      setDetail(updated)
      applyEmployeeToEditForm(updated?.employee)
      showEditToast('Estado laboral actualizado.', true)
    } catch (err) {
      showEditToast(err?.message || 'No se pudo actualizar el estado.', false)
    } finally {
      setEstadoSaving(false)
    }
  }

  const handleHorario = async (e) => {
    e.preventDefault()
    try {
      await createEmployeeAssignment(id, { type: 'horario', targetId: horarioForm.targetId, fechaDesde: horarioForm.fechaDesde })
      const d = await getEmployeeDetail(id)
      setDetail(d)
      setOpenHorario(false)
      setHorarioForm({ targetId: '', fechaDesde: '' })
    } catch (err) { alert(`Error: ${err.message}`) }
  }

  const handleCiclo = async (e) => {
    e.preventDefault()
    try {
      await createEmployeeAssignment(id, { type: 'ciclo', targetId: cicloForm.targetId, fechaDesde: cicloForm.fechaDesde })
      const d = await getEmployeeDetail(id)
      setDetail(d)
      setOpenCiclo(false)
      setCicloForm({ targetId: '', fechaDesde: '' })
    } catch (err) { alert(`Error: ${err.message}`) }
  }

  const handleNews = async (e) => {
    e.preventDefault()
    try {
      await createEmployeeNews(id, { ...novForm, idUsuarioCreacion: null })
      setOpenNews(false)
      setNovForm({ tipo: '', fechaDesde: '', fechaHasta: '', cantidad: '', unidad: 'Horas', observacion: '' })
    } catch (err) { alert(`Error: ${err.message}`) }
  }

  const handlePunch = async (e) => {
    e.preventDefault()
    try {
      const fechaHora = `${punchForm.fecha}T${punchForm.hora}:00`
      await createEmployeeManualPunch(id, { fechaHora, tipo: punchForm.tipo })
      setOpenPunch(false)
      setPunchForm({ fecha: '', hora: '', tipo: 'Entrada', motivo: '' })
    } catch (err) { alert(`Error: ${err.message}`) }
  }

  const breadcrumb = (
    <div className="flex items-center gap-3">
      <Link to={routes.empleados} className="flex items-center gap-1 text-on-surface-variant transition-colors hover:text-primary">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
      </Link>
      <span className="text-slate-300">/</span>
      <Link to={routes.empleados} className="text-xs font-bold uppercase tracking-wider text-on-surface-variant transition-colors hover:text-primary">Empleados</Link>
      <span className="text-slate-300">/</span>
      <span className="text-sm font-bold text-on-background">{emp?.name || '...'}</span>
    </div>
  )

  if (loading) {
    return (
      <AppShell topbarContent={breadcrumb}>
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl opacity-40">progress_activity</span>
          <p className="text-sm font-semibold">Cargando empleado...</p>
        </div>
      </AppShell>
    )
  }

  if (!emp) {
    return (
      <AppShell topbarContent={breadcrumb}>
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30">person_off</span>
          <p className="text-sm font-semibold">Empleado no encontrado.</p>
          <Link to={routes.empleados} className="text-xs font-bold text-primary hover:underline">Volver al listado</Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell topbarContent={breadcrumb}>

      {/* Profile Header */}
      <section className="mb-6 flex items-start gap-8 rounded-xl bg-surface-container-lowest p-8">
        <div className="relative shrink-0">
          <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-primary font-headline text-4xl font-black text-on-primary shadow-lg">
            {getInitials(emp.name)}
          </div>
          <div className={`absolute -bottom-2 -right-2 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-white shadow-sm ${statusDot(emp.status)}`}>
            {emp.status}
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-background">{emp.name}</h2>
              <p className="mt-1 flex items-center gap-2 font-medium text-on-surface-variant">
                Legajo <span className="font-mono font-bold text-primary">{emp.legajo}</span>
                {emp.category && <><span className="h-1 w-1 rounded-full bg-outline" />{emp.category}</>}
                <span className="h-1 w-1 rounded-full bg-outline" />
                <span className="font-medium">{textoTipoJornada(emp.jornada, emp.parcialHoras)}</span>
                <span className="h-1 w-1 rounded-full bg-outline" />
                <span className={`flex items-center gap-1 font-bold`}>
                  <span className={`h-2 w-2 rounded-full ${statusDot(emp.status)}`} /> {emp.status}
                </span>
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-wrap items-stretch justify-start gap-3 sm:w-auto sm:justify-end">
              <div
                className="flex min-w-[min(100%,18rem)] flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] sm:max-w-md sm:flex-initial dark:border-outline-variant/30 dark:bg-surface-container-low"
                role="group"
                aria-label="Estado laboral del empleado"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#5a739c_0%,#3d5780_100%)] text-white shadow-inner shadow-black/10">
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: '"FILL" 1' }}>work_history</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant/80">
                      Estado laboral
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-surface-container-low ${statusDot(statusSelect)}`}
                        aria-hidden
                      />
                      <div className="relative min-w-0 flex-1">
                        <select
                          value={statusSelect}
                          onChange={(e) => setStatusSelect(e.target.value)}
                          disabled={estadoSaving}
                          className={`w-full appearance-none truncate rounded-xl border border-outline-variant/30 bg-surface-container-high/70 py-2 pl-3 pr-9 text-[13px] font-bold tracking-tight shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[box-shadow,border-color] hover:border-outline-variant/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${statusTextStrong(statusSelect)}`}
                        >
                          {ESTADOS_LABORALES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={estadoSaving || statusSelect === emp.status}
                  onClick={handleEstadoSave}
                  title={statusSelect === emp.status ? 'Sin cambios' : 'Guardar estado laboral'}
                  className="flex shrink-0 items-center gap-2 border-l border-slate-200/90 bg-gradient-to-br from-primary/8 to-transparent px-4 py-3 text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:from-primary/14 disabled:cursor-not-allowed disabled:opacity-[0.35] dark:border-outline-variant/30"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${estadoSaving ? 'animate-spin' : ''}`}
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    {estadoSaving ? 'progress_activity' : 'check_circle'}
                  </span>
                  <span className="hidden min-[420px]:inline">{estadoSaving ? 'Guardando' : 'Aplicar'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setOpenEdit(true)}
                className="flex min-h-[3.5rem] min-w-[12rem] flex-1 items-center justify-center gap-2 self-stretch rounded-2xl px-5 text-sm font-semibold text-on-primary shadow-[0_4px_14px_-4px_rgba(57,83,124,0.55)] transition-[transform,box-shadow] hover:scale-[0.99] hover:shadow-[0_6px_20px_-4px_rgba(57,83,124,0.45)] sm:flex-initial sm:py-4"
                style={{ background: 'linear-gradient(135deg, #455f88 0%, #39537c 100%)' }}
              >
                <span className="material-symbols-outlined text-xl">edit</span>
                Editar empleado
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-x-8 gap-y-5 border-t border-slate-100 pt-6">
            <Field label="DNI"               value={emp.dni} />
            <Field label="CUIL"              value={emp.cuil} />
            <Field label="Fecha de ingreso"  value={emp.fechaIngreso} />
            <Field label="Categoría laboral" value={emp.category} />
            <Field label="Convenio"          value={emp.convenio} />
            <Field label="Tipo de jornada"   value={textoTipoJornada(emp.jornada, emp.parcialHoras)} />
            <Field
              label="Modalidad de fichada"
              value={emp.modalidadFichada?.trim()
                ? emp.modalidadFichada
                : <span className="italic text-on-surface-variant/40">Sin definir</span>}
            />
            <Field
              label="Horario / Ciclo activo"
              value={horarioOCicloActivo || <span className="italic text-on-surface-variant/40">Sin asignar</span>}
            />
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <section className="mb-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => setOpenHorario(true)} className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-lg">schedule</span> Asignar horario
        </button>
        <button type="button" onClick={() => setOpenCiclo(true)} className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-lg">sync_alt</span> Asignar ciclo
        </button>
        <button type="button" onClick={() => setOpenNews(true)} className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-lg">assignment_add</span> Cargar novedad
        </button>
        <button type="button" onClick={() => setOpenPunch(true)} className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-lg">fingerprint</span> Cargar fichada manual
        </button>
        <Link to={routes.fichadas} className="ml-auto flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-lg">history</span> Ver fichadas
        </Link>
      </section>

      {/* Recent Logs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-surface-container-lowest p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold">Últimas Fichadas</h3>
            <Link to={routes.fichadas} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Ver todas</Link>
          </div>
          {recentPunches.length === 0 ? (
            <p className="py-8 text-center text-sm italic text-on-surface-variant/50">Sin fichadas registradas.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-4 py-3">Fecha y hora</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Origen</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {recentPunches.map(p => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{formatDateTime(p.timestamp)}</td>
                    <td className="px-4 py-3 font-semibold">{p.type}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{p.origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-xl bg-surface-container-lowest p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold">Novedades Recientes</h3>
            <Link to={routes.novedades} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Gestionar todas</Link>
          </div>
          {recentNews.length === 0 ? (
            <p className="py-8 text-center text-sm italic text-on-surface-variant/50">Sin novedades registradas.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {['Tipo', 'Fecha', 'Cant.', 'Estado'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {recentNews.map(n => {
                  const { text, dot } = newsStatusColor(n.status)
                  return (
                    <tr key={n.id} className="border-b border-slate-50">
                      <td className="px-4 py-3 font-semibold">{n.type}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{n.date}</td>
                      <td className="px-4 py-3">{n.quantity ? `${n.quantity} ${n.unit}` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 font-bold ${text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{n.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* ── Modal: Editar Empleado ── */}
      <Modal open={openEdit} title="Editar Empleado" subtitle={`Legajo ${emp.legajo}`} onClose={() => setOpenEdit(false)}>
        <form onSubmit={handleEdit} className="space-y-5 px-8 py-6">
          <div className="grid grid-cols-2 gap-5">
            <div><label className={LABEL}>Nombre *</label><input required value={editForm.nombre} onChange={ef('nombre')} className={INPUT} /></div>
            <div><label className={LABEL}>Apellido *</label><input required value={editForm.apellido} onChange={ef('apellido')} className={INPUT} /></div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div><label className={LABEL}>DNI *</label><input required maxLength={8} value={editForm.dni} onChange={ef('dni')} className={INPUT} /></div>
            <div><label className={LABEL}>Sexo *</label>
              <select required value={editForm.sexo} onChange={ef('sexo')} className={INPUT}>
                <option value="M">Masculino</option><option value="F">Femenino</option><option value="X">No binario</option>
              </select>
            </div>
            <div><label className={LABEL}>CUIL <span className="font-normal normal-case">(calculado)</span></label>
              <input readOnly value={editCuil} className="w-full cursor-default rounded-lg border border-outline-variant/20 bg-surface-container-highest px-3 py-2.5 font-mono text-sm font-bold text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className={LABEL}>Fecha de ingreso *</label><input required type="date" value={editForm.fechaIngreso} onChange={ef('fechaIngreso')} className={INPUT} /></div>
            <div><label className={LABEL}>Categoría laboral *</label>
              <select required value={editForm.categoria} onChange={ef('categoria')} className={INPUT}>
                <option value="">Seleccionar...</option>
                <option>Administrativo</option><option>Operario / Planta</option><option>Técnico</option><option>Supervisor</option><option>Gerencia</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className={LABEL}>Convenio colectivo</label>
              <select value={editForm.convenio} onChange={ef('convenio')} className={INPUT}>
                <option value="">Sin convenio / No aplica</option>
                <option>Comercio (130/75)</option><option>Metalúrgico (260/75)</option><option>Gastronómico (389/04)</option><option>Construcción (76/75)</option>
              </select>
            </div>
            <div><label className={LABEL}>Tipo de jornada *</label>
              <select
                required
                value={editForm.jornada}
                onChange={(e) => {
                  const v = e.target.value
                  setEditForm((f) => ({
                    ...f,
                    jornada: v,
                    parcialHoras: v === 'Parcial'
                      ? (f.parcialHoras?.trim() ? f.parcialHoras : '4')
                      : '',
                  }))
                }}
                className={INPUT}
              >
                <option value="Completa">Completa</option><option value="Parcial">Parcial</option>
              </select>
            </div>
          </div>
          {editForm.jornada === 'Parcial' && (
            <div className="overflow-hidden rounded-xl border border-primary/20 bg-primary-container/10">
              <div className="flex items-center gap-2 border-b border-primary/20 bg-primary-container/30 px-5 py-3">
                <span className="material-symbols-outlined text-sm text-primary">calendar_view_week</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">Configuración de jornada parcial</span>
              </div>
              <div className="px-5 py-4">
                <label className={`${LABEL} mt-0`}>Horas diarias *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    required
                    min="1"
                    max="7"
                    step="0.5"
                    value={editForm.parcialHoras}
                    onChange={ef('parcialHoras')}
                    placeholder="Ej: 4"
                    className="w-32 rounded-lg border border-outline-variant/40 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <span className="text-sm font-medium text-on-surface-variant">hs / día <span className="text-on-surface-variant/60">(máx. 7)</span></span>
                </div>
              </div>
            </div>
          )}
          <div><label className={LABEL}>Estado laboral *</label>
            <select required value={editForm.estado} onChange={ef('estado')} className={INPUT}>
              {ESTADOS_LABORALES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div><label className={LABEL}>Modalidad de fichada *</label>
            <select required value={editForm.fichada} onChange={ef('fichada')} className={INPUT}>
              <option>Biométrico</option>
              <option>App móvil</option>
              <option>PIN / Teclado</option>
              <option>QR</option>
              <option>Manual</option>
            </select>
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setOpenEdit(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">save</span> Guardar cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Asignar Horario ── */}
      <Modal open={openHorario} title="Asignar Horario" subtitle={`${emp.name} — Legajo ${emp.legajo}`} onClose={() => setOpenHorario(false)} size="max-w-md">
        <form onSubmit={handleHorario} className="space-y-4 px-8 py-6">
          <div><label className={LABEL}>ID del horario *</label>
            <input required placeholder="Ej: 1" value={horarioForm.targetId} onChange={e => setHorarioForm(f => ({ ...f, targetId: e.target.value }))} className={INPUT} />
          </div>
          <div><label className={LABEL}>Vigencia desde *</label>
            <input required type="date" value={horarioForm.fechaDesde} onChange={e => setHorarioForm(f => ({ ...f, fechaDesde: e.target.value }))} className={INPUT} />
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenHorario(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">schedule</span> Asignar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Asignar Ciclo ── */}
      <Modal open={openCiclo} title="Asignar Ciclo Rotativo" subtitle={`${emp.name} — Legajo ${emp.legajo}`} onClose={() => setOpenCiclo(false)} size="max-w-md">
        <form onSubmit={handleCiclo} className="space-y-4 px-8 py-6">
          <div><label className={LABEL}>ID del ciclo *</label>
            <input required placeholder="Ej: 1" value={cicloForm.targetId} onChange={e => setCicloForm(f => ({ ...f, targetId: e.target.value }))} className={INPUT} />
          </div>
          <div><label className={LABEL}>Vigencia desde *</label>
            <input required type="date" value={cicloForm.fechaDesde} onChange={e => setCicloForm(f => ({ ...f, fechaDesde: e.target.value }))} className={INPUT} />
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenCiclo(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">sync_alt</span> Asignar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Cargar Novedad ── */}
      <Modal open={openNews} title="Cargar Novedad" subtitle={`${emp.name} — Legajo ${emp.legajo}`} onClose={() => setOpenNews(false)}>
        <form onSubmit={handleNews} className="space-y-4 px-8 py-6">
          <div><label className={LABEL}>Tipo de novedad *</label>
            <select required value={novForm.tipo} onChange={e => setNovForm(f => ({ ...f, tipo: e.target.value }))} className={INPUT}>
              <option value="">Seleccionar tipo...</option>
              <optgroup label="Horas extra">
                <option value="Horas_extra_50">Horas extra 50%</option>
                <option value="Horas_extra_100">Horas extra 100%</option>
                <option value="Tardanza">Tardanza</option>
              </optgroup>
              <optgroup label="Ausencias y licencias">
                <option value="Justificacion">Justificación de ausencia</option>
                <option value="Ausencia">Ausencia injustificada</option>
                <option value="Licencia">Licencia</option>
                <option value="Vacaciones">Vacaciones</option>
                <option value="Permiso_especial">Permiso especial</option>
              </optgroup>
              <optgroup label="Disciplinarias">
                <option value="Suspension">Suspensión disciplinaria</option>
              </optgroup>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Fecha desde *</label><input required type="date" value={novForm.fechaDesde} onChange={e => setNovForm(f => ({ ...f, fechaDesde: e.target.value }))} className={INPUT} /></div>
            <div><label className={LABEL}>Fecha hasta</label><input type="date" value={novForm.fechaHasta} onChange={e => setNovForm(f => ({ ...f, fechaHasta: e.target.value }))} className={INPUT} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Cantidad</label><input type="number" min="0.5" step="0.5" value={novForm.cantidad} onChange={e => setNovForm(f => ({ ...f, cantidad: e.target.value }))} placeholder="Ej: 2" className={INPUT} /></div>
            <div><label className={LABEL}>Unidad</label>
              <select value={novForm.unidad} onChange={e => setNovForm(f => ({ ...f, unidad: e.target.value }))} className={INPUT}>
                <option value="Minutos">Minutos</option>
                <option value="Horas">Horas</option>
                <option value="Dias">Días</option>
              </select>
            </div>
          </div>
          <div><label className={LABEL}>Observación</label>
            <textarea rows={2} value={novForm.observacion} onChange={e => setNovForm(f => ({ ...f, observacion: e.target.value }))} placeholder="Detalle adicional (opcional)..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenNews(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">add</span> Cargar novedad
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Fichada Manual ── */}
      <Modal open={openPunch} title="Cargar Fichada Manual" subtitle={`${emp.name} — Legajo ${emp.legajo}`} onClose={() => setOpenPunch(false)} size="max-w-md">
        <form onSubmit={handlePunch} className="space-y-4 px-8 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Fecha *</label><input required type="date" value={punchForm.fecha} onChange={e => setPunchForm(f => ({ ...f, fecha: e.target.value }))} className={INPUT} /></div>
            <div><label className={LABEL}>Hora *</label><input required type="time" value={punchForm.hora} onChange={e => setPunchForm(f => ({ ...f, hora: e.target.value }))} className={INPUT} /></div>
          </div>
          <div><label className={LABEL}>Tipo *</label>
            <div className="flex gap-3">
              {['Entrada', 'Salida'].map(t => (
                <label key={t} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-surface-container-low ${punchForm.tipo === t ? 'border-primary bg-primary-container/20' : 'border-outline-variant/40'}`}>
                  <input type="radio" name="tipo-fichada" value={t} checked={punchForm.tipo === t} onChange={e => setPunchForm(f => ({ ...f, tipo: e.target.value }))} className="accent-primary" />
                  <span className={`material-symbols-outlined text-sm ${t === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>{t === 'Entrada' ? 'login' : 'logout'}</span>
                  <span className="text-sm font-semibold">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div><label className={LABEL}>Motivo *</label>
            <textarea required rows={2} value={punchForm.motivo} onChange={e => setPunchForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Describí el motivo del registro manual..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenPunch(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">fingerprint</span> Registrar
            </button>
          </div>
        </form>
      </Modal>

      {editToast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] flex max-w-md items-start gap-3 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-2xl ${editToast.ok ? 'bg-slate-900' : 'bg-slate-900 ring-2 ring-red-500/60'}`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`material-symbols-outlined shrink-0 ${editToast.ok ? 'text-green-400' : 'text-red-400'}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {editToast.ok ? 'check_circle' : 'error'}
          </span>
          <span className="pt-0.5 leading-snug">{editToast.message}</span>
        </div>
      )}
    </AppShell>
  )
}
