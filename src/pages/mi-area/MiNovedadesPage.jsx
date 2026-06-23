import { useCallback, useEffect, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import Modal from '../../components/ui/Modal'
import {
  EmployeeFilterBar,
  EmployeeFilterSelect,
  EmployeeLoadingState,
  EmployeeMetricCard,
  EmployeePanel,
  EmployeeStatusPill,
  EmployeeTypeBadge,
} from '../../components/employee/EmployeeUi'
import { isApiMode } from '../../config/env'
import { formatDate, formatQty } from '../../lib/employeePortalUi'
import { createMyNewsRequest, getMyNews } from '../../services/meService'

const TYPE_OPTIONS = [
  { value: 'Licencia', label: 'Licencia' },
  { value: 'Vacaciones', label: 'Vacaciones' },
  { value: 'Permiso_especial', label: 'Permiso especial' },
  { value: 'Justificacion', label: 'Justificación de ausencia' },
]

const STATUS_FILTER_TO_API = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

export default function MiNovedadesPage() {
  const api = isApiMode()
  const [rows, setRows] = useState([])
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, totalItems: 0, totalPages: 1 })
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(api)
  const [error, setError] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    tipo: 'Licencia',
    fechaDesde: new Date().toISOString().slice(0, 10),
    fechaHasta: '',
    cantidad: '1',
    observacion: '',
  })

  const showToast = (msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3500)
  }

  const refresh = useCallback(async () => {
    if (!api) return
    setLoading(true)
    setError('')
    try {
      const data = await getMyNews({
        page,
        pageSize: 20,
        type: filterType || undefined,
        status: filterStatus ? STATUS_FILTER_TO_API[filterStatus] : undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      })
      setRows(data.items ?? [])
      setStats(data.stats ?? {})
      setMeta(data.meta ?? { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 })
    } catch (e) {
      setError(e.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [api, filterDateFrom, filterDateTo, filterStatus, filterType, page])

  useEffect(() => {
    document.title = 'Mis novedades - Executive Architect'
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filterType, filterStatus, filterDateFrom, filterDateTo])

  useEffect(() => {
    refresh()
  }, [refresh])

  const clearFilters = () => {
    setFilterType('')
    setFilterStatus('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  const hasFilters = filterType || filterStatus || filterDateFrom || filterDateTo

  const submitRequest = async (e) => {
    e.preventDefault()
    if (!form.tipo || !form.fechaDesde) {
      showToast('Completá tipo y fecha desde.')
      return
    }
    setCreateLoading(true)
    try {
      await createMyNewsRequest({
        tipo: form.tipo,
        fechaDesde: form.fechaDesde,
        fechaHasta: form.fechaHasta || form.fechaDesde,
        cantidad: Number(form.cantidad) || 1,
        observacion: form.observacion.trim() || null,
      })
      setOpenCreate(false)
      setForm((f) => ({ ...f, observacion: '', fechaHasta: '' }))
      await refresh()
      showToast('Solicitud enviada. Quedó pendiente de aprobación.')
    } catch (err) {
      showToast(err?.message || 'No se pudo enviar la solicitud.')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <AppShell topbarTitle="MIS NOVEDADES">
      <PageHeader
        title="Mis novedades"
        subtitle="Consultá el estado de tus solicitudes y pedí licencias o permisos."
        actions={
          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Nueva solicitud
            </span>
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <EmployeeMetricCard label="Pendientes" value={stats.pending ?? 0} icon="pending_actions" valueClassName="text-tertiary" />
        <EmployeeMetricCard label="Aprobadas" value={stats.approved ?? 0} icon="check_circle" valueClassName="text-green-700" />
        <EmployeeMetricCard label="Rechazadas" value={stats.rejected ?? 0} icon="cancel" valueClassName="text-error" />
      </div>

      {loading && <EmployeeLoadingState message="Cargando novedades..." />}

      {error && !loading && (
        <div className="rounded-xl border border-error/20 bg-error-container/15 px-4 py-3 text-sm text-error">{error}</div>
      )}

      {!loading && !error && (
        <EmployeePanel icon="notification_important" title="">
          <EmployeeFilterBar
            title="MIS SOLICITUDES"
            icon="playlist_add_check"
            onClear={hasFilters ? clearFilters : null}
          >
            <EmployeeFilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="Licencia">Licencia</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Permiso_especial">Permiso especial</option>
              <option value="Justificacion">Justificación</option>
            </EmployeeFilterSelect>
            <EmployeeFilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </EmployeeFilterSelect>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              title="Desde"
              className="rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-3 text-xs font-medium text-on-surface-variant"
            />
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              title="Hasta"
              className="rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-3 text-xs font-medium text-on-surface-variant"
            />
          </EmployeeFilterBar>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Desde</th>
                  <th className="px-5 py-3">Hasta</th>
                  <th className="px-5 py-3">Cantidad</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/25">assignment</span>
                        <p className="text-sm text-on-surface-variant">
                          {hasFilters ? 'No hay novedades con esos filtros.' : 'No tenés novedades registradas.'}
                        </p>
                        {!hasFilters && (
                          <button type="button" onClick={() => setOpenCreate(true)} className="text-xs font-bold text-primary hover:underline">
                            Crear primera solicitud
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="align-top transition-colors hover:bg-surface-container-low/50">
                      <td className="px-5 py-3.5">
                        <EmployeeTypeBadge type={row.type} />
                      </td>
                      <td className="px-5 py-3.5 font-medium text-on-background">{formatDate(row.date)}</td>
                      <td className="px-5 py-3.5 font-medium text-on-background">{formatDate(row.dateTo)}</td>
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-on-surface-variant">
                        {formatQty(row.quantity, row.unit)}
                      </td>
                      <td className="px-5 py-3.5">
                        <EmployeeStatusPill status={row.status} />
                      </td>
                      <td className="max-w-xs px-5 py-3.5 text-xs leading-relaxed text-on-surface-variant">
                        {row.note ?? <span className="text-on-surface-variant/40">—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-on-surface-variant">
            <span>{meta.totalItems ?? rows.length} novedad{(meta.totalItems ?? rows.length) !== 1 ? 'es' : ''}{hasFilters ? ' (filtradas)' : ''}</span>
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-slate-200/60 px-3 py-1.5 font-bold transition-colors hover:bg-surface-container-low disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="font-bold">{page} / {meta.totalPages}</span>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-slate-200/60 px-3 py-1.5 font-bold transition-colors hover:bg-surface-container-low disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </EmployeePanel>
      )}

      <Modal open={openCreate} title="Nueva solicitud" subtitle="Se enviará a RRHH con estado Pendiente." onClose={() => setOpenCreate(false)} size="max-w-lg">
        <form className="space-y-5 px-8 py-6" onSubmit={submitRequest}>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Tipo *</label>
            <select
              required
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Desde *</label>
              <input required type="date" value={form.fechaDesde} onChange={(e) => setForm((f) => ({ ...f, fechaDesde: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Hasta</label>
              <input type="date" value={form.fechaHasta} onChange={(e) => setForm((f) => ({ ...f, fechaHasta: e.target.value }))} className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Cantidad (días) *</label>
            <input required type="number" min="1" max="365" value={form.cantidad} onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))} className="w-32 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Motivo / observación</label>
            <textarea
              rows={3}
              value={form.observacion}
              onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
              placeholder="Ej: certificado médico, trámite personal..."
              className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-3 border-t border-slate-100 pt-2">
            <button type="button" onClick={() => setOpenCreate(false)} disabled={createLoading} className="flex-1 rounded-lg border border-outline-variant/40 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={createLoading} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary-dim disabled:opacity-50">
              {createLoading ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">send</span>}
              Enviar solicitud
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-xl bg-on-background px-4 py-3 text-sm font-semibold text-on-primary shadow-lg">{toast}</div>
      )}
    </AppShell>
  )
}
