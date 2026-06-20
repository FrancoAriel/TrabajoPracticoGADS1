export default function Modal({ open, title, subtitle, children, onClose, size = 'max-w-2xl' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full ${size} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-surface-container-lowest shadow-2xl`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h3 className="font-headline text-lg font-extrabold text-on-background">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 transition-colors hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
