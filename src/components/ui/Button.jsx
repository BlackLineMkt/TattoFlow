export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-bold transition-all duration-200 rounded-md'
  const variants = {
    primary: 'bg-gold text-black hover:bg-gold/90',
    secondary: 'bg-transparent border border-gold text-gold hover:bg-gold/10',
    ghost: 'bg-transparent border border-border text-text hover:bg-surface',
    danger: 'bg-transparent border border-red-800/40 text-red-400 hover:bg-red-500/10',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
