import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Modal from '../../components/ui/Modal'
import { routes } from '../../lib/routes'

const schedulesSeed = [
  { id: 'H-001', name: 'Planta Mañana', type: 'Fijo', status: 'Activo', start: '08:00', end: '17:00', entryTol: 5, exitTol: 10, breakMin: 60, weeklyEnd: '16:00' },
  { id: 'H-002', name: 'Soporte Nocturno', type: 'Fijo', status: 'Activo', start: '22:00', end: '06:00', entryTol: 10, exitTol: 15, breakMin: 45, weeklyEnd: '06:00' },
  { id: 'H-003', name: 'Oficina Central', type: 'Fijo', status: 'Activo', start: '09:00', end: '18:00', entryTol: 5, exitTol: 10, breakMin: 60, weeklyEnd: '16:00' },
  { id: 'H-004', name: 'Planta Tarde', type: 'Fijo', status: 'Activo', start: '14:00', end: '22:00', entryTol: 5, exitTol: 10, breakMin: 60, weeklyEnd: '22:00' },
  { id: 'H-005', name: 'Parcial Mañana', type: 'Fijo', status: 'Activo', start: '09:00', end: '13:00', entryTol: 5, exitTol: 5, breakMin: 0, weeklyEnd: '13:00' },
  { id: 'H-006', name: 'Flexible Administrativo', type: 'Flexible', status: 'Activo', start: '—', end: '—', entryTol: 10, exitTol: 10, breakMin: 0, flexMode: 'semanal', weeklyHours: 40 },
]

const cyclesSeed = [
  { id: 'C-001', name: '4x2 Producción', days: 6, status: 'Activo' },
  { id: 'C-002', name: 'Rotación Planta A', days: 14, status: 'Activo' },
  { id: 'C-003', name: 'Rotación Planta B', days: 21, status: 'Activo' },
]

const assignmentsSeed = [
  { id: 'A-0093', legajo: '0093', employee: 'Carlos Méndez', initials: 'CM', avatarClass: 'bg-blue-100 text-primary', type: 'horario', typeLabel: 'Horario fijo', resource: 'H-003 · Oficina Central', from: '01/01/2024', to: 'Indefinido', status: 'Activa' },
  { id: 'A-0105', legajo: '0105', employee: 'Lucía Ferrero', initials: 'LF', avatarClass: 'bg-purple-100 text-tertiary', type: 'ciclo', typeLabel: 'Ciclo rotativo', resource: 'C-002 · Rotación Planta A', from: '15/02/2024', to: '31/12/2025', status: 'Activa' },
  { id: 'A-0042', legajo: '0042', employee: 'Juan Perez', initials: 'JP', avatarClass: 'bg-blue-100 text-primary', type: 'horario', typeLabel: 'Horario fijo', resource: 'H-003 · Oficina Central', from: '01/06/2025', to: 'Indefinido', status: 'Activa', employeeRoute: routes.empleadoJuanPerez },
  { id: 'A-0090', legajo: '0090', employee: 'Martín Paz', initials: 'MP', avatarClass: 'bg-slate-200 text-slate-600', type: 'horario', typeLabel: 'Horario fijo', resource: 'H-001 · Planta Mañana', from: '10/01/2024', to: 'Indefinido', status: 'Activa' },
]

const scheduleOptions = ['H-001 · Planta Mañana', 'H-002 · Soporte Nocturno', 'H-003 · Oficina Central', 'H-004 · Planta Tarde', 'H-005 · Parcial Mañana']
const cycleOptions = ['C-001 · 4x2 Producción (6 días)', 'C-002 · Rotación Planta A (14 días)', 'C-003 · Rotación Planta B (21 días)']
const employeeOptions = ['0042 · Juan Perez', '0018 · Ana Gomez', '0027 · Martin Sosa', '0031 · Luis Diaz', '0050 · Carla Ruiz', '0093 · Carlos Méndez', '0105 · Lucía Ferrero', '0158 · Maria Alvez']
const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function StatusPill({ children }) {
  return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-on-secondary-container"><span className="h-1.5 w-1.5 rounded-full bg-on-secondary-container" /> {children}</span>
}

