import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'

const initialErrors = {
  username: false,
  password: false,
  login: false,
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState(initialErrors)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    document.title = 'Iniciar sesion - Executive Architect'
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = {
      username: username.trim() === '',
      password: password === '',
      login: false,
    }

    setErrors(nextErrors)

    if (nextErrors.username || nextErrors.password) {
      return
    }

    setIsSubmitting(true)

    window.setTimeout(async () => {
      try {
        await login(username.trim(), password)
        setIsSuccess(true)

        window.setTimeout(() => {
          navigate('/')
        }, 400)
      } catch {
        setErrors({ ...initialErrors, login: true })
        setIsSubmitting(false)
      }
    }, 800)
  }

  const buttonText = isSubmitting ? (isSuccess ? 'Acceso concedido' : 'Verificando...') : 'Ingresar al sistema'
  const buttonIcon = isSuccess ? 'check_circle' : 'arrow_forward'

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-container-low">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/5" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-3xl">architecture</span>
          </div>
          <h1 className="font-headline text-2xl font-black tracking-tight text-on-background">Executive Architect</h1>
          <p className="mt-1 text-sm font-medium text-on-surface-variant">Labor Management System</p>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-surface-container-lowest p-8 shadow-sm">
          <h2 className="font-headline mb-1 text-lg font-bold text-on-background">Iniciar sesion</h2>
          <p className="mb-6 text-xs text-on-surface-variant">Ingresa tus credenciales para continuar.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Usuario o legajo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span className="material-symbols-outlined text-lg">person</span>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low py-3 pl-10 pr-4 text-sm font-medium transition-all placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {errors.username ? (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-error">
                  <span className="material-symbols-outlined text-sm">error</span>
                  Ingresa tu usuario.
                </p>
              ) : null}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Contrasena
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low py-3 pl-10 pr-12 text-sm font-medium transition-all placeholder:text-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline transition-colors hover:text-on-surface"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-error">
                  <span className="material-symbols-outlined text-sm">error</span>
                  Ingresa tu contrasena.
                </p>
              ) : null}
            </div>

            {errors.login ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-error/20 bg-error-container/15 p-3">
                <span className="material-symbols-outlined text-lg text-error [font-variation-settings:'FILL'_1]">cancel</span>
                <p className="text-xs font-semibold text-error">Usuario o contrasena incorrectos. Intenta de nuevo.</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold tracking-wide text-on-primary shadow-md shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-default"
            >
              <span>{buttonText}</span>
              {isSubmitting && !isSuccess ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <span className="material-symbols-outlined text-lg">{buttonIcon}</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-on-surface-variant">
            Credenciales de demo: <span className="font-bold text-on-background">admin</span> /{' '}
            <span className="font-bold text-on-background">admin</span>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-on-surface-variant">© 2025 Executive Architect · Labor Management</p>
      </div>
    </div>
  )
}
