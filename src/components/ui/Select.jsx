export default function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-card border rounded-md px-3 py-2.5 text-text text-sm
          focus:outline-none transition-all duration-200
          ${error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-gold'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}
