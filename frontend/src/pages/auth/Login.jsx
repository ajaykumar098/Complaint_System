import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShield, FiUser, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import NeonButton from '../../components/NeonButton'

const inputBase =
  'w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-colors'

export default function Login() {
  const [activeSide, setActiveSide] = useState(null)

  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminSubmitting, setAdminSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userError, setUserError] = useState('')
  const [userSubmitting, setUserSubmitting] = useState(false)

  const { login, adminLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '')

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const collapse = () => {
    setActiveSide(null)
    setAdminError('')
    setUserError('')
  }

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminSubmitting(true)
    try {
      await adminLogin(adminUsername, adminPassword)
      navigate('/admin/dashboard')
    } catch (err) {
      setAdminError(err.message)
    } finally {
      setAdminSubmitting(false)
    }
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault()
    setUserError('')
    setUserSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setUserError(err.message)
    } finally {
      setUserSubmitting(false)
    }
  }

  const adminDimmed = activeSide === 'user'
  const userDimmed = activeSide === 'admin'

  return (
    <div className="w-full">
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-0">
        {/* Admin side */}
        <motion.div
          layout
          className="flex-1 min-w-0"
          animate={{
            scale: adminDimmed ? 0.97 : 1,
            opacity: adminDimmed ? 0.55 : 1,
            flex: activeSide === 'admin' ? 1.15 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div
            className={`glass-panel h-full p-6 md:p-8 transition-shadow duration-300 ${
              activeSide === 'admin'
                ? 'shadow-lg shadow-neon-purple/20 border-neon-purple/30'
                : 'hover:shadow-lg hover:shadow-neon-purple/10 hover:border-neon-purple/20'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-neon-purple/15 border border-neon-purple/30">
                <FiShield className="w-6 h-6 text-neon-purple" />
              </div>
              <h2 className="text-xl font-bold text-neon-purple">Admin Login</h2>
            </div>
            <p className="text-white/50 text-sm mb-5">
              Restricted access for authorized administrator only
            </p>

            <AnimatePresence mode="wait">
              {activeSide !== 'admin' ? (
                <motion.div
                  key="admin-preview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <NeonButton
                    variant="admin"
                    onClick={() => setActiveSide('admin')}
                    className="w-full"
                  >
                    Continue as Admin
                  </NeonButton>
                </motion.div>
              ) : (
                <motion.div
                  key="admin-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <button
                    type="button"
                    onClick={collapse}
                    className="flex items-center gap-1.5 text-sm text-white/50 hover:text-neon-purple transition-colors mb-4"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  {adminError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {adminError}
                    </div>
                  )}

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="admin-username"
                        className="block text-sm font-medium text-white/70 mb-1.5"
                      >
                        Username
                      </label>
                      <input
                        id="admin-username"
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        required
                        autoComplete="username"
                        className={`${inputBase} border-white/10 focus:border-neon-purple/50 focus:ring-neon-purple/30`}
                        placeholder="Admin username"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-password"
                        className="block text-sm font-medium text-white/70 mb-1.5"
                      >
                        Password
                      </label>
                      <input
                        id="admin-password"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className={`${inputBase} border-white/10 focus:border-neon-purple/50 focus:ring-neon-purple/30`}
                        placeholder="Admin password"
                      />
                    </div>
                    <NeonButton
                      type="submit"
                      variant="admin"
                      disabled={adminSubmitting}
                      className="w-full"
                    >
                      {adminSubmitting ? 'Signing in...' : 'Login as Admin'}
                    </NeonButton>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex md:flex-col items-center justify-center px-2 py-2 md:py-0 md:px-4 shrink-0">
          <div className="hidden md:block w-px flex-1 bg-gradient-to-b from-transparent via-neon-blue/40 to-neon-purple/40" />
          <span className="px-3 py-1 text-xs font-semibold tracking-widest text-white/40 uppercase">
            or
          </span>
          <div className="md:hidden w-full max-w-[120px] h-px bg-gradient-to-r from-transparent via-neon-blue/40 to-neon-purple/40" />
          <div className="hidden md:block w-px flex-1 bg-gradient-to-b from-neon-purple/40 via-neon-blue/40 to-transparent" />
        </div>

        {/* User side */}
        <motion.div
          layout
          className="flex-1 min-w-0"
          animate={{
            scale: userDimmed ? 0.97 : 1,
            opacity: userDimmed ? 0.55 : 1,
            flex: activeSide === 'user' ? 1.15 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div
            className={`glass-panel h-full p-6 md:p-8 transition-shadow duration-300 ${
              activeSide === 'user'
                ? 'shadow-lg shadow-neon-blue/20 border-neon-blue/30'
                : 'hover:shadow-lg hover:shadow-neon-blue/10 hover:border-neon-blue/20'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-lg bg-neon-blue/15 border border-neon-blue/30">
                <FiUser className="w-6 h-6 text-neon-blue" />
              </div>
              <h2 className="text-xl font-bold text-neon-blue">Citizen Login</h2>
            </div>
            <p className="text-white/50 text-sm mb-5">Report and track your complaints</p>

            <AnimatePresence mode="wait">
              {activeSide !== 'user' ? (
                <motion.div
                  key="user-preview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <NeonButton onClick={() => setActiveSide('user')} className="w-full">
                    Continue as User
                  </NeonButton>
                </motion.div>
              ) : (
                <motion.div
                  key="user-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <button
                    type="button"
                    onClick={collapse}
                    className="flex items-center gap-1.5 text-sm text-white/50 hover:text-neon-blue transition-colors mb-4"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  {userError && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {userError}
                    </div>
                  )}

                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-white/70 mb-1.5"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`${inputBase} border-white/10 focus:border-neon-blue/50 focus:ring-neon-blue/30`}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-white/70 mb-1.5"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`${inputBase} border-white/10 focus:border-neon-blue/50 focus:ring-neon-blue/30`}
                        placeholder="Enter your password"
                      />
                    </div>
                    <NeonButton type="submit" disabled={userSubmitting} className="w-full">
                      {userSubmitting ? 'Signing in...' : 'Login'}
                    </NeonButton>
                  </form>

                  <p className="text-center text-sm text-white/50 mt-5">
                    Don&apos;t have an account?{' '}
                    <Link
                      to="/register"
                      className="text-neon-blue hover:text-neon-purple transition-colors"
                    >
                      Register here
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
