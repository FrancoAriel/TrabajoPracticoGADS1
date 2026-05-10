export default function StatCard({ label, value, icon, valueClassName = 'text-on-background', className = '' }) {
  return (
    <div className={`group relative overflow-hidden rounded-lg bg-surface-container-highest p-5 ${className}`}>
      <p className="mb-1 font-headline text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
      <h3 className={`font-headline text-2xl font-black ${valueClassName}`}>{value}</h3>
      {icon ? (
        <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-6xl text-black/5 transition-transform group-hover:scale-110">
          {icon}
        </span>
      ) : null}
    </div>
  )
}
