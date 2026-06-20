import { NavLink } from 'react-router-dom'
import { isApiMode } from '../../config/env'
import { primaryNavigation, routes } from '../../lib/routes'
import { clearSession, getSession } from '../../lib/session'

function navClassName({ isActive }) {
  return [
    'flex items-center gap-3 px-3 py-2.5 font-bold tracking-tight text-sm transition-all duration-200 cursor-pointer active:scale-95',
    isActive
      ? 'bg-slate-300 text-blue-900 border-r-4 border-blue-700'
      : 'text-slate-600 hover:bg-slate-200',
  ].join(' ')
}

export default function Sidebar() {
  const role = getSession()?.user?.role
  const navItems = isApiMode() && role === 'Contador'
    ? primaryNavigation.filter((item) => [routes.dashboard, routes.novedades, routes.cierre, routes.exportaciones].includes(item.to))
    : isApiMode() && role === 'Empleado'
    ? primaryNavigation.filter((item) => item.to === routes.dashboard)
    : primaryNavigation

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-100 py-6">
      <div className="mb-8 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary">
            <span className="material-symbols-outlined">architecture</span>
          </div>
          <div>
            <h2 className="font-headline text-lg font-black leading-none text-slate-900">Executive Architect</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant">Labor Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === routes.dashboard} className={navClassName}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200/50 px-4 pt-6">
        <div className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-tight text-slate-600 transition-colors hover:bg-slate-200">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </a>
          <NavLink onClick={clearSession} to={routes.login} className="flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-tight text-slate-600 transition-colors hover:bg-slate-200">
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </NavLink>
        </div>
      </div>
    </aside>
  )
}