function TypePill({ children, variant = 'default' }) {
  const classes = variant === 'primary' ? 'bg-primary-container text-on-primary-container' : variant === 'tertiary' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container text-on-surface-variant'
  return <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${classes}`}>{children}</span>
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

function ModalActions({ onCancel, children }) {
  return (
    <div className="flex gap-3 border-t border-slate-100 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low">Cancelar</button>
      <button type="button" onClick={onCancel} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dim">{children}</button>
    </div>
  )
}

export default function HorariosPage() {
  const [activeTab, setActiveTab] = useState('horarios')
  const [search, setSearch] = useState('')
  const [scheduleType, setScheduleType] = useState('')
  const [scheduleStatus, setScheduleStatus] = useState('')
  const [cycleStatus, setCycleStatus] = useState('')
  const [assignmentType, setAssignmentType] = useState('')
  const [assignmentStatus, setAssignmentStatus] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [modal, setModal] = useState('')
  const [isFlexible, setIsFlexible] = useState(false)
  const [flexMode, setFlexMode] = useState('')
  const [cycleLength, setCycleLength] = useState('')

  useEffect(() => {
    document.title = 'Horarios - Executive Architect'
  }, [])

  const searchPlaceholder = activeTab === 'horarios' ? 'BUSCAR HORARIO...' : activeTab === 'ciclos' ? 'BUSCAR CICLO...' : 'BUSCAR EMPLEADO...'

  const filteredSchedules = useMemo(() => schedulesSeed.filter((item) => {
    return item.name.toLowerCase().includes(search.toLowerCase()) && (!scheduleType || item.type === scheduleType) && (!scheduleStatus || item.status === scheduleStatus)
  }), [scheduleStatus, scheduleType, search])

  const filteredCycles = useMemo(() => cyclesSeed.filter((item) => {
    return item.name.toLowerCase().includes(search.toLowerCase()) && (!cycleStatus || item.status === cycleStatus)
  }), [cycleStatus, search])

  const filteredAssignments = useMemo(() => assignmentsSeed.filter((item) => {
    return `${item.legajo} ${item.employee} ${item.resource}`.toLowerCase().includes(search.toLowerCase()) && (!assignmentType || item.type === assignmentType) && (!assignmentStatus || item.status.toLowerCase() === assignmentStatus)
  }), [assignmentStatus, assignmentType, search])

  const clearSelectionForTab = (tab) => {
    setActiveTab(tab)
    setSearch('')
    setSelectedSchedule(null)
    setSelectedCycle(null)
    setSelectedAssignment(null)
  }

  return (
    <AppShell
      topbarTitle="HORARIOS"
      topbarContent={
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><span className="material-symbols-outlined text-sm">search</span></span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }} className="w-56 rounded-md border-none bg-surface-container-low py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary" placeholder={searchPlaceholder} type="text" />
          </div>
          <button type="button" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90">
            <span className="material-symbols-outlined text-sm">search</span> Buscar
          </button>
        </div>
      }
    >
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
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Horarios activos</p><p className="font-headline text-2xl font-black text-primary">12</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Ciclos activos</p><p className="font-headline text-2xl font-black text-tertiary">3</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Asignaciones</p><p className="font-headline text-2xl font-black text-on-secondary-container">48</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Sin asignar</p><p className="font-headline text-2xl font-black text-error">4</p></div>
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
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5"><h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">schedule</span> LISTADO DE HORARIOS</h3><div className="flex items-center gap-2"><select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} className="min-w-[7rem] rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-7 text-xs font-medium text-on-surface-variant"><option value="">Todos los tipos</option><option>Fijo</option><option>Flexible</option></select><select value={scheduleStatus} onChange={(e) => setScheduleStatus(e.target.value)} className="min-w-[7rem] rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-7 text-xs font-medium text-on-surface-variant"><option value="">Todos los estados</option><option>Activo</option><option>Inactivo</option></select><button type="button" onClick={() => { setScheduleType(''); setScheduleStatus('') }} className="flex items-center gap-1 rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"><span className="material-symbols-outlined text-sm">filter_alt_off</span></button></div></div>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low"><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">ID</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredSchedules.map((item) => <tr key={item.id} onClick={() => setSelectedSchedule(item)} className="cursor-pointer transition-colors hover:bg-slate-50"><td className="px-5 py-3.5 font-mono text-sm font-bold text-primary">{item.id}</td><td className="px-5 py-3.5 text-sm font-semibold">{item.name}</td><td className="px-5 py-3.5"><TypePill variant={item.type === 'Flexible' ? 'primary' : 'default'}>{item.type}</TypePill></td><td className="px-5 py-3.5"><StatusPill>{item.status}</StatusPill></td></tr>)}</tbody></table></div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3"><p className="text-xs text-on-surface-variant">Mostrando 5 de 12 horarios</p><div className="flex items-center gap-1"><button className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant"><span className="material-symbols-outlined text-sm">chevron_left</span></button><span className="px-2 text-xs font-bold text-on-surface-variant">1 / 3</span><button className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant"><span className="material-symbols-outlined text-sm">chevron_right</span></button></div></div>
          </div>
          <div className="col-span-12 space-y-4 lg:col-span-5">{selectedSchedule ? <ScheduleDetail item={selectedSchedule} onEdit={() => setModal('editar-horario')} /> : <EmptyDetail title="Ningún horario seleccionado" />}</div>
        </div>
      ) : null}

      {activeTab === 'ciclos' ? (
        <div className="grid grid-cols-12 gap-6"><div className="col-span-12 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest lg:col-span-7"><div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5"><h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">autorenew</span> LISTADO DE CICLOS</h3><div className="flex items-center gap-2"><select value={cycleStatus} onChange={(e) => setCycleStatus(e.target.value)} className="min-w-[8rem] rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-7 text-xs font-medium text-on-surface-variant"><option value="">Todos los estados</option><option>Activo</option><option>Inactivo</option></select><button type="button" onClick={() => setCycleStatus('')} className="flex items-center gap-1 rounded-md border border-outline-variant/30 px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"><span className="material-symbols-outlined text-sm">filter_alt_off</span></button></div></div><div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low"><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">ID</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre</th><th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Duración</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredCycles.map((item) => <tr key={item.id} onClick={() => setSelectedCycle(item)} className="cursor-pointer transition-colors hover:bg-slate-50"><td className="px-5 py-3.5 font-mono text-sm font-bold text-primary">{item.id}</td><td className="px-5 py-3.5 text-sm font-semibold">{item.name}</td><td className="px-5 py-3.5 text-center"><TypePill>{item.days} días</TypePill></td><td className="px-5 py-3.5"><StatusPill>{item.status}</StatusPill></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-100 px-5 py-3"><p className="text-xs text-on-surface-variant">Mostrando 3 ciclos</p><span className="px-2 text-xs font-bold text-on-surface-variant">1 / 1</span></div></div><div className="col-span-12 lg:col-span-5">{selectedCycle ? <CycleDetail item={selectedCycle} onEdit={() => setModal('editar-ciclo')} /> : <EmptyDetail title="Ningún ciclo seleccionado" />}</div></div>
      ) : null}

      {activeTab === 'asignaciones' ? (
        <div className="grid grid-cols-12 gap-6"><div className="col-span-12 overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest lg:col-span-7"><div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5"><h3 className="flex shrink-0 items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">person_pin</span> ASIGNACIONES</h3><div className="flex items-center gap-2"><select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)} className="min-w-[9rem] rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-7 text-xs font-medium text-on-surface-variant"><option value="">Todos los tipos</option><option value="horario">Horario fijo</option><option value="ciclo">Ciclo rotativo</option></select><select value={assignmentStatus} onChange={(e) => setAssignmentStatus(e.target.value)} className="min-w-[8rem] rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-7 text-xs font-medium text-on-surface-variant"><option value="">Todos los estados</option><option value="activa">Activa</option><option value="vencida">Vencida</option></select><button type="button" onClick={() => { setAssignmentType(''); setAssignmentStatus('') }} className="rounded-md border border-outline-variant/30 p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low"><span className="material-symbols-outlined text-sm">filter_alt_off</span></button></div></div><div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low"><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Legajo</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Empleado</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Horario / Ciclo</th><th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredAssignments.map((item) => <tr key={item.id} onClick={() => setSelectedAssignment(item)} className="cursor-pointer transition-colors hover:bg-slate-50"><td className="px-5 py-3.5 font-mono text-sm font-bold text-primary">{item.legajo}</td><td className="px-5 py-3.5"><div className="flex items-center gap-2"><div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${item.avatarClass}`}>{item.initials}</div>{item.employeeRoute ? <Link to={item.employeeRoute} onClick={(event) => event.stopPropagation()} className="text-sm font-semibold hover:text-primary hover:underline">{item.employee}</Link> : <span className="text-sm font-semibold">{item.employee}</span>}</div></td><td className="px-5 py-3.5"><TypePill variant={item.type === 'ciclo' ? 'tertiary' : 'default'}>{item.typeLabel}</TypePill></td><td className="px-5 py-3.5 text-sm font-medium">{item.resource}</td><td className="px-5 py-3.5"><StatusPill>{item.status}</StatusPill></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-100 px-5 py-3"><p className="text-xs text-on-surface-variant">Mostrando 4 asignaciones</p><span className="px-2 text-xs font-bold text-on-surface-variant">1 / 1</span></div></div><div className="col-span-12 lg:col-span-5">{selectedAssignment ? <AssignmentDetail item={selectedAssignment} onEdit={() => setModal('editar-asignacion')} /> : <EmptyDetail title="Ninguna asignación seleccionada" />}</div></div>
      ) : null}

      <ScheduleModal open={modal === 'nuevo-horario' || modal === 'editar-horario'} title={modal === 'editar-horario' ? 'Editar Horario' : 'Nuevo Horario'} onClose={() => setModal('')} isFlexible={isFlexible} setIsFlexible={setIsFlexible} flexMode={flexMode} setFlexMode={setFlexMode} />
      <CycleModal open={modal === 'nuevo-ciclo' || modal === 'editar-ciclo'} title={modal === 'editar-ciclo' ? 'Editar Ciclo' : 'Nuevo Ciclo Rotativo'} onClose={() => setModal('')} cycleLength={cycleLength} setCycleLength={setCycleLength} />
      <AssignmentModal open={modal === 'asignar-horario'} title="Asignar Horario" onClose={() => setModal('')} mode="horario" />
      <AssignmentModal open={modal === 'asignar-ciclo'} title="Asignar Ciclo Rotativo" onClose={() => setModal('')} mode="ciclo" />
      <EditAssignmentModal open={modal === 'editar-asignacion'} onClose={() => setModal('')} />
    </AppShell>
  )
}

