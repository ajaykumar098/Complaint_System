import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import Background3D from '../components/Background3D'
import NeonButton from '../components/NeonButton'

export default function AdminLayout() {
  const { adminUsername, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
              <span className="hidden sm:block text-sm text-white/60">
                Admin: <span className="text-neon-purple font-medium">{adminUsername}</span>
              </span>
            )}
            <NeonButton variant="outline" onClick={handleLogout} className="hidden sm:block text-sm py-2 px-4">
              Logout
            </NeonButton>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 sm:hidden glass-panel border-t border-white/10 p-4 space-y-4 mx-4">
            {adminUsername && (
              <div className="text-sm text-white/60">
                Admin: <span className="text-neon-purple font-medium">{adminUsername}</span>
              </div>
            )}
            <NeonButton variant="outline" onClick={handleLogout} className="w-full text-sm py-2 px-4">
              Logout
            </NeonButton>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
