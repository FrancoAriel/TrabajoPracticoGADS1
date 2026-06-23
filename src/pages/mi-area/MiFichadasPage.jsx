import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import {
  EmployeeFilterBar,
  EmployeeFilterSelect,
  EmployeeLoadingState,
  EmployeeMetricCard,
  EmployeePanel,
} from '../../components/employee/EmployeeUi'
import { isApiMode } from '../../config/env'
import {
  formatDateTime,
  ORIGIN_FILTERS_UI_TO_DB,
  ORIGIN_ICON,
  ORIGIN_LABEL,
} from '../../lib/employeePortalUi'
import { routes } from '../../lib/routes'
import { getMyPunches } from '../../services/meService'

function punchRowAccent(type) {
  return String(type).toLowerCase() === 'entrada'
    ? 'text-green-700 dark:text-green-400'
    : 'text-primary'
}

function formatHeaderDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, da] = dateStr.split('-').map(Number)
  if (!y || !m || !da) return dateStr
  return `${String(da).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

export default function MiFichadasPage() {
  const api = isApiMode()
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterOrigin, setFilterOrigin] = useState('')
  const [filterCorrection, setFilterCorrection] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ page: 1, pageSize: 15, totalItems: 0, totalPages: 1 })
  const [loading, setLoading] = useState(api)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!api) return
    setLoading(true)
    setError('')
    try {
      const { items, meta: m } = await getMyPunches({
        page,
        pageSize: 15,
        date: filterDate || undefined,
        type: filterType || undefined,
        origin: filterOrigin ? ORIGIN_FILTERS_UI_TO_DB[filterOrigin] : undefined,
        correction: filterCorrection || undefined,
      })
      setRows(items ?? [])
      setMeta(m ?? { page: 1, pageSize: 15, totalItems: 0, totalPages: 1 })
    } catch (e) {
      setError(e.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [api, filterCorrection, filterDate, filterOrigin, filterType, page])

  useEffect(() => {
    document.title = 'Mis fichadas - Executive Architect'
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filterDate, filterType, filterOrigin, filterCorrection])

  useEffect(() => {
    refresh()
  }, [refresh])

  const entradas = useMemo(() => rows.filter((r) => String(r.type).toLowerCase() === 'entrada').length, [rows])
  const salidas = useMemo(() => rows.filter((r) => String(r.type).toLowerCase() === 'salida').length, [rows])

  const clearFilters = () => {
    setFilterDate('')
    setFilterType('')
    setFilterOrigin('')
    setFilterCorrection('')
  }

  const hasFilters = filterDate || filterType || filterOrigin || filterCorrection
  const fechaTitulo = filterDate ? formatHeaderDate(filterDate) : 'TODAS'

  return (
    <AppShell topbarTitle="MIS FICHADAS">
      <PageHeader
        title="Historial de fichadas"
        subtitle="Consultá tus registros de entrada y salida."
        actions={
          <Link
            to={routes.miFichar}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">login</span>
              Fichar ahora
            </span>
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <EmployeeMetricCard label="Total registros" value={meta.totalItems ?? 0} icon="fingerprint" valueClassName="text-primary" />
        <EmployeeMetricCard label="Entradas" value={entradas} icon="login" valueClassName="text-green-700" />
        <EmployeeMetricCard label="Salidas" value={salidas} icon="logout" valueClassName="text-primary" />
      </div>

      {loading && <EmployeeLoadingState message="Cargando fichadas..." />}

      {error && !loading && (
        <div className="rounded-xl border border-error/20 bg-error-container/15 px-4 py-3 text-sm text-error">{error}</div>
      )}

      {!loading && !error && (
        <EmployeePanel icon="fingerprint" title="">
          <EmployeeFilterBar
            title={`FICHADAS — ${fechaTitulo}`}
            icon="fingerprint"
            onClear={hasFilters ? clearFilters : null}
          >
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-md border-none bg-surface-container-low py-1.5 pl-3 pr-3 text-xs font-medium text-on-surface-variant"
            />
            <EmployeeFilterSelect value={filterType} onChange={(e) => setFilterType(e.target.value)} minWidth="min-w-[7rem]">
              <option value="">Todos los tipos</option>
              <option>Entrada</option>
              <option>Salida</option>
            </EmployeeFilterSelect>
            <EmployeeFilterSelect value={filterOrigin} onChange={(e) => setFilterOrigin(e.target.value)}>
              <option value="">Todos los orígenes</option>
              <option>Biométrico</option>
              <option>App móvil</option>
              <option>Manual</option>
              <option>QR</option>
              <option>Terminal</option>
            </EmployeeFilterSelect>
            <EmployeeFilterSelect value={filterCorrection} onChange={(e) => setFilterCorrection(e.target.value)} minWidth="min-w-[9rem]">
              <option value="">Corrección (todas)</option>
              <option value="false">Sin corrección</option>
              <option value="true">Con corrección</option>
            </EmployeeFilterSelect>
          </EmployeeFilterBar>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3">Fecha / hora</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Origen</th>
                  <th className="px-5 py-3">Corrección</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/25">fingerprint</span>
                        <p className="text-sm text-on-surface-variant">
                          {hasFilters ? 'No hay fichadas con esos filtros.' : 'Todavía no tenés fichadas registradas.'}
                        </p>
                        {!hasFilters && (
                          <Link to={routes.miFichar} className="text-xs font-bold text-primary hover:underline">Registrar mi primera fichada</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-surface-container-low/50">
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs font-bold text-on-background">{formatDateTime(row.timestamp)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase ${punchRowAccent(row.type)}`}>
                          <span className="material-symbols-outlined text-sm">
                            {String(row.type).toLowerCase() === 'entrada' ? 'login' : 'logout'}
                          </span>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm text-primary">{ORIGIN_ICON[row.origin] ?? 'fingerprint'}</span>
                          {ORIGIN_LABEL[row.origin] ?? row.origin}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {row.correction ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-container/30 px-2 py-0.5 text-[10px] font-bold uppercase text-tertiary">Sí</span>
                        ) : (
                          <span className="text-on-surface-variant/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-xs text-on-surface-variant">
            <span>{meta.totalItems ?? 0} registro{(meta.totalItems ?? 0) !== 1 ? 's' : ''}{hasFilters ? ' (filtrados)' : ''}</span>
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
    </AppShell>
  )
}
