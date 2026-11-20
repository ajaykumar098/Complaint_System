export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`glass-panel p-6 md:p-8 transition-all duration-200 ${className}`}>
      {children}
    </div>
  )
}
