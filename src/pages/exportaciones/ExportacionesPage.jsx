import { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import SectionCard from '../../components/ui/SectionCard'
import StatCard from '../../components/ui/StatCard'
import { createExport, getExportOptions } from '../../services/exportService'

const cards = ['Fichadas', 'Novedades', 'Liquidacion mensual', 'Horas extra', 'Nomina de empleados', 'Horarios asignados']

export default function ExportacionesPage() {
  const [exportsData, setExportsData] = useState(null)

  useEffect(() => {
    document.title = 'Exportaciones'
    let cancelled = false

    getExportOptions().then((data) => {
      if (!cancelled) setExportsData(data)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = exportsData?.stats || { today: '12', csv: '5', pdf: '4', xlsx: '3' }
  const reports = exportsData?.reports || cards.map((label) => ({ key: label, label, periodOptions: ['Junio 2025', 'Mayo 2025'], formatOptions: ['CSV', 'PDF', 'XLSX'] }))
  const history = exportsData?.history || []

  return (
    <AppShell topbarTitle="EXPORTACIONES">
      <PageHeader title="Exportaciones" subtitle="Generacion de reportes y acceso al historial." />
      <div className="mb-6 grid grid-cols-4 gap-4"><StatCard label="Reportes hoy" value={String(stats.today)} icon="download" /><StatCard label="CSV" value={String(stats.csv)} icon="table_view" /><StatCard label="PDF" value={String(stats.pdf)} icon="picture_as_pdf" /><StatCard label="XLSX" value={String(stats.xlsx)} icon="dataset" /></div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map((report) => <div key={report.key} className="rounded-xl border border-slate-200/50 bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reporte</p><h3 className="mt-2 font-headline text-xl font-bold">{report.label}</h3><div className="mt-4 space-y-3"><select className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm">{report.periodOptions.map((option) => <option key={option}>{option}</option>)}</select><select className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm">{report.formatOptions.map((option) => <option key={option}>{option}</option>)}</select><button type="button" onClick={() => createExport({ reportKey: report.key, period: report.periodOptions[0], format: report.formatOptions[0] })} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Exportar</button></div></div>)}</div>
      <SectionCard title="HISTORIAL DE EXPORTACIONES" icon="history" bodyClassName="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="bg-surface-container-low">{['Reporte', 'Periodo', 'Formato', 'Fecha', 'Usuario', 'Accion'].map((h) => <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{history.map((item) => <tr key={item.id}><td className="px-5 py-3.5 text-sm">{item.report}</td><td className="px-5 py-3.5 text-sm">{item.period}</td><td className="px-5 py-3.5 text-sm">{item.format}</td><td className="px-5 py-3.5 text-sm">{item.date}</td><td className="px-5 py-3.5 text-sm">{item.user}</td><td className="px-5 py-3.5"><button type="button" className="text-sm font-bold text-primary hover:underline">Redownload</button></td></tr>)}</tbody></table></SectionCard>
    </AppShell>
  )
}
