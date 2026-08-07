export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass-panel p-6 shadow-lg shadow-neon-purple/5 ${className}`}>
      {children}
    </div>
  )
}