function EmptyDetail({ title }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/50 bg-surface-container-lowest px-6 py-16 text-center"><span className="material-symbols-outlined mb-3 text-4xl text-outline-variant">touch_app</span><p className="text-sm font-semibold text-on-surface-variant">{title}</p><p className="mt-1 text-xs text-on-surface-variant/60">Hacé clic en una fila para ver el detalle</p></div>
}

function ScheduleDetail({ item, onEdit }) {
  return <><div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">info</span> DETALLE</h3><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-on-surface-variant">{item.id}</span><button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"><span className="material-symbols-outlined text-sm">edit</span> Editar</button></div></div><div className="space-y-3 p-5"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Nombre</span><span className="text-sm font-bold">{item.name}</span></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Tipo</span><TypePill variant={item.type === 'Flexible' ? 'primary' : 'default'}>{item.type}</TypePill></div>{item.type === 'Flexible' ? <div className="space-y-2 rounded-xl bg-primary-container/20 p-3.5"><p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary"><span className="material-symbols-outlined text-sm">tune</span> Flexibilidad</p><div className="flex items-center justify-between"><span className="text-xs text-on-surface-variant">Modo</span><span className="text-xs font-bold capitalize">{item.flexMode}</span></div><div className="flex items-center justify-between"><span className="text-xs text-on-surface-variant">Horas semanales objetivo</span><span className="text-sm font-black text-primary">{item.weeklyHours}</span></div></div> : null}<div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Tolerancia Entrada</p><p className="text-lg font-black text-primary">{item.entryTol}m</p></div><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Tolerancia Salida</p><p className="text-lg font-black text-primary">{item.exitTol}m</p></div></div><div className="flex items-center justify-between rounded-lg bg-tertiary-container/25 p-3.5"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm text-tertiary">coffee</span><span className="text-xs font-semibold text-on-tertiary-container">Descanso mínimo</span></div><span className="text-sm font-black text-tertiary">{item.breakMin}m</span></div></div></div><div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">calendar_view_week</span> DESGLOSE SEMANAL</h3></div><div className="grid grid-cols-7 gap-1.5 p-4">{weekDays.map((day, index) => <div key={day} className={`${index > 4 ? 'bg-surface-container-high/50 border-outline-variant opacity-50' : 'bg-primary-container/30 border-primary'} rounded-lg border-t-2 p-2 text-center`}><p className="text-[9px] font-black uppercase text-on-surface-variant">{day}</p>{index > 4 ? <p className="mt-2 text-[10px] text-on-surface-variant">Libre</p> : <><p className="mt-1 text-[10px] font-bold text-primary">{item.start}</p><p className="text-[10px] text-on-surface-variant">{index === 4 ? item.weeklyEnd : item.end}</p></>}</div>)}</div></div></>
}

