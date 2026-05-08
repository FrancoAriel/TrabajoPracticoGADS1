import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/ui/SectionCard'
import StatCard from '../../components/ui/StatCard'
import { routes } from '../../lib/routes'
import { createEmployeeAssignment, createEmployeeManualPunch, createEmployeeNews, getEmployeeDetail, updateEmployee } from '../../services/employeeService'

const week = [
  ['Lunes', '08:00', '17:00', 'Presente'],
  ['Martes', '08:02', '17:05', 'Presente'],
  ['Miercoles', '09:15', '17:00', 'Tardanza'],
  ['Jueves', '08:00', '17:40', 'HE 50%'],
  ['Viernes', '08:00', '17:00', 'Presente'],
  ['Sabado', '-', '-', 'Franco'],
  ['Domingo', '-', '-', 'Franco'],
]

export default function EmpleadoDetallePage() {
  const [openEdit, setOpenEdit] = useState(false)
  const [openAssign, setOpenAssign] = useState(false)
  const [openNews, setOpenNews] = useState(false)
  const [openPunch, setOpenPunch] = useState(false)
  const [newsType, setNewsType] = useState('Horas extra 50%')
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    document.title = 'Detalle de empleado - Juan Perez'
    let cancelled = false

    getEmployeeDetail('emp_42').then((data) => {
      if (!cancelled) setDetail(data)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const employee = detail?.employee
  const scheduleConfig = detail?.scheduleConfig
  const periodSummary = detail?.periodSummary
  const weeklyGrid = detail?.weeklyGrid || week
  const recentPunches = detail?.recentPunches || []
  const recentNews = detail?.recentNews || []

  return (
    <AppShell topbarTitle="EMPLEADOS">
      <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to={routes.empleados} className="hover:text-primary hover:underline">Empleados</Link>
        <span>/</span>
        <span>{employee?.name || 'Juan Perez'}</span>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="font-headline text-3xl font-black tracking-tight text-on-background">{employee?.name || 'Juan Perez'}</h2>
            <Badge className="bg-primary/10 text-primary">Activo</Badge>
          </div>
          <p className="text-sm text-on-surface-variant">Leg. {employee?.legajo || '0042'} · {employee?.category || 'Operario'} · Convenio {employee?.convenio || 'UOM'}</p>
        </div>
        <button type="button" onClick={() => setOpenEdit(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">Editar empleado</button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => setOpenAssign(true)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">Asignar horario/ciclo</button>
        <button type="button" onClick={() => setOpenNews(true)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Cargar novedad</button>
        <button type="button" onClick={() => setOpenPunch(true)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">Fichada manual</button>
        <Link to={routes.fichadas} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">Ver fichadas</Link>
      </div>

      <div className="mb-6 grid grid-cols-12 gap-6">
        <SectionCard title="CONFIGURACION HORARIA" icon="schedule" className="col-span-12 lg:col-span-6" bodyClassName="p-5 space-y-3">
          <div className="flex items-center justify-between"><span className="text-sm text-on-surface-variant">Horario actual</span><span className="text-sm font-bold">{scheduleConfig?.schedule || 'Manana'}</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-on-surface-variant">Ciclo</span><span className="text-sm font-bold">{scheduleConfig?.cycle || 'Fijo semanal'}</span></div>
          <div className="flex items-center justify-between"><span className="text-sm text-on-surface-variant">Jornada</span><span className="text-sm font-bold">{scheduleConfig?.jornada || 'Completa'}</span></div>
          <Link to={routes.horarios} className="block pt-2 text-sm font-bold text-primary hover:underline">Ver horario semanal</Link>
        </SectionCard>
        <SectionCard title="RESUMEN DEL PERIODO" icon="analytics" className="col-span-12 lg:col-span-6" bodyClassName="p-5">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Dias trabajados" value={periodSummary?.workedDays || '9'} icon="calendar_month" className="bg-surface-container-lowest border border-slate-100" />
            <StatCard label="HE 50%" value={periodSummary?.he50 || '6h 15m'} icon="schedule" valueClassName="text-primary" className="bg-surface-container-lowest border border-slate-100" />
            <StatCard label="HE 100%" value={periodSummary?.he100 || '1h 00m'} icon="more_time" valueClassName="text-primary" className="bg-surface-container-lowest border border-slate-100" />
            <StatCard label="Tardanzas" value={periodSummary?.lateCount || '2'} icon="warning" valueClassName="text-tertiary" className="bg-surface-container-lowest border border-slate-100" />
            <StatCard label="Ausencias" value={periodSummary?.absenceCount || '0'} icon="person_off" className="bg-surface-container-lowest border border-slate-100" />
            <StatCard label="Pendientes" value={periodSummary?.pendingCount || '1'} icon="playlist_add_check" valueClassName="text-tertiary" className="bg-surface-container-lowest border border-slate-100" />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="GRILLA SEMANAL" icon="calendar_today" className="mb-6" bodyClassName="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead><tr className="bg-surface-container-low">{['Dia', 'Entrada', 'Salida', 'Estado'].map((h) => <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{weeklyGrid.map((row) => <tr key={row[0]} className="hover:bg-slate-50"><td className="px-5 py-3.5 text-sm font-bold">{row[0]}</td><td className="px-5 py-3.5 text-sm">{row[1]}</td><td className="px-5 py-3.5 text-sm">{row[2]}</td><td className="px-5 py-3.5 text-sm">{row[3]}</td></tr>)}</tbody>
        </table>
      </SectionCard>

      <div className="grid grid-cols-12 gap-6">
        <SectionCard title="ULTIMAS FICHADAS" icon="fingerprint" className="col-span-12 lg:col-span-6" bodyClassName="overflow-x-auto">
          <table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low"><th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Fecha</th><th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo</th><th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Origen</th></tr></thead><tbody className="divide-y divide-slate-100">{recentPunches.map((item) => <tr key={item.id}><td className="px-5 py-3 text-sm">{item.date}</td><td className="px-5 py-3 text-sm">{item.type}</td><td className="px-5 py-3 text-sm">{item.origin}</td></tr>)}</tbody></table>
        </SectionCard>
        <SectionCard title="NOVEDADES RECIENTES" icon="notification_important" className="col-span-12 lg:col-span-6" bodyClassName="overflow-x-auto">
          <table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low"><th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo</th><th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cantidad</th><th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{recentNews.map((item) => <tr key={item.id}><td className="px-5 py-3 text-sm">{item.type}</td><td className="px-5 py-3 text-sm">{item.quantity}</td><td className="px-5 py-3"><Badge className={item.status === 'Pendiente' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'}>{item.status}</Badge></td></tr>)}</tbody></table>
          <div className="px-5 pb-5 pt-2"><Link to={routes.novedades} className="text-sm font-bold text-primary hover:underline">Gestionar todas</Link></div>
        </SectionCard>
      </div>

      <Modal open={openEdit} title="Editar empleado" onClose={() => setOpenEdit(false)}><div className="space-y-4 px-6 py-5"><input defaultValue="Juan" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><input defaultValue="Perez" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><div className="flex justify-end"><button type="button" onClick={async () => { await updateEmployee('emp_42', { name: 'Juan Perez' }); setOpenEdit(false) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Guardar cambios</button></div></div></Modal>
      <Modal open={openAssign} title="Asignar horario o ciclo" onClose={() => setOpenAssign(false)}><div className="space-y-4 px-6 py-5"><select className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Horario Manana</option><option>Ciclo 4x2</option></select><div className="flex justify-end"><button type="button" onClick={async () => { await createEmployeeAssignment('emp_42', { type: 'schedule', targetId: 'HOR-01' }); setOpenAssign(false) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Asignar</button></div></div></Modal>
      <Modal open={openNews} title="Cargar novedad" onClose={() => setOpenNews(false)}><div className="space-y-4 px-6 py-5"><input type="date" defaultValue={today} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><select value={newsType} onChange={(e) => setNewsType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Horas extra 50%</option><option>Tardanza</option><option>Ausencia</option></select>{newsType === 'Ausencia' ? <input placeholder="Dias" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /> : <input placeholder={newsType === 'Tardanza' ? 'Minutos' : 'Horas'} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />}<div className="flex justify-end"><button type="button" onClick={async () => { await createEmployeeNews('emp_42', { type: newsType }); setOpenNews(false) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Guardar</button></div></div></Modal>
      <Modal open={openPunch} title="Fichada manual" onClose={() => setOpenPunch(false)}><div className="space-y-4 px-6 py-5"><input type="datetime-local" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><select className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Entrada</option><option>Salida</option></select><div className="flex justify-end"><button type="button" onClick={async () => { await createEmployeeManualPunch('emp_42', { type: 'Entrada' }); setOpenPunch(false) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Registrar</button></div></div></Modal>
    </AppShell>
  )
}
