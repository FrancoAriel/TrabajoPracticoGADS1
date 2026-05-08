import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import StatCard from '../../components/ui/StatCard'
import { routes } from '../../lib/routes'
import { getCurrentClosure } from '../../services/closureService'

const employees = [
  { name: 'Juan Perez', normal: '72h', he50: '6h 15m', he100: '1h 00m', ausencias: '0', estado: 'OK' },
  { name: 'Ana Gomez', normal: '68h', he50: '0', he100: '0', ausencias: '1', estado: 'Pendiente' },
  { name: 'Luis Diaz', normal: '0', he50: '0', he100: '0', ausencias: '2', estado: 'Pendiente' },
]

export default function CierrePage() {
  const [selected, setSelected] = useState(employees[0])
  const [closure, setClosure] = useState(null)

  useEffect(() => {
    document.title = 'Cierre mensual'
    let cancelled = false

    getCurrentClosure().then((data) => {
      if (!cancelled) {
        setClosure(data)
        setSelected(data.employeeBreakdown[0])
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const currentEmployees = closure?.employeeBreakdown || employees
  const stats = closure?.stats || { liquidated: '39', pending: '3', he50: '42h 15m', he100: '8h 00m' }
  const period = closure?.currentPeriod || 'Junio 2025'
  const checklist = closure?.checklist || []

  return (
    <AppShell topbarTitle="CIERRE MENSUAL">
      <PageHeader title="Cierre mensual" subtitle={`Periodo abierto: ${period}`} actions={<button type="button" disabled className="rounded-md bg-slate-300 px-4 py-2 text-sm font-semibold text-white">Ejecutar cierre</button>} />
      <div className="mb-6 grid grid-cols-4 gap-4"><StatCard label="Empleados liquidados" value={String(stats.liquidated)} icon="payments" /><StatCard label="Pendientes" value={String(stats.pending)} icon="pending_actions" valueClassName="text-tertiary" /><StatCard label="HE 50%" value={String(stats.he50)} icon="schedule" valueClassName="text-primary" /><StatCard label="HE 100%" value={String(stats.he100)} icon="more_time" valueClassName="text-primary" /></div>
      <div className="mb-6 grid grid-cols-3 gap-4"><div className="rounded-xl border border-slate-200/50 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mayo 2025</p><p className="mt-2 text-lg font-bold">Cerrado</p><Link to={routes.exportaciones} className="mt-3 inline-block text-sm font-bold text-primary hover:underline">Exportar</Link></div><div className="rounded-xl border border-slate-200/50 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Junio 2025</p><p className="mt-2 text-lg font-bold">En progreso</p><Link to={routes.novedades} className="mt-3 inline-block text-sm font-bold text-primary hover:underline">Ir a novedades</Link></div><div className="rounded-xl border border-slate-200/50 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Julio 2025</p><p className="mt-2 text-lg font-bold">Futuro</p></div></div>
      <div className="grid grid-cols-12 gap-6">
        <SectionCard title="DESGLOSE POR EMPLEADO" icon="table_chart" className="col-span-12 lg:col-span-7" bodyClassName="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low">{['Empleado', 'Hs normales', 'HE 50', 'HE 100', 'Ausencias', 'Estado'].map((h) => <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{currentEmployees.map((employee) => <tr key={employee.name} onClick={() => setSelected(employee)} className={`cursor-pointer hover:bg-slate-50 ${selected?.name === employee.name ? 'bg-primary/5' : ''}`}><td className="px-5 py-3.5 text-sm font-bold">{employee.name}</td><td className="px-5 py-3.5 text-sm">{employee.normal === '0' ? '—' : employee.normal}</td><td className="px-5 py-3.5 text-sm">{employee.he50 === '0' ? '—' : employee.he50}</td><td className="px-5 py-3.5 text-sm">{employee.he100 === '0' ? '—' : employee.he100}</td><td className="px-5 py-3.5 text-sm">{employee.ausencias}</td><td className="px-5 py-3.5 text-sm font-semibold">{employee.estado}</td></tr>)}</tbody></table></SectionCard>
        <SectionCard title="DETALLE INDIVIDUAL" icon="person" className="col-span-12 lg:col-span-5" bodyClassName="p-5"><div className="space-y-3"><h3 className="font-headline text-xl font-bold">{selected?.name}</h3><div className="flex items-center justify-between"><span className="text-sm text-on-surface-variant">Hs normales</span><span className="text-sm font-bold">{selected?.normal === '0' ? '—' : selected?.normal}</span></div><div className="flex items-center justify-between"><span className="text-sm text-on-surface-variant">HE 50%</span><span className="text-sm font-bold">{selected?.he50 === '0' ? '—' : selected?.he50}</span></div><div className="flex items-center justify-between"><span className="text-sm text-on-surface-variant">HE 100%</span><span className="text-sm font-bold">{selected?.he100 === '0' ? '—' : selected?.he100}</span></div><div className="flex items-center justify-between"><span className="text-sm text-on-surface-variant">Ausencias</span><span className="text-sm font-bold">{selected?.ausencias}</span></div><div className="rounded-xl bg-surface-container-low p-4 text-sm">{selected?.estado === 'OK' ? 'OK - Sin novedades pendientes' : 'Tiene novedades pendientes'}</div><Link to={routes.novedades} className="inline-block text-sm font-bold text-primary hover:underline">Ver novedades del empleado</Link></div></SectionCard>
      </div>
      <SectionCard title="CHECKLIST DE CIERRE" icon="checklist" className="mt-6" bodyClassName="p-5"><div className="grid grid-cols-1 gap-3 md:grid-cols-2">{checklist.map((item, index) => <div key={item} className="rounded-xl bg-surface-container-low p-4 text-sm">{index + 1}. {item}</div>)}</div></SectionCard>
    </AppShell>
  )
}
