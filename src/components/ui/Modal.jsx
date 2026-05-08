export default function Modal({ open, title, children, onClose, size = 'max-w-2xl' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className={`w-full ${size} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="font-headline text-lg font-bold text-on-background">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-500 transition-colors hover:text-slate-900">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
