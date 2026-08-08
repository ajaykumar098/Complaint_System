import { NavLink, useNavigate } from 'react-router-dom'
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
    <nav className="glass-panel px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center justify-between w-full md:w-auto gap-2">
        <span className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          ComplaintSys
        </span>
      </div>

      {/* Nav Links - always visible, wraps on small screens */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {navLinks.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'text-neon-blue bg-neon-blue/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        {currentUser && (
          <span className="text-sm text-white/60">
            Hi, <span className="text-neon-blue font-medium">{currentUser.name}</span>
          </span>
        )}
        <NeonButton variant="outline" onClick={handleLogout} className="text-sm py-2 px-4">
          Logout
        </NeonButton>
      </div>
    </nav>
  )
}
