export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-base">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-neon-blue border-r-neon-purple animate-spin" />
      </div>
    </div>
  )
}
