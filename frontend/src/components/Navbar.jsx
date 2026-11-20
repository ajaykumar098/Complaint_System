import { NavLink, useNavigate } from 'react-router-dom'
import { FiShield, FiUser } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import NeonButton from './NeonButton'

const navLinks = [
  { to: '/', label: 'Report Complaint', end: true },
  { to: '/my-complaints', label: 'My Complaints' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
  { to: '/help', label: 'Help' },
]

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    const redirectTo = logout()
    navigate(redirectTo)
  }

  return (
    <nav className="glass-panel px-4 md:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center justify-between w-full md:w-auto gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-tight">
              Civic<span className="text-blue-400">Resolve</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Citizen Portal
            </span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
        {navLinks.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/25 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
        {currentUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs text-slate-300">
            <FiUser className="w-3.5 h-3.5 text-blue-400" />
            <span>
              <span className="text-slate-100 font-medium">{currentUser.name}</span>
            </span>
          </div>
        )}
        <NeonButton variant="outline" onClick={handleLogout} className="text-xs py-1.5 px-3.5">
          Logout
        </NeonButton>
      </div>
    </nav>
  )
}
