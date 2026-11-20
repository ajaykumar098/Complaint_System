export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#0e1116]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#14181f] via-[#10141b] to-[#0e1116]" />
      <div
        className="absolute -inset-[15%] bg-animate-drift-slow"
        style={{
          background:
            'radial-gradient(900px 600px at 20% 20%, rgba(100, 116, 139, 0.14), transparent 65%),' +
            'radial-gradient(800px 600px at 80% 75%, rgba(71, 85, 105, 0.12), transparent 65%)',
        }}
      />
      <div
        className="absolute -inset-[15%] bg-animate-drift-slower opacity-70"
        style={{
          background:
            'radial-gradient(700px 500px at 75% 15%, rgba(148, 163, 184, 0.07), transparent 60%),' +
            'radial-gradient(900px 700px at 25% 85%, rgba(100, 116, 139, 0.08), transparent 65%)',
        }}
      />
    </div>
  )
}
