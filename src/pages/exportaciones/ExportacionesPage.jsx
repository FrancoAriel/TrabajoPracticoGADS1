import { useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { createExport, getExportOptions, resolveDownloadUrl } from '../../services/exportService'

const FORMAT_BADGE = {
  CSV: 'bg-blue-100 text-blue-700',
}

const reportCards = [
  {
    key: 'punches',
    icon: 'fingerprint', iconBg: 'bg-primary-container', iconColor: 'text-primary',
    title: 'Reporte de Fichadas', sub: 'Listado completo por período',
    selects: [
      { label: 'Período', opts: ['Junio 2025', 'Mayo 2025', 'Abril 2025'] },
      { label: 'Formato', field: 'format', opts: ['CSV'] },
    ],
    btnClass: 'bg-primary hover:bg-primary/90',
  },
  {
    key: 'news',
    icon: 'notification_important', iconBg: 'bg-tertiary-container', iconColor: 'text-tertiary',
    title: 'Reporte de Novedades', sub: 'Por empleado o período',
    selects: [
      { label: 'Período', opts: ['Junio 2025', 'Mayo 2025', 'Abril 2025'] },
      { label: 'Formato', field: 'format', opts: ['CSV'] },
    ],
    btnClass: 'bg-tertiary hover:bg-tertiary/90',
  },
  {
    key: 'closure',
    icon: 'payments', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container',
    title: 'Liquidación Mensual', sub: 'Para sistema de liquidación',
    selects: [
      { label: 'Período cerrado', opts: ['Mayo 2025 (cerrado)', 'Abril 2025 (cerrado)', 'Marzo 2025 (cerrado)'] },
      { label: 'Formato', field: 'format', opts: ['CSV'] },
    ],
    btnClass: 'bg-on-background hover:opacity-90',
  },
  {
    key: 'overtime',
    icon: 'more_time', iconBg: 'bg-error-container/20', iconColor: 'text-error',
    title: 'Horas Extra', sub: 'Detalle de HE 50% y 100%',
    selects: [
      { label: 'Período', opts: ['Junio 2025', 'Mayo 2025', 'Abril 2025'] },
      { label: 'Tipo', opts: ['Todas', 'HE 50%', 'HE 100%'] },
    ],
    btnClass: 'bg-error hover:opacity-90',
  },
  {
    key: 'employees',
    icon: 'groups', iconBg: 'bg-primary-container', iconColor: 'text-primary',
    title: 'Nómina de Empleados', sub: 'Datos maestros del personal',
    selects: [
      { label: 'Sector', opts: ['Todos', 'Administrativo', 'Planta', 'Soporte'] },
      { label: 'Formato', field: 'format', opts: ['CSV'] },
    ],
    btnClass: 'bg-primary hover:bg-primary/90',
  },
  {
    key: 'assignments',
    icon: 'calendar_today', iconBg: 'bg-surface-container-highest', iconColor: 'text-on-surface-variant',
    title: 'Horarios Asignados', sub: 'Asignaciones vigentes',
    selects: [
      { label: 'Tipo', opts: ['Todos', 'Horario fijo', 'Ciclo rotativo'] },
      { label: 'Formato', field: 'format', opts: ['CSV'] },
    ],
    btnClass: 'bg-on-secondary-container hover:opacity-90',
  },
]

const history = [
  { report: 'Reporte de Fichadas', period: 'Mayo 2025', format: 'CSV', date: '05/06/2025 14:22', user: 'Administrator' },
  { report: 'Liquidación Mensual', period: 'Mayo 2025', format: 'CSV', date: '05/06/2025 14:18', user: 'Administrator' },
  { report: 'Horas Extra', period: 'Mayo 2025', format: 'CSV', date: '04/06/2025 09:05', user: 'Supervisor RRHH' },
  { report: 'Nómina de Empleados', period: '—', format: 'CSV', date: '01/06/2025 11:40', user: 'Administrator' },
  { report: 'Reporte de Novedades', period: 'Abril 2025', format: 'CSV', date: '07/05/2025 16:10', user: 'Supervisor RRHH' },
]

export default function ExportacionesPage() {
  const [toast, setToast] = useState('')
  const [exportData, setExportData] = useState(null)
  const [selections, setSelections] = useState({})
  const [loadingKey, setLoadingKey] = useState('')

  useEffect(() => { document.title = 'Exportaciones - Executive Architect' }, [])

  useEffect(() => {
    getExportOptions()
      .then((data) => {
        setExportData(data)
        const initial = {}
        for (const report of data?.reports ?? []) {
          initial[report.key] = {
            period: report.periodOptions?.[0] ?? 'Junio 2025',
            format: 'CSV',
          }
        }
        setSelections(initial)
      })
      .catch(() => {
        setExportData(null)
      })
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const cards = reportCards.map((card) => {
    const apiReport = exportData?.reports?.find((r) => r.key === card.key)
    if (!apiReport) return card
    return {
      ...card,
      title: apiReport.label,
      selects: [
        { label: 'Período', field: 'period', opts: apiReport.periodOptions?.length ? apiReport.periodOptions : ['Junio 2025'] },
        { label: 'Formato', field: 'format', opts: apiReport.formatOptions?.length ? apiReport.formatOptions : ['CSV'] },
      ],
    }
  })

  function updateSelection(key, field, value) {
    setSelections((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [field]: value },
    }))
  }

  async function handleExport(card) {
    setLoadingKey(card.key)
    try {
      const selected = selections[card.key] ?? {}
      const result = await createExport({
        reportKey: card.key,
        period: selected.period ?? card.selects?.[0]?.opts?.[0] ?? 'Junio 2025',
        format: selected.format ?? 'CSV',
      })
      const url = resolveDownloadUrl(result.downloadUrl)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = ''
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      showToast(`Exportación generada: ${card.title}`)
      getExportOptions().then(setExportData).catch(() => {})
    } catch (e) {
      showToast(`Error al exportar: ${e.message}`)
    } finally {
      setLoadingKey('')
    }
  }

  return (
    <AppShell topbarTitle="EXPORTACIONES">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-background">Exportaciones</h2>
          <p className="mt-1 text-sm text-on-surface-variant">Generación y descarga de reportes e informes del sistema.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reportes disponibles</p><p className="font-headline text-2xl font-black text-primary">6</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Exportaciones este mes</p><p className="font-headline text-2xl font-black text-on-secondary-container">{exportData?.history?.length ?? 14}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Última exportación</p><p className="font-headline text-2xl font-black text-tertiary">{exportData?.history?.[0] ? 'Hoy' : '—'}</p></div>
        <div className="rounded-lg bg-surface-container-highest p-5"><p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Períodos cerrados</p><p className="font-headline text-2xl font-black text-on-background">2</p></div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="flex flex-col rounded-xl border border-slate-200/50 bg-surface-container-lowest p-6 transition-all hover:shadow-md">
            <div className="mb-5 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                <span className={`material-symbols-outlined text-xl ${card.iconColor}`}>{card.icon}</span>
              </div>
              <div>
                <h3 className="font-headline text-sm font-bold">{card.title}</h3>
                <p className="text-xs text-on-surface-variant">{card.sub}</p>
              </div>
            </div>
            <div className="mb-5 flex-1 space-y-3">
              {card.selects.map((sel) => (
                <div key={sel.label}>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{sel.label}</label>
                  <select
                    value={selections[card.key]?.[sel.field] ?? sel.opts[0]}
                    onChange={(e) => updateSelection(card.key, sel.field, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {sel.opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleExport(card)}
              disabled={loadingKey === card.key}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all ${card.btnClass}`}
            >
              <span className={`material-symbols-outlined text-sm ${loadingKey === card.key ? 'animate-spin' : ''}`}>{loadingKey === card.key ? 'progress_activity' : 'download'}</span> Exportar
            </button>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest">
        <div className="border-b border-slate-100 p-5">
          <h3 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
            <span className="material-symbols-outlined text-sm">history</span> HISTORIAL DE EXPORTACIONES
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {['Reporte', 'Período', 'Formato', 'Fecha', 'Usuario', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(exportData?.history?.length ? exportData.history : history).map((item) => (
                <tr key={item.id ?? item.exportId ?? `${item.report}-${item.period}-${item.date}`} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                      <span className="text-sm font-semibold">{item.report ?? item.reportKey}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-on-surface-variant">{item.period}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${FORMAT_BADGE[item.format]}`}>{item.format}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-on-surface-variant">{item.date ?? item.createdAt}</td>
                  <td className="px-5 py-3.5 text-sm text-on-surface-variant">{item.user}</td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.downloadUrl) window.open(resolveDownloadUrl(item.downloadUrl), '_blank')
                        else showToast('Descargando exportación...')
                      }}
                      className="rounded border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/5"
                    >
                      Redownload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          <span className="material-symbols-outlined text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
          {toast}
        </div>
      )}
    </AppShell>
  )
}
