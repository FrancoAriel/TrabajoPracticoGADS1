export default function SectionCard({ title, icon, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`overflow-hidden rounded-xl border border-slate-200/50 bg-surface-container-lowest ${className}`}>
      {title ? (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-headline text-xs font-extrabold tracking-[0.2em]">
            {icon ? <span className="material-symbols-outlined text-sm">{icon}</span> : null}
            {title}
          </h2>
          {action}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