function CycleDetail({ item, onEdit }) {
  const mapping = Array.from({ length: Math.min(item.days, 6) }, (_, index) => index + 1)
  return <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">info</span> DETALLE DEL CICLO</h3><div className="flex items-center gap-2"><span className="font-mono text-xs font-bold text-on-surface-variant">{item.id}</span><button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"><span className="material-symbols-outlined text-sm">edit</span> Editar</button></div></div><div className="p-5"><div className="mb-4 flex items-center justify-between rounded-xl bg-surface-container-low p-4"><div><p className="mb-0.5 text-[10px] font-bold uppercase text-on-surface-variant">Nombre</p><p className="text-sm font-bold">{item.name}</p></div><div className="text-right"><p className="mb-0.5 text-[10px] font-bold uppercase text-on-surface-variant">Total días</p><p className="text-2xl font-black text-tertiary">{item.days}</p></div></div><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mapeo de días</p><div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">{mapping.map((day) => <div key={day} className={`flex items-center justify-between rounded-lg bg-surface-container-low p-2.5 text-sm ${day > 4 ? 'border-l-4 border-outline-variant opacity-60' : day > 2 ? 'border-l-4 border-tertiary' : 'border-l-4 border-primary'}`}><span className="w-12 text-xs font-bold">Día {day}</span><span className="material-symbols-outlined text-sm text-outline-variant">arrow_right_alt</span><span className={`text-xs font-medium ${day > 4 ? 'text-on-surface-variant' : day > 2 ? 'text-tertiary' : 'text-primary'}`}>{day > 4 ? 'Libre' : day > 2 ? 'H-004 · Tarde' : 'H-001 · Mañana'}</span></div>)}</div></div></div>
}

