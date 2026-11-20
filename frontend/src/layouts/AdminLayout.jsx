import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiShield, FiActivity } from 'react-icons/fi'
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
    <div className="min-h-screen text-slate-100">
      <Background3D />
      <div className="relative z-10">
        <header className="glass-panel mx-4 mt-4 px-6 py-4 flex items-center justify-between border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                CivicResolve <span className="text-indigo-400">Admin</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Grievance Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {adminUsername && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300">
                <span className="text-slate-400">Officer:</span>
                <span className="text-indigo-300 font-semibold">{adminUsername}</span>
              </div>
            )}
            <NeonButton variant="outline" onClick={handleLogout} className="hidden sm:inline-flex text-xs py-1.5 px-3.5">
              Logout
            </NeonButton>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 sm:hidden glass-panel border-t border-slate-800/80 p-4 space-y-4 mx-4 mt-2">
            {adminUsername && (
              <div className="text-sm text-slate-300">
                Officer: <span className="text-indigo-400 font-semibold">{adminUsername}</span>
              </div>
            )}
            <NeonButton variant="outline" onClick={handleLogout} className="w-full text-xs py-2">
              Logout
            </NeonButton>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
