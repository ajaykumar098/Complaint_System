import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Background3D from '../components/Background3D'
import NeonButton from '../components/NeonButton'

export default function AdminLayout() {
  const { adminUsername, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    const redirectTo = logout()
    navigate(redirectTo)
  }

  return (
    <div className="min-h-screen">
      <Background3D />
      <div className="relative z-10">
        <header className="glass-panel mx-4 mt-4 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            {adminUsername && (
              <span className="text-sm text-white/60">
                Admin: <span className="text-neon-purple font-medium">{adminUsername}</span>
              </span>
            )}
            <NeonButton variant="outline" onClick={handleLogout} className="text-sm py-2 px-4">
              Logout
            </NeonButton>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
