import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShield, FiUser, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import NeonButton from '../../components/NeonButton'

const inputBase =
  'w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all'

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
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Welcome to CivicResolve
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
          Please select your portal below to sign in to your dashboard
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-center gap-2">
          <FiCheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-0">
        {/* User side */}
        <motion.div
          layout
          className="flex-1 min-w-0"
          animate={{
            scale: userDimmed ? 0.98 : 1,
            opacity: userDimmed ? 0.6 : 1,
            flex: activeSide === 'user' ? 1.15 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div
            className={`glass-panel h-full p-6 sm:p-8 transition-all duration-300 ${
              activeSide === 'user'
                ? 'shadow-2xl shadow-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30'
                : 'hover:border-slate-700 hover:shadow-xl'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Citizen Portal</h2>
                <span className="text-xs text-blue-400 font-medium">Public Access</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              File complaints, track progress in real-time, and get AI-assisted guidance.
            </p>

            <AnimatePresence mode="wait">
              {activeSide !== 'user' ? (
                <motion.div
                  key="user-preview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <NeonButton onClick={() => setActiveSide('user')} className="w-full py-2.5">
                    Continue as Citizen
                  </NeonButton>
                </motion.div>
              ) : (
                <motion.div
                  key="user-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <button
                    type="button"
                    onClick={collapse}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                    Back to options
                  </button>

                  {userError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{userError}</span>
                    </div>
                  )}

                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`${inputBase} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                        placeholder="citizen@example.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`${inputBase} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                        placeholder="Enter your password"
                      />
                    </div>
                    <NeonButton type="submit" disabled={userSubmitting} className="w-full py-2.5">
                      {userSubmitting ? 'Signing in...' : 'Sign In as Citizen'}
                    </NeonButton>
                  </form>

                  <p className="text-center text-xs text-slate-400 mt-5">
                    Don&apos;t have an account?{' '}
                    <Link
                      to="/register"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Register here
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex md:flex-col items-center justify-center px-2 py-2 md:py-0 md:px-4 shrink-0">
          <div className="hidden md:block w-px flex-1 bg-slate-800" />
          <span className="px-3 py-1 text-[11px] font-semibold tracking-widest text-slate-400 uppercase bg-slate-900 border border-slate-800 rounded-full my-2">
            or
          </span>
          <div className="md:hidden w-full max-w-[120px] h-px bg-slate-800" />
          <div className="hidden md:block w-px flex-1 bg-slate-800" />
        </div>

        {/* Admin side */}
        <motion.div
          layout
          className="flex-1 min-w-0"
          animate={{
            scale: adminDimmed ? 0.98 : 1,
            opacity: adminDimmed ? 0.6 : 1,
            flex: activeSide === 'admin' ? 1.15 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div
            className={`glass-panel h-full p-6 sm:p-8 transition-all duration-300 ${
              activeSide === 'admin'
                ? 'shadow-2xl shadow-indigo-500/10 border-indigo-500/40 ring-1 ring-indigo-500/30'
                : 'hover:border-slate-700 hover:shadow-xl'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Portal</h2>
                <span className="text-xs text-indigo-400 font-medium">Authorized Officers</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Review grievances, update complaint statuses, and manage department actions.
            </p>

            <AnimatePresence mode="wait">
              {activeSide !== 'admin' ? (
                <motion.div
                  key="admin-preview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <NeonButton
                    variant="admin"
                    onClick={() => setActiveSide('admin')}
                    className="w-full py-2.5"
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
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <button
                    type="button"
                    onClick={collapse}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                    Back to options
                  </button>

                  {adminError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="admin-username"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
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
                        className={`${inputBase} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`}
                        placeholder="Admin username"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-password"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
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
                        className={`${inputBase} focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`}
                        placeholder="Admin password"
                      />
                    </div>
                    <NeonButton
                      type="submit"
                      variant="admin"
                      disabled={adminSubmitting}
                      className="w-full py-2.5"
                    >
                      {adminSubmitting ? 'Authenticating...' : 'Sign In as Admin'}
                    </NeonButton>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
