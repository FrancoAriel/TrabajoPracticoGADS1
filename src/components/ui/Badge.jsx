export default function Badge({ children, className = '' }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${className}`}>{children}</span>
}
