import { useEffect, useRef, useState } from 'react'
import { getSession } from '../../lib/session'

export default function Topbar({ title, children }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const session = getSession()
  const user = session?.user

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="fixed left-64 right-0 top-0 z-40 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-slate-200/50 bg-slate-50/80 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        {title && <h1 className="font-headline text-xl font-bold text-slate-800">{title}</h1>}
        {children}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" ref={ref}>
          <button type="button" onClick={() => setOpen((v) => !v)} className="text-slate-500 transition-all hover:text-blue-900">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {open && (
            <div className="absolute right-0 top-10 z-50 w-72 overflow-hidden rounded-xl border border-slate-200/50 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="font-headline text-xs font-extrabold uppercase tracking-widest text-on-background">Notificaciones</p>
              </div>
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <span className="material-symbols-outlined mb-2 text-3xl text-outline-variant">notifications_none</span>
                <p className="text-sm font-semibold text-on-surface-variant">No hay notificaciones</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 border-l border-slate-200/50 pl-6">
          <div className="text-right">
            <p className="font-headline text-[10px] font-bold leading-none text-slate-900">{(user?.name ?? 'Administrator').toUpperCase()}</p>
            <p className="mt-1 font-headline text-[9px] uppercase tracking-widest text-slate-500">{user?.role ?? 'Super User'}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-headline text-xs font-bold text-on-primary">
            {user?.initials ?? 'AD'}
          </div>
        </div>
      </div>
    </header>
  )
}
