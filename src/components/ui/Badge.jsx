export default function Badge({ children, color, className = '' }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${className}`}
      style={color ? { background: `${color}22`, color } : undefined}
    >
      {children}
    </span>
  )
}
