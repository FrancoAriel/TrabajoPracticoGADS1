import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isApiMode } from '../../config/env'
import { routes } from '../../lib/routes'
import { createTerminalPunch } from '../../services/punchService'

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

export default function FicharPage() {
  const api = isApiMode()
  const [legajo, setLegajo] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [clock, setClock] = useState(() => formatClock(new Date()))
  const [result, setResult] = useState(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    document.title = 'Fichar asistencia - Executive Architect'
    const id = window.setInterval(() => setClock(formatClock(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])

  const resetForm = () => {
    setResult(null)
    setLegajo('')
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
    const legajoTrim = legajo.trim()
    if (!legajoTrim) {
      setResult({ ok: false, message: 'Ingresá tu legajo.' })
      return
    }

    setPendingAction(tipo)
    setResult(null)
    try {
      const res = await createTerminalPunch({
        legajo: Number(legajoTrim.replace(/\D/g, '')),
        tipo,
      })
      const emp = res?.empleado
      const fh = res?.fichada?.fecha_hora
      const name = emp ? `${emp.nombre} ${emp.apellido}`.trim() : 'Empleado'
      setResult({
        ok: true,
        tipo,
        name,
        legajo: emp?.legajo ?? legajoTrim.padStart(4, '0'),
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
    <div className="flex min-h-screen items-center justify-center bg-surface-container-low px-4 py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/5" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-3xl">fingerprint</span>
          </div>
          <h1 className="font-headline text-2xl font-black tracking-tight text-on-background">Fichar asistencia</h1>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">Terminal de empleados</p>
          <p className="mt-3 font-mono text-lg font-bold tabular-nums text-primary">{clock}</p>
        </div>

        {!api && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Modo demo: las fichadas no se guardan. Activá <code className="font-mono text-xs">VITE_DATA_SOURCE=api</code> para usar la terminal real.
          </div>
        )}

        <div className="rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-8 shadow-sm">
          {result?.ok ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <span className="material-symbols-outlined text-4xl [font-variation-settings:'FILL'_1]">check_circle</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-700">{result.tipo} registrada</p>
              <p className="mt-2 font-headline text-4xl font-black text-green-900">{result.hora}</p>
              <p className="mt-4 text-lg font-semibold text-on-background">{result.name}</p>
              <p className="text-sm text-on-surface-variant">Legajo {result.legajo}</p>
              {countdown > 0 && (
                <p className="mt-5 text-xs text-on-surface-variant">
                  Volviendo al inicio en <span className="font-bold text-primary">{countdown}s</span>
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
            <>
              {result && !result.ok && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-error/20 bg-error-container/15 p-3">
                  <span className="material-symbols-outlined text-lg text-error [font-variation-settings:'FILL'_1]">cancel</span>
                  <p className="text-xs font-semibold text-error">{result.message}</p>
                </div>
              )}

              <p className="mb-6 text-xs text-on-surface-variant">Ingresá tu legajo y elegí el tipo de fichada.</p>

              <div className="mb-6">
                <label htmlFor="fichar-legajo" className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Legajo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                    <span className="material-symbols-outlined text-lg">badge</span>
                  </span>
                  <input
                    id="fichar-legajo"
                    inputMode="numeric"
                    autoComplete="off"
                    autoFocus
                    value={legajo}
                    onChange={(e) => setLegajo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="0042"
                    disabled={loading}
                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low py-3 pl-10 pr-4 text-center font-mono text-2xl font-bold tracking-widest transition-all placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => submit('Entrada')}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-primary py-5 text-on-primary shadow-md shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                  {pendingAction === 'Entrada' ? (
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl">login</span>
                  )}
                  <span className="text-xs font-black uppercase tracking-wider">Entrada</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => submit('Salida')}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/40 bg-surface-container-low py-5 text-primary transition-all hover:bg-surface-container-high active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
                >
                  {pendingAction === 'Salida' ? (
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl">logout</span>
                  )}
                  <span className="text-xs font-black uppercase tracking-wider">Salida</span>
                </button>
              </div>
            </>
          )}
        </div>

        <Link
          to={routes.login}
          className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver al inicio de sesión
        </Link>

        <p className="mt-4 text-center text-[11px] text-on-surface-variant">© 2025 Executive Architect · Labor Management</p>
      </div>
    </div>
  )
}
