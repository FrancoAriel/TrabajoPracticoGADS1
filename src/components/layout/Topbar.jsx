export default function Topbar({ title, children }) {
  return (
    <header className="fixed left-64 right-0 top-0 z-40 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-slate-200/50 bg-slate-50/80 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <h1 className="font-headline text-xl font-bold text-slate-800">{title}</h1>
        {children}
      </div>
      <div className="flex items-center gap-3 border-l border-slate-200/50 pl-6">
        <div className="text-right">
          <p className="font-headline text-[10px] font-bold leading-none text-slate-900">ADMINISTRATOR</p>
          <p className="mt-1 font-headline text-[9px] uppercase tracking-widest text-slate-500">Super User</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-headline text-xs font-bold text-on-primary">
          AD
        </div>
      </div>
    </header>
  )
}