function AssignmentDetail({ item, onEdit }) {
  return <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]"><span className="material-symbols-outlined text-sm">info</span> DETALLE DE ASIGNACIÓN</h3><button onClick={onEdit} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"><span className="material-symbols-outlined text-sm">edit</span> Editar</button></div><div className="space-y-4 p-5"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${item.avatarClass}`}>{item.initials}</div><div><p className="text-sm font-bold">{item.employee}</p><p className="font-mono text-xs text-on-surface-variant">{item.legajo}</p></div></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Tipo</span><TypePill variant={item.type === 'ciclo' ? 'tertiary' : 'default'}>{item.typeLabel}</TypePill></div><div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-on-surface-variant">Asignado</span><span className="text-sm font-bold">{item.resource}</span></div><div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Desde</p><p className="text-sm font-black text-primary">{item.from}</p></div><div className="rounded-lg bg-surface-container-low p-3"><p className="mb-1 text-[10px] font-bold uppercase text-on-surface-variant">Hasta</p><p className="text-sm font-black text-on-background">{item.to}</p></div></div><div className="flex items-center justify-between pt-1"><span className="text-xs text-on-surface-variant">Estado</span><StatusPill>{item.status}</StatusPill></div></div></div>
}

function ScheduleModal({ open, title, onClose, isFlexible, setIsFlexible, flexMode, setFlexMode }) {
  return <Modal open={open} title={title} onClose={onClose} size="max-w-xl"><form className="space-y-5 px-8 py-6"><div className="grid grid-cols-2 gap-4"><Field label="Nombre *"><TextInput required placeholder="Ej: Planta Mañana" /></Field><Field label="Tipo *"><SelectInput required onChange={(e) => setIsFlexible(e.target.value === 'Flexible')}><option value="">Seleccionar...</option><option>Fijo</option><option>Flexible</option></SelectInput></Field><Field label="Descanso mínimo"><TextInput type="number" min="0" max="120" placeholder="60" /></Field></div>{isFlexible ? <div className="space-y-4 rounded-xl border border-primary/20 bg-primary-container/20 p-4"><p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-primary"><span className="material-symbols-outlined text-sm">tune</span> Configuración de flexibilidad</p><div className="flex gap-3"><label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 bg-white p-3"><input type="radio" name="modo-flex" value="diaria" onChange={(e) => setFlexMode(e.target.value)} /><div><p className="text-sm font-semibold">Diaria</p><p className="text-[10px] text-on-surface-variant">Objetivo por día</p></div></label><label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/40 bg-white p-3"><input type="radio" name="modo-flex" value="semanal" onChange={(e) => setFlexMode(e.target.value)} /><div><p className="text-sm font-semibold">Semanal</p><p className="text-[10px] text-on-surface-variant">Objetivo por semana</p></div></label></div>{flexMode === 'diaria' ? <Field label="Horas objetivo diarias *"><TextInput type="number" min="1" max="12" step="0.5" placeholder="8" /></Field> : null}{flexMode === 'semanal' ? <Field label="Horas objetivo semanales *"><TextInput type="number" min="1" max="60" step="0.5" placeholder="40" /></Field> : null}</div> : null}<DaysEditor /><div className="grid grid-cols-2 gap-4"><Field label="Tolerancia entrada"><TextInput type="number" min="0" max="60" placeholder="5" /></Field><Field label="Tolerancia salida"><TextInput type="number" min="0" max="60" placeholder="10" /></Field></div><ModalActions onCancel={onClose}>{title.startsWith('Editar') ? 'Guardar cambios' : 'Crear horario'}</ModalActions></form></Modal>
}

function DaysEditor() {
  return <div><label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Días laborables *</label><div className="space-y-2"><div className="grid grid-cols-[7rem_1fr_1fr] items-center gap-3 border-b border-slate-100 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"><span>Día</span><span>Entrada</span><span>Salida</span></div><div className="space-y-1.5">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => <label key={day} className={`grid cursor-pointer grid-cols-[7rem_1fr_1fr] items-center gap-3 ${index > 4 ? 'opacity-50' : ''}`}><span className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" defaultChecked={index <= 4} className="accent-primary" /> {day}</span><input type="time" defaultValue={index === 4 ? '09:00' : '09:00'} disabled={index > 4} className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 py-1.5 text-xs" /><input type="time" defaultValue={index === 4 ? '16:00' : '18:00'} disabled={index > 4} className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 py-1.5 text-xs" /></label>)}</div></div></div>
}

function CycleModal({ open, title, onClose, cycleLength, setCycleLength }) {
  const length = Number(cycleLength)
  return <Modal open={open} title={title} onClose={onClose} size="max-w-lg"><form className="space-y-5 px-8 py-6"><Field label="Nombre *"><TextInput required placeholder="Ej: Rotación Planta A" /></Field><Field label="Duración del ciclo (días) *"><TextInput required type="number" min="2" max="60" placeholder="14" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} /></Field><div><label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Mapeo de días *</label><div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">{length >= 2 ? Array.from({ length }, (_, index) => <div key={index} className="flex items-center gap-3"><span className="w-10 text-xs font-bold text-on-surface-variant">Día {index + 1}</span><span className="material-symbols-outlined text-sm text-outline-variant">arrow_right_alt</span><SelectInput><option value="">Libre</option>{scheduleOptions.map((option) => <option key={option}>{option}</option>)}</SelectInput></div>) : <p className="text-xs italic text-on-surface-variant">Ingresá la duración para configurar los días.</p>}</div></div><div className="flex items-start gap-2 rounded-lg border border-tertiary/20 bg-tertiary-container/20 p-3"><span className="material-symbols-outlined mt-0.5 text-sm text-tertiary">info</span><p className="text-[11px] text-on-tertiary-container">Cada día puede asignarse a un horario existente o marcarse como <strong>Libre</strong>.</p></div><ModalActions onCancel={onClose}>{title.startsWith('Editar') ? 'Guardar cambios' : 'Crear ciclo'}</ModalActions></form></Modal>
}

function AssignmentModal({ open, title, onClose, mode }) {
  return <Modal open={open} title={title} onClose={onClose} size="max-w-lg"><form className="space-y-4 px-8 py-6"><Field label="Empleado *"><SelectInput required><option value="">Seleccionar empleado...</option>{employeeOptions.map((option) => <option key={option}>{option}</option>)}</SelectInput></Field><Field label={mode === 'ciclo' ? 'Ciclo *' : 'Horario *'}><SelectInput required><option value="">Seleccionar {mode === 'ciclo' ? 'ciclo' : 'horario'}...</option>{(mode === 'ciclo' ? cycleOptions : scheduleOptions).map((option) => <option key={option}>{option}</option>)}</SelectInput></Field><div className="grid grid-cols-2 gap-4"><Field label={mode === 'ciclo' ? 'Fecha inicio *' : 'Fecha desde *'}><TextInput required type="date" /></Field><Field label={mode === 'ciclo' ? 'Día de inicio del ciclo' : 'Fecha hasta'}><TextInput type={mode === 'ciclo' ? 'number' : 'date'} min="1" max="60" placeholder={mode === 'ciclo' ? '1' : 'Indefinido'} /></Field></div>{mode === 'ciclo' ? <Field label="Fecha hasta"><TextInput type="date" /></Field> : null}<div className="flex items-start gap-2 rounded-lg bg-surface-container-low p-3"><span className="material-symbols-outlined mt-0.5 text-sm text-on-surface-variant">info</span><p className="text-[11px] text-on-surface-variant">{mode === 'ciclo' ? 'El Día de inicio indica en qué posición del ciclo arranca el empleado.' : 'Si ya existe una asignación activa para el empleado, será reemplazada desde la fecha indicada.'}</p></div><ModalActions onCancel={onClose}>Confirmar asignación</ModalActions></form></Modal>
}

function EditAssignmentModal({ open, onClose }) {
  return <Modal open={open} title="Editar asignación" onClose={onClose} size="max-w-md"><form className="space-y-5 px-8 py-6"><Field label="Empleado"><TextInput readOnly value="Juan Perez" /></Field><Field label="Tipo *"><SelectInput required><option value="horario">Horario fijo</option><option value="ciclo">Ciclo rotativo</option></SelectInput></Field><Field label="Horario / Ciclo *"><SelectInput required>{[...scheduleOptions, ...cycleOptions].map((option) => <option key={option}>{option}</option>)}</SelectInput></Field><div className="grid grid-cols-2 gap-4"><Field label="Fecha desde *"><TextInput required type="date" /></Field><Field label="Fecha hasta"><TextInput type="date" /></Field></div><ModalActions onCancel={onClose}>Guardar cambios</ModalActions></form></Modal>
}
