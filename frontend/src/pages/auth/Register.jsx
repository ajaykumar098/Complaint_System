import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCheck, FiX, FiUserPlus, FiShield, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { PASSWORD_RULES, validatePassword } from '../../utils/passwordUtils'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'

const inputClass =
  'w-full px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register, logout } = useAuth()
  const navigate = useNavigate()

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const passwordValid = validatePassword(password)
  const mobileValid = /^\d{10}$/.test(mobile)
  const canSubmit = name && email && mobileValid && passwordValid && passwordsMatch && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setSubmitting(true)
    try {
      await register(name, email, password, mobile)
      logout()
      navigate('/login', { state: { message: 'Registration successful! Please sign in with your credentials.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <GlassCard className="border-slate-800">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
            <FiUserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Citizen Account
          </h1>
          <p className="text-slate-400 text-xs mt-1">Register to submit grievances and track resolutions</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Mobile Number
            </label>
            <input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                setMobile(value)
              }}
              required
              className={inputClass}
              placeholder="10-digit mobile number"
            />
            {mobile.length > 0 && (
              <p
                className={`mt-1.5 text-xs flex items-center gap-1.5 ${
                  mobileValid ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {mobileValid ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
                {mobileValid ? 'Valid mobile number' : 'Enter a valid 10-digit mobile number'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              required
              className={inputClass}
              placeholder="Create a strong password"
            />

            {(passwordFocused || password.length > 0) && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Password Requirements:</p>
                <ul className="space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password)
                    return (
                      <li
                        key={rule.id}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          passed ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {passed ? <FiCheck className="w-3.5 h-3.5 shrink-0" /> : <FiX className="w-3.5 h-3.5 shrink-0" />}
                        {rule.label}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
              placeholder="Re-enter your password"
            />
            {confirmPassword.length > 0 && (
              <p
                className={`mt-1.5 text-xs flex items-center gap-1.5 ${
                  passwordsMatch ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {passwordsMatch ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          <div className="pt-2">
            <NeonButton type="submit" disabled={!canSubmit} className="w-full py-2.5 text-sm">
              {submitting ? 'Creating account...' : 'Create Account'}
            </NeonButton>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Sign In here
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
