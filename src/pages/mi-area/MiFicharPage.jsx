import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import PageHeader from '../../components/layout/PageHeader'
import { EmployeePanel } from '../../components/employee/EmployeeUi'
import { isApiMode } from '../../config/env'
import { formatLongDate } from '../../lib/employeePortalUi'
import { routes } from '../../lib/routes'
import { getSession } from '../../lib/session'
import { createMyPunch } from '../../services/meService'

const SUCCESS_RESET_MS = 9000

function formatClock(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatDisplayTime(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function MiFicharPage() {
  const session = getSession()
  const [pendingAction, setPendingAction] = useState(null)
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const [result, setResult] = useState(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    document.title = 'Fichar - Executive Architect'
    const id = window.setInterval(() => setClock(formatClock(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])

  const resetForm = () => {
    setResult(null)
    setCountdown(0)
  }

  useEffect(() => {
    if (!result?.ok) return undefined
    setCountdown(Math.ceil(SUCCESS_RESET_MS / 1000))
    const tick = window.setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : 0))
    }, 1000)
    const reset = window.setTimeout(resetForm, SUCCESS_RESET_MS)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(reset)
    }
  }, [result?.ok])

  const submit = async (tipo) => {
    setPendingAction(tipo)
    setResult(null)
    try {
      const res = await createMyPunch({ tipo })
      const fh = res?.punch?.timestamp
      setResult({
        ok: true,
        tipo,
        name: res?.employee?.name ?? session?.user?.name ?? 'Empleado',
        legajo: res?.employee?.legajo ?? String(session?.user?.legajo ?? '').padStart(4, '0'),
        hora: fh ? formatDisplayTime(fh) : formatDisplayTime(new Date()),
      })
    } catch (err) {
      setResult({ ok: false, message: err?.message || 'No se pudo registrar la fichada.' })
    } finally {
      setPendingAction(null)
    }
  }

  const loading = pendingAction != null

  return (
    <AppShell topbarTitle="FICHAR">
      <PageHeader
        title="Registrar fichada"
        subtitle={`${formatLongDate()} · ${clock}`}
        actions={
          <Link
            to={routes.miFichadas}
            className="rounded-md border border-slate-200/50 bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">history</span>
              Ver historial
            </span>
          </Link>
        }
      />

      {!isApiMode() && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo demo: las fichadas no se guardan en el servidor.
        </div>
      )}

      <div className="mx-auto max-w-xl">
        <EmployeePanel icon="fingerprint" title="ELEGÍ EL TIPO DE FICHADA">
          {result?.ok ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <span className="material-symbols-outlined text-4xl [font-variation-settings:'FILL'_1]">check_circle</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-700">{result.tipo} registrada</p>
              <p className="mt-2 font-headline text-4xl font-black text-green-900">{result.hora}</p>
              <p className="mt-4 text-lg font-semibold text-on-background">{result.name}</p>
              <p className="text-sm text-on-surface-variant">Legajo {result.legajo}</p>
              {countdown > 0 && (
                <p className="mt-5 text-xs text-on-surface-variant">
                  Podés fichar de nuevo en <span className="font-bold text-primary">{countdown}s</span>
                </p>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="primary-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wide text-on-primary shadow-md shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Fichar de nuevo
              </button>
            </div>
          ) : (
            <div className="px-6 py-8">
              {result && !result.ok && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-error/20 bg-error-container/15 p-3">
                  <span className="material-symbols-outlined text-lg text-error [font-variation-settings:'FILL'_1]">cancel</span>
                  <p className="text-xs font-semibold text-error">{result.message}</p>
                </div>
              )}

              <p className="mb-6 text-center text-sm text-on-surface-variant">
                Hola{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}. Elegí si estás entrando o saliendo.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => submit('Entrada')}
                  className="flex flex-col items-center justify-center gap-3 rounded-xl bg-primary py-8 text-on-primary shadow-md shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                  {pendingAction === 'Entrada' ? (
                    <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl">login</span>
                  )}
                  <span className="text-sm font-black uppercase tracking-wider">Entrada</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => submit('Salida')}
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low py-8 text-primary transition-all hover:bg-surface-container-high active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                  {pendingAction === 'Salida' ? (
                    <span className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl">logout</span>
                  )}
                  <span className="text-sm font-black uppercase tracking-wider">Salida</span>
                </button>
              </div>
            </div>
          )}
        </EmployeePanel>
      </div>
    </AppShell>
  )
}
