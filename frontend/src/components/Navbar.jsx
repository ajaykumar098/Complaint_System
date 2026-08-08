import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    const redirectTo = logout()
    navigate(redirectTo)
  }

  return (
    <nav className="relative glass-panel px-4 md:px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          ComplaintSys
        </span>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-2">
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

      {/* Desktop User Info & Logout */}
      <div className="hidden md:flex items-center gap-3">
        {currentUser && (
          <span className="text-sm text-white/60">
            Hi, <span className="text-neon-blue font-medium">{currentUser.name}</span>
          </span>
        )}
        <NeonButton variant="outline" onClick={handleLogout} className="text-sm py-2 px-4">
          Logout
        </NeonButton>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
      >
        {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 md:hidden glass-panel border-t border-white/10 p-4 space-y-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {currentUser && (
              <span className="text-sm text-white/60">
                Hi, <span className="text-neon-blue font-medium">{currentUser.name}</span>
              </span>
            )}
            <NeonButton variant="outline" onClick={handleLogout} className="text-sm py-2 px-4">
              Logout
            </NeonButton>
          </div>
        </div>
      )}
    </nav>
  )
}
