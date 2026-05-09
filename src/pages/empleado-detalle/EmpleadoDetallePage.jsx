import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Modal from '../../components/ui/Modal'
import { routes } from '../../lib/routes'
import { createEmployeeAssignment, createEmployeeManualPunch, createEmployeeNews, getEmployeeDetail, updateEmployee } from '../../services/employeeService'

const INPUT = 'w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30'
const LABEL = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant'

function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className={`text-sm font-semibold text-on-surface ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function calcCuil(dni, sexo) {
  if (!dni || dni.length < 7) return ''
  const prefix = sexo === 'F' ? '27' : sexo === 'M' ? '20' : '23'
  return `${prefix}-${dni}-${dni.slice(-1)}`
}

export default function EmpleadoDetallePage() {
  const [openEdit, setOpenEdit]     = useState(false)
  const [openHorario, setOpenHorario] = useState(false)
  const [openCiclo, setOpenCiclo]   = useState(false)
  const [openNews, setOpenNews]     = useState(false)
  const [openPunch, setOpenPunch]   = useState(false)
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [detail, setDetail] = useState(null)

  const [editForm, setEditForm] = useState({
    nombre: 'Juan', apellido: 'Perez', dni: '30111222', sexo: 'M',
    fechaIngreso: '2023-03-10', categoria: 'Administrativo',
    convenio: 'Comercio (130/75)', jornada: 'Completa',
    parcialHoras: '', horario: 'H-003 Oficina central', fichada: 'Biométrico',
  })
  const editCuil = useMemo(() => calcCuil(editForm.dni, editForm.sexo), [editForm.dni, editForm.sexo])

  const [novTipo, setNovTipo] = useState('')

  useEffect(() => {
    document.title = 'Juan Perez - Executive Architect'
    let cancelled = false
    getEmployeeDetail('emp_42').then((data) => {
      if (!cancelled) setDetail(data)
    })
    return () => { cancelled = true }
  }, [])

  const emp = detail?.employee
  const sched = detail?.scheduleConfig
  const period = detail?.periodSummary
  const weeklyGrid = detail?.weeklyGrid || []
  const recentPunches = detail?.recentPunches || []
  const recentNews = detail?.recentNews || []

  const breadcrumb = (
    <div className="flex items-center gap-3">
      <Link to={routes.empleados} className="flex items-center gap-1 text-on-surface-variant transition-colors hover:text-primary">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
      </Link>
      <span className="text-slate-300">/</span>
      <Link to={routes.empleados} className="text-xs font-bold uppercase tracking-wider text-on-surface-variant transition-colors hover:text-primary">
        Empleados
      </Link>
      <span className="text-slate-300">/</span>
      <span className="text-sm font-bold text-on-background">{emp?.name || 'Juan Perez'}</span>
    </div>
  )

  const ef = (field) => (e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <AppShell topbarContent={breadcrumb}>

      {/* Profile Header */}
      <section className="mb-6 flex items-start gap-8 rounded-xl bg-surface-container-lowest p-8">
        <div className="relative shrink-0">
          <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-primary font-headline text-4xl font-black text-on-primary shadow-lg">
            {emp?.initials || 'JP'}
          </div>
          <div className="absolute -bottom-2 -right-2 rounded-full bg-on-secondary-container px-2 py-1 text-[10px] font-bold uppercase tracking-tighter text-white shadow-sm">
            {emp?.status || 'Activo'}
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-background">{emp?.name || 'Juan Perez'}</h2>
              <p className="mt-1 flex items-center gap-2 font-medium text-on-surface-variant">
                Legajo <span className="font-mono font-bold text-primary">{emp?.legajo || '0042'}</span>
                <span className="h-1 w-1 rounded-full bg-outline" />
                {emp?.category || 'Administrativo'}
                <span className="h-1 w-1 rounded-full bg-outline" />
                <span className="flex items-center gap-1 font-bold text-on-secondary-container">
                  <span className="h-2 w-2 rounded-full bg-on-secondary-container" /> {emp?.status || 'Activo'}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenEdit(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-transform hover:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #455f88 0%, #39537c 100%)' }}
            >
              <span className="material-symbols-outlined text-lg">edit</span> Editar empleado
            </button>
          </div>
          <div className="grid grid-cols-4 gap-x-8 gap-y-5 border-t border-slate-100 pt-6">
            <Field label="DNI" value={emp?.dni || '30.111.222'} mono />
            <Field label="CUIL" value={emp?.cuil || '20-30111222-3'} mono />
            <Field label="Fecha de ingreso" value={emp?.fechaIngreso || '10/03/2023'} />
            <Field label="Categoría laboral" value={emp?.category || 'Administrativo'} />
            <Field label="Convenio" value={emp?.convenio || 'Comercio (130/75)'} />
            <Field label="Tipo de jornada" value={emp?.jornada || 'Completa'} />
            <Field label="Modalidad fichada" value={emp?.fichada || 'Biométrico'} />
            <Field label="Horario activo" value={emp?.schedule || 'H-003 Oficina central'} />
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

      {/* Mid Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <span className="material-symbols-outlined text-9xl">settings_suggest</span>
          </div>
          <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
            <span className="material-symbols-outlined text-primary">calendar_today</span> Configuración de Horario Activo
          </h3>
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div><p className="mb-1 text-[11px] font-bold uppercase text-on-surface-variant">Tipo</p><p className="text-base font-semibold">{sched?.tipo || 'Fijo'}</p></div>
            <div><p className="mb-1 text-[11px] font-bold uppercase text-on-surface-variant">Nombre</p><p className="text-base font-semibold">{sched?.nombre || 'Oficina central'}</p></div>
            <div><p className="mb-1 text-[11px] font-bold uppercase text-on-surface-variant">Vigencia</p><p className="text-base font-semibold">{sched?.vigencia || '01/06/2025 en adelante'}</p></div>
            <div><p className="mb-1 text-[11px] font-bold uppercase text-on-surface-variant">Descanso Mín.</p><p className="text-base font-semibold">{sched?.descanso || '60m'}</p></div>
          </div>
          <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-surface-container-low p-4">
            <div><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Tol. Entrada</p><span className="rounded bg-primary-container px-2 py-0.5 text-xs font-bold text-on-primary-container">{sched?.tolEntrada || '5m'}</span></div>
            <div><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Tol. Salida</p><span className="rounded bg-primary-container px-2 py-0.5 text-xs font-bold text-on-primary-container">{sched?.tolSalida || '10m'}</span></div>
            <div><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Umbral HE</p><span className="rounded bg-primary-container px-2 py-0.5 text-xs font-bold text-on-primary-container">{sched?.umbralHE || '15m'}</span></div>
          </div>
          <Link to={routes.horarios} className="block w-full rounded-xl border border-outline-variant/20 py-3 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-all hover:bg-surface-container-high">
            Ver horario semanal
          </Link>
        </div>

        <div className="rounded-xl bg-surface-container-highest p-6">
          <h3 className="mb-6 flex items-center gap-2 font-headline text-lg font-bold">
            <span className="material-symbols-outlined text-primary">analytics</span> Resumen del Período
          </h3>
          <div className="mb-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Días Trabajados', value: period?.workedDays || '20', color: '' },
              { label: 'Inasistencias',   value: period?.absences   || '1',  color: 'text-error' },
              { label: 'Llegadas Tarde',  value: period?.late       || '22m', color: 'text-tertiary' },
              { label: 'HE 50%',          value: period?.he50       || '6h 15m', color: 'text-primary' },
              { label: 'HE 100%',         value: period?.he100      || '0h 00m', color: '' },
              { label: 'Horas Faltantes', value: period?.missing    || '40m', color: 'text-error' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-surface-container-lowest p-4">
                <span className="text-sm font-medium text-on-surface-variant">{label}</span>
                <span className={`font-headline text-xl font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
          <div className="mb-6 flex items-center justify-between rounded-lg bg-tertiary-container p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-tertiary-container">pending_actions</span>
              <span className="text-sm font-bold text-on-tertiary-container">Items pendientes de aprobación</span>
            </div>
            <span className="font-headline text-xl font-black text-on-tertiary-container">{period?.pending || '2'}</span>
          </div>
          <button type="button" className="w-full rounded-xl bg-on-background py-3 text-xs font-bold uppercase tracking-widest text-surface transition-all hover:opacity-90">
            Ver resumen mensual
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <section className="mb-6 rounded-xl bg-surface-container-lowest p-6">
        <h3 className="mb-6 font-headline text-lg font-bold">Grilla Semanal de Trabajo</h3>
        <div className="overflow-hidden rounded-lg">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {['Día', 'Laborable', 'Entrada', 'Salida', 'Observaciones'].map((h) => (
                  <th key={h} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {weeklyGrid.map((row) => {
                const isRest = !row.workday
                return (
                  <tr key={row.day} className={`border-b border-slate-50 transition-colors hover:bg-surface-container-low ${isRest ? 'bg-surface-container-low/30' : ''}`}>
                    <td className={`px-6 py-4 font-semibold ${isRest ? 'text-on-surface-variant' : ''}`}>{row.day}</td>
                    <td className="px-6 py-4">
                      {row.workday
                        ? <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        : <span className="material-symbols-outlined text-outline">cancel</span>}
                    </td>
                    <td className="px-6 py-4">{row.entry}</td>
                    <td className="px-6 py-4">{row.exit}</td>
                    <td className={`px-6 py-4 ${isRest ? 'font-medium text-on-surface-variant' : 'italic text-on-surface-variant'}`}>{row.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Logs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl bg-surface-container-lowest p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold">Últimas Fichadas</h3>
            <Link to={routes.fichadas} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="overflow-hidden rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Fichadas</th>
                  <th className="px-4 py-3">Interpretación</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {recentPunches.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="px-4 py-4 font-medium">{p.date}</td>
                    <td className="px-4 py-4">{p.times}</td>
                    <td className="px-4 py-4">
                      {p.tags ? (
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map((tag) => (
                            <span key={tag.label} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tag.className}`}>{tag.label}</span>
                          ))}
                        </div>
                      ) : (
                        <span className={p.interpretClassName}>{p.interpret}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container-lowest p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-headline text-lg font-bold">Novedades Recientes</h3>
            <Link to={routes.novedades} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Gestionar todas</Link>
          </div>
          <div className="overflow-hidden rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  {['ID', 'Tipo', 'Fecha / Cant.', 'Estado', 'Acción'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {recentNews.map((n) => (
                  <tr key={n.id} className="border-b border-slate-50">
                    <td className="px-4 py-4 text-on-surface-variant">#{n.id}</td>
                    <td className="px-4 py-4 font-semibold">{n.type}</td>
                    <td className="px-4 py-4">{n.detail}</td>
                    <td className="px-4 py-4">
                      <span className={`flex items-center gap-1.5 font-bold ${n.statusColor}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${n.dotColor}`} />{n.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button type="button" className="material-symbols-outlined text-primary transition-transform hover:scale-110">visibility</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Modal: Editar Empleado ── */}
      <Modal open={openEdit} title="Editar Empleado" subtitle="Legajo 0042 — los cambios quedan registrados con trazabilidad." onClose={() => setOpenEdit(false)}>
        <form onSubmit={async (e) => { e.preventDefault(); await updateEmployee('emp_42', editForm); setOpenEdit(false) }} className="space-y-5 px-8 py-6">
          <div className="grid grid-cols-2 gap-5">
            <div><label className={LABEL}>Nombre *</label><input required value={editForm.nombre} onChange={ef('nombre')} placeholder="Ej: Juan" className={INPUT} /></div>
            <div><label className={LABEL}>Apellido *</label><input required value={editForm.apellido} onChange={ef('apellido')} placeholder="Ej: Perez" className={INPUT} /></div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div><label className={LABEL}>DNI *</label><input required maxLength={8} value={editForm.dni} onChange={ef('dni')} className={INPUT} /></div>
            <div><label className={LABEL}>Sexo *</label>
              <select required value={editForm.sexo} onChange={ef('sexo')} className={INPUT}>
                <option value="M">Masculino</option><option value="F">Femenino</option><option value="X">No binario / X</option>
              </select>
            </div>
            <div><label className={LABEL}>CUIL <span className="ml-1 font-normal normal-case text-on-surface-variant">(calculado)</span></label>
              <input readOnly value={editCuil} className="w-full cursor-default rounded-lg border border-outline-variant/20 bg-surface-container-highest px-3 py-2.5 font-mono text-sm font-bold text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className={LABEL}>Fecha de ingreso *</label><input required type="date" value={editForm.fechaIngreso} onChange={ef('fechaIngreso')} className={INPUT} /></div>
            <div><label className={LABEL}>Categoría laboral *</label>
              <select required value={editForm.categoria} onChange={ef('categoria')} className={INPUT}>
                <option>Administrativo</option><option>Operario / Planta</option><option>Técnico</option><option>Supervisor</option><option>Gerencia</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div><label className={LABEL}>Convenio colectivo</label>
              <select value={editForm.convenio} onChange={ef('convenio')} className={INPUT}>
                <option value="">Sin convenio / No aplica</option><option>Comercio (130/75)</option><option>Metalúrgico (260/75)</option><option>Gastronómico (389/04)</option><option>Construcción (76/75)</option><option>Otro</option>
              </select>
            </div>
            <div><label className={LABEL}>Tipo de jornada *</label>
              <select required value={editForm.jornada} onChange={ef('jornada')} className={INPUT}>
                <option value="Completa">Completa</option><option value="Parcial">Parcial</option>
              </select>
            </div>
          </div>
          {editForm.jornada === 'Parcial' && (
            <div className="overflow-hidden rounded-xl border border-primary/20 bg-primary-container/10">
              <div className="flex items-center gap-2 border-b border-primary/20 bg-primary-container/30 px-5 py-3">
                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">Horas de jornada parcial</span>
              </div>
              <div className="px-5 py-4">
                <label className={LABEL}>Horas diarias *</label>
                <div className="flex items-center gap-3">
                  <input type="number" min="1" max="7" step="0.5" value={editForm.parcialHoras} onChange={ef('parcialHoras')} placeholder="Ej: 4"
                    className="w-32 rounded-lg border border-outline-variant/40 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="text-sm font-medium text-on-surface-variant">hs / día <span className="text-on-surface-variant/60">(máx. 7)</span></span>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-5">
            <div><label className={LABEL}>Horario asignado</label>
              <select value={editForm.horario} onChange={ef('horario')} className={INPUT}>
                <option value="">Sin asignar</option><option>H-001 Planta Mañana</option><option>H-002 Soporte Nocturno</option><option>H-003 Oficina central</option><option>C-001 4x2 Producción</option><option>C-002 Rotación planta A</option>
              </select>
            </div>
            <div><label className={LABEL}>Modalidad de fichada</label>
              <select value={editForm.fichada} onChange={ef('fichada')} className={INPUT}>
                <option>Biométrico</option><option>App móvil</option><option>PIN / Teclado</option><option>QR</option><option>Manual</option>
              </select>
            </div>
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
      <Modal open={openHorario} title="Asignar Horario" subtitle="Juan Perez — Legajo 0042" onClose={() => setOpenHorario(false)} size="max-w-md">
        <form onSubmit={async (e) => { e.preventDefault(); await createEmployeeAssignment('emp_42', { type: 'horario' }); setOpenHorario(false) }} className="space-y-4 px-8 py-6">
          <div><label className={LABEL}>Horario a asignar *</label>
            <select required className={INPUT}>
              <option value="">Seleccionar horario...</option>
              <optgroup label="Horarios fijos">
                <option>H-001 Planta Mañana (Lun-Vie 06:00-14:00)</option>
                <option>H-003 Oficina central (Lun-Vie 09:00-18:00)</option>
                <option>H-002 Soporte Nocturno (Lun-Vie 22:00-06:00)</option>
              </optgroup>
            </select>
          </div>
          <div><label className={LABEL}>Vigencia desde *</label><input required type="date" className={INPUT} /></div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenHorario(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">schedule</span> Asignar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Asignar Ciclo ── */}
      <Modal open={openCiclo} title="Asignar Ciclo Rotativo" subtitle="Juan Perez — Legajo 0042" onClose={() => setOpenCiclo(false)} size="max-w-md">
        <form onSubmit={async (e) => { e.preventDefault(); await createEmployeeAssignment('emp_42', { type: 'ciclo' }); setOpenCiclo(false) }} className="space-y-4 px-8 py-6">
          <div><label className={LABEL}>Ciclo a asignar *</label>
            <select required className={INPUT}>
              <option value="">Seleccionar ciclo...</option>
              <option>C-001 4x2 Producción</option>
              <option>C-002 Rotación planta A</option>
              <option>C-003 5x2 Turno rotativo</option>
            </select>
          </div>
          <div><label className={LABEL}>Vigencia desde *</label><input required type="date" className={INPUT} /></div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenCiclo(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">sync_alt</span> Asignar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Cargar Novedad ── */}
      <Modal open={openNews} title="Cargar Novedad" subtitle="Juan Perez — Legajo 0042" onClose={() => setOpenNews(false)}>
        <form onSubmit={async (e) => { e.preventDefault(); await createEmployeeNews('emp_42', { type: novTipo }); setOpenNews(false) }} className="space-y-4 px-8 py-6">
          <div><label className={LABEL}>Tipo de novedad *</label>
            <select required value={novTipo} onChange={(e) => setNovTipo(e.target.value)} className={INPUT}>
              <option value="">Seleccionar tipo...</option>
              <optgroup label="Horas extra">
                <option value="horas_extra_50">Horas extra 50%</option>
                <option value="horas_extra_100">Horas extra 100%</option>
                <option value="tardanza">Tardanza</option>
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
                <option value="suspension">Suspensión disciplinaria</option>
              </optgroup>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Fecha desde *</label><input required type="date" className={INPUT} /></div>
            <div><label className={LABEL}>Fecha hasta</label><input type="date" className={INPUT} /></div>
          </div>
          {(novTipo === 'horas_extra_50' || novTipo === 'horas_extra_100') && (
            <div><label className={LABEL}>Cantidad de horas *</label>
              <div className="flex items-center gap-2"><input type="number" min="0.5" step="0.5" placeholder="Ej: 2" className="w-28 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none" /><span className="text-sm text-on-surface-variant">hs</span></div>
            </div>
          )}
          {novTipo === 'tardanza' && (
            <div><label className={LABEL}>Minutos de tardanza *</label>
              <div className="flex items-center gap-2"><input type="number" min="1" placeholder="Ej: 15" className="w-28 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none" /><span className="text-sm text-on-surface-variant">min</span></div>
            </div>
          )}
          {['justificacion','ausencia','licencia_enfermedad','licencia_examen','vacaciones','permiso_especial','suspension'].includes(novTipo) && (
            <div><label className={LABEL}>Cantidad de días *</label>
              <div className="flex items-center gap-2"><input type="number" min="1" placeholder="Ej: 3" className="w-28 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none" /><span className="text-sm text-on-surface-variant">días</span></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Fecha de creación</label><input readOnly value={today} className="w-full cursor-default rounded-lg border border-outline-variant/20 bg-surface-container-highest px-3 py-2.5 font-mono text-sm text-on-surface-variant" /></div>
            <div><label className={LABEL}>Creado por</label>
              <select className={INPUT}><option>Administrator</option><option>Supervisor RRHH</option><option>Jefe de área</option></select>
            </div>
          </div>
          <div><label className={LABEL}>Observación</label>
            <textarea rows={2} placeholder="Detalle adicional (opcional)..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
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
      <Modal open={openPunch} title="Cargar Fichada Manual" subtitle="Juan Perez — Legajo 0042" onClose={() => setOpenPunch(false)} size="max-w-md">
        <form onSubmit={async (e) => { e.preventDefault(); await createEmployeeManualPunch('emp_42', {}); setOpenPunch(false) }} className="space-y-4 px-8 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Fecha *</label><input required type="date" className={INPUT} /></div>
            <div><label className={LABEL}>Hora *</label><input required type="time" className={INPUT} /></div>
          </div>
          <div><label className={LABEL}>Tipo *</label>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 p-3 hover:bg-surface-container-low has-[:checked]:border-primary has-[:checked]:bg-primary-container/20">
                <input type="radio" name="tipo-fichada" value="entrada" required className="accent-primary" />
                <span className="material-symbols-outlined text-sm text-green-600">login</span>
                <span className="text-sm font-semibold">Entrada</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 p-3 hover:bg-surface-container-low has-[:checked]:border-error has-[:checked]:bg-error-container/10">
                <input type="radio" name="tipo-fichada" value="salida" className="accent-error" />
                <span className="material-symbols-outlined text-sm text-red-600">logout</span>
                <span className="text-sm font-semibold">Salida</span>
              </label>
            </div>
          </div>
          <div><label className={LABEL}>Motivo *</label>
            <textarea required rows={2} placeholder="Describí el motivo del registro manual..." className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenPunch(false)} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
            <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim">
              <span className="material-symbols-outlined text-sm">fingerprint</span> Registrar
            </button>
          </div>
        </form>
      </Modal>

    </AppShell>
  )
}
