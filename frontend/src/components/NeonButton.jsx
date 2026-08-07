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
      'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-lg hover:shadow-neon-blue/30',
    admin:
      'bg-gradient-to-r from-neon-purple to-violet-600 text-white hover:shadow-lg hover:shadow-neon-purple/30',
    outline:
      'border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 hover:shadow-neon-blue/20',
    danger:
      'border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:shadow-red-500/20',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
