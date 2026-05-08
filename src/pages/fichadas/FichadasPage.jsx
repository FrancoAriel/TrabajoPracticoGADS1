import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/ui/SectionCard'
import StatCard from '../../components/ui/StatCard'
import { routes } from '../../lib/routes'
import { createManualPunch, createPunchCorrection, listPunches } from '../../services/punchService'

const baseItems = [
  { legajo: '0042', empleado: 'Juan Perez', fecha: '12/06/2025 09:15', tipo: 'Entrada', origen: 'Biometrica', correccion: 'Si', estado: 'Tardanza' },
  { legajo: '0018', empleado: 'Ana Gomez', fecha: '12/06/2025 08:45', tipo: 'Entrada', origen: 'Biometrica', correccion: '-', estado: 'Doble' },
  { legajo: '0050', empleado: 'Carla Ruiz', fecha: '12/06/2025 08:58', tipo: 'Entrada', origen: 'App movil', correccion: '-', estado: 'Normal' },
  { legajo: '0027', empleado: 'Martin Sosa', fecha: '12/06/2025 08:40', tipo: 'Salida', origen: 'Biometrica', correccion: '-', estado: 'Anticipada' },
  { legajo: '0031', empleado: 'Luis Diaz', fecha: '12/06/2025 00:00', tipo: 'Ausencia', origen: 'Automatica', correccion: '-', estado: 'Ausente' },
]

export default function FichadasPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [origin, setOrigin] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [openManual, setOpenManual] = useState(false)
  const [openCorrection, setOpenCorrection] = useState(false)
  const [clock, setClock] = useState('')
  const [stats, setStats] = useState({ normal: '34', late: '7', double: '2', absence: '3' })
  const [allItems, setAllItems] = useState(baseItems)

  useEffect(() => {
    document.title = 'Gestion de Fichadas'
    const update = () => setClock(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    update()
    const id = window.setInterval(update, 1000)
    let cancelled = false

    listPunches().then((data) => {
      if (!cancelled) {
        setStats(data.stats)
        setAllItems(data.items)
      }
    })

    return () => window.clearInterval(id)
  }, [])

  const items = useMemo(() => allItems.filter((item) => {
    const matchSearch = `${item.legajo} ${item.empleado}`.toLowerCase().includes(search.toLowerCase())
    const matchType = !type || item.tipo === type
    const matchOrigin = !origin || item.origen === origin
    const matchStatus = !status || item.estado === status
    return matchSearch && matchType && matchOrigin && matchStatus
  }), [allItems, search, type, origin, status])

  return (
    <AppShell topbarTitle="FICHADAS">
      <PageHeader title="Gestion de Fichadas" subtitle={`Reloj en vivo: ${clock}`} actions={<><button type="button" onClick={() => setOpenCorrection(true)} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Reprocesar</button><button type="button" onClick={() => setOpenManual(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">Nueva fichada manual</button></>} />
      <div className="mb-6 grid grid-cols-4 gap-4"><StatCard label="Normales" value={String(stats.normal)} icon="check_circle" /><StatCard label="Tardanzas" value={String(stats.late)} icon="warning" valueClassName="text-tertiary" /><StatCard label="Dobles" value={String(stats.double)} icon="sync_problem" valueClassName="text-primary" /><StatCard label="Ausencias" value={String(stats.absence)} icon="person_off" valueClassName="text-error" /></div>
      <SectionCard title="FICHADAS DEL DIA" icon="fingerprint" action={<span className="text-[10px] font-bold uppercase tracking-widest text-green-600">En vivo</span>} bodyClassName="p-5">
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-5"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar legajo o empleado" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option value="">Tipo</option><option>Entrada</option><option>Salida</option><option>Ausencia</option></select><select value={origin} onChange={(e) => setOrigin(e.target.value)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option value="">Origen</option><option>Biometrica</option><option>App movil</option><option>Automatica</option></select><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option value="">Estado</option><option>Normal</option><option>Tardanza</option><option>Doble</option><option>Anticipada</option><option>Ausente</option></select><input type="date" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /></div>
        <div className="overflow-x-auto rounded-xl border border-slate-100"><table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low">{['Legajo', 'Empleado', 'Fecha/Hora', 'Tipo', 'Origen', 'Correccion', 'Estado', ''].map((h) => <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.length ? items.map((item) => <tr key={`${item.legajo}-${item.fecha}`} className="hover:bg-slate-50"><td className="px-5 py-3.5 text-sm font-medium">{item.legajo}</td><td className="px-5 py-3.5 text-sm font-bold">{item.empleado}</td><td className="px-5 py-3.5 text-sm">{item.fecha}</td><td className="px-5 py-3.5 text-sm">{item.tipo}</td><td className="px-5 py-3.5 text-sm">{item.origen}</td><td className="px-5 py-3.5 text-sm">{item.correccion}</td><td className="px-5 py-3.5"><Badge className="bg-slate-100 text-slate-700">{item.estado}</Badge></td><td className="px-5 py-3.5"><button type="button" onClick={() => setSelected(item)} className="rounded border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">Ver</button></td></tr>) : <tr><td colSpan="8" className="px-5 py-8 text-center text-sm text-on-surface-variant">Sin resultados.</td></tr>}</tbody></table></div>
        <div className="mt-4 flex justify-end"><Link to={routes.exportaciones} className="text-sm font-bold text-primary hover:underline">Exportar</Link></div>
      </SectionCard>
      <Modal open={!!selected} title="Detalle de fichada" onClose={() => setSelected(null)}><div className="space-y-5 px-6 py-5">{selected ? <><div className="grid grid-cols-2 gap-4"><div className="rounded-xl bg-surface-container-low p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Interpretacion</p><p className="mt-2 text-sm font-semibold">{selected.tipo === 'Entrada' ? 'Tardanza detectada sobre horario teorico.' : 'Salida con calculo de jornada efectiva.'}</p></div><div className="rounded-xl bg-surface-container-low p-4"><p className="text-xs font-bold uppercase text-on-surface-variant">Horario teorico</p><p className="mt-2 text-sm font-semibold">08:00 a 17:00</p></div></div>{selected.correccion !== '-' ? <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">Trazabilidad: existe una correccion registrada sobre esta fichada.</div> : null}<div className="flex justify-between"><Link to={routes.empleadoJuanPerez} className="text-sm font-bold text-primary hover:underline">Ver empleado</Link><button type="button" onClick={() => setSelected(null)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Cerrar</button></div></> : null}</div></Modal>
      <Modal open={openManual} title="Nueva fichada manual" onClose={() => setOpenManual(false)}><div className="space-y-4 px-6 py-5"><input placeholder="Legajo" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><input type="datetime-local" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><select className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Entrada</option><option>Salida</option></select><div className="flex justify-end"><button type="button" onClick={async () => { await createManualPunch({ type: 'Entrada' }); setOpenManual(false) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Guardar</button></div></div></Modal>
      <Modal open={openCorrection} title="Registrar correccion" onClose={() => setOpenCorrection(false)}><div className="space-y-4 px-6 py-5"><textarea placeholder="Motivo de correccion" className="min-h-28 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><div className="flex justify-end"><button type="button" onClick={async () => { await createPunchCorrection(selected?.id || 'pun_1', { reason: 'Correccion manual' }); setOpenCorrection(false) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Registrar</button></div></div></Modal>
    </AppShell>
  )
}
