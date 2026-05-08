export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-background">{title}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  )
}
