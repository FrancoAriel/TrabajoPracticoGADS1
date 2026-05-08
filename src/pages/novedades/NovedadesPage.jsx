import { useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/ui/SectionCard'
import StatCard from '../../components/ui/StatCard'
import { approveNews, createNews, listNews, rejectNews } from '../../services/newsService'

const initialItems = [
  { id: 'NOV-101', employee: 'Juan Perez', type: 'Horas extra 50%', date: '12/06/2025', status: 'Pendiente', quantity: '1h 45m', origin: 'Automatica', createdAt: '12/06/2025', createdBy: 'Sistema', note: 'Detectada por salida extendida.' },
  { id: 'NOV-102', employee: 'Ana Gomez', type: 'Justificacion', date: '12/06/2025', status: 'Pendiente', quantity: '1 dia', origin: 'Manual', createdAt: '12/06/2025', createdBy: 'Admin', note: 'Adjunta certificado.' },
  { id: 'NOV-103', employee: 'Luis Diaz', type: 'Ausencia', date: '12/06/2025', status: 'Pendiente', quantity: '1 dia', origin: 'Automatica', createdAt: '12/06/2025', createdBy: 'Sistema', note: 'Sin fichada registrada.' },
]

export default function NovedadesPage() {
  const [items, setItems] = useState(initialItems)
  const [stats, setStats] = useState({ pending: '9', approved: '27', rejected: '2', automatic: '14' })
  const [selectedId, setSelectedId] = useState(initialItems[0].id)
  const [search, setSearch] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [type, setType] = useState('Horas extra 50%')

  useEffect(() => {
    document.title = 'Gestion de Novedades'
    let cancelled = false

    listNews().then((data) => {
      if (!cancelled) {
        setItems(data.items)
        setStats(data.stats)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => items.filter((item) => `${item.id} ${item.employee} ${item.type}`.toLowerCase().includes(search.toLowerCase())), [items, search])
  const selected = filtered.find((item) => item.id === selectedId) || filtered[0] || null

  const updateStatus = async (status) => {
    if (status === 'Aprobada') await approveNews(selected.id)
    if (status === 'Rechazada') await rejectNews(selected.id, 'Motivo del rechazo')
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status } : item))
    if (status === 'Rechazada') setOpenReject(false)
  }

  return (
    <AppShell topbarTitle="NOVEDADES">
      <PageHeader title="Gestion de Novedades" subtitle="Revision, aprobacion y rechazo de novedades." actions={<button type="button" onClick={() => setOpenCreate(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">Nueva novedad</button>} />
      <div className="mb-6 grid grid-cols-4 gap-4"><StatCard label="Pendientes" value={String(stats.pending)} icon="playlist_add_check" valueClassName="text-tertiary" /><StatCard label="Aprobadas" value={String(stats.approved)} icon="check_circle" valueClassName="text-primary" /><StatCard label="Rechazadas" value={String(stats.rejected)} icon="cancel" valueClassName="text-error" /><StatCard label="Automaticas" value={String(stats.automatic)} icon="sync" /></div>
      <div className="grid grid-cols-12 gap-6">
        <SectionCard title="NOVEDADES" icon="notification_important" className="col-span-12 lg:col-span-7" bodyClassName="p-5">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por ID, empleado o tipo" className="mb-4 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />
          <div className="overflow-x-auto rounded-xl border border-slate-100"><table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low">{['ID', 'Empleado', 'Tipo', 'Fecha', 'Estado'].map((h) => <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.length ? filtered.map((item) => <tr key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer hover:bg-slate-50 ${selected?.id === item.id ? 'bg-primary/5' : ''}`}><td className="px-5 py-3.5 text-sm font-bold">{item.id}</td><td className="px-5 py-3.5 text-sm">{item.employee}</td><td className="px-5 py-3.5 text-sm">{item.type}</td><td className="px-5 py-3.5 text-sm">{item.date}</td><td className="px-5 py-3.5"><Badge className={item.status === 'Pendiente' ? 'bg-tertiary/10 text-tertiary' : item.status === 'Aprobada' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}>{item.status}</Badge></td></tr>) : <tr><td colSpan="5" className="px-5 py-8 text-center text-sm text-on-surface-variant">Sin resultados.</td></tr>}</tbody></table></div>
        </SectionCard>
        <SectionCard title="DETALLE" icon="article" className="col-span-12 lg:col-span-5" bodyClassName="p-5">
          {selected ? <div className="space-y-4"><div><p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{selected.id}</p><h3 className="mt-1 font-headline text-xl font-bold">{selected.employee}</h3></div><div className="flex flex-wrap gap-2"><Badge className="bg-slate-100 text-slate-700">{selected.type}</Badge><Badge className={selected.status === 'Pendiente' ? 'bg-tertiary/10 text-tertiary' : selected.status === 'Aprobada' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}>{selected.status}</Badge></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-on-surface-variant">Cantidad</span><span className="font-semibold">{selected.quantity}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">Origen</span><span className="font-semibold">{selected.origin}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">Creacion</span><span className="font-semibold">{selected.createdAt}</span></div><div className="flex justify-between"><span className="text-on-surface-variant">Creado por</span><span className="font-semibold">{selected.createdBy}</span></div></div><div className="rounded-xl bg-surface-container-low p-4 text-sm">{selected.note}</div>{selected.status === 'Pendiente' ? <div className="flex gap-3"><button type="button" onClick={() => updateStatus('Aprobada')} className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Aprobar</button><button type="button" onClick={() => setOpenReject(true)} className="flex-1 rounded-lg border border-error/20 bg-error/5 px-4 py-2.5 text-sm font-semibold text-error">Rechazar</button></div> : null}</div> : <p className="text-sm text-on-surface-variant">Selecciona una novedad.</p>}
        </SectionCard>
      </div>
      <Modal open={openCreate} title="Nueva novedad" onClose={() => setOpenCreate(false)}><div className="space-y-4 px-6 py-5"><input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"><option>Horas extra 50%</option><option>Tardanza</option><option>Justificacion</option><option>Ausencia</option></select><input placeholder={type === 'Ausencia' || type === 'Justificacion' ? 'Dias' : type === 'Tardanza' ? 'Minutos' : 'Horas'} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><div className="flex justify-end"><button type="button" onClick={async () => { await createNews({ type }); setOpenCreate(false) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Guardar</button></div></div></Modal>
      <Modal open={openReject} title="Rechazar novedad" onClose={() => setOpenReject(false)}><div className="space-y-4 px-6 py-5"><textarea placeholder="Motivo del rechazo" className="min-h-28 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" /><div className="flex justify-end"><button type="button" onClick={() => updateStatus('Rechazada')} className="rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white">Confirmar rechazo</button></div></div></Modal>
    </AppShell>
  )
}
