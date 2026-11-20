export default function NeonButton({
  children,
  type = 'button',
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}) {
  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 border border-blue-500/30 focus:ring-2 focus:ring-blue-500/40',
    admin:
      'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 border border-indigo-500/30 focus:ring-2 focus:ring-indigo-500/40',
    outline:
      'border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white bg-slate-800/40 hover:bg-slate-800/80 shadow-sm focus:ring-2 focus:ring-slate-700/50',
    danger:
      'border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 focus:ring-2 focus:ring-rose-500/40',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 focus:ring-2 focus:ring-slate-700/40',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  )
}
