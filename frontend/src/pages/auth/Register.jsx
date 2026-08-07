import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCheck, FiX } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { PASSWORD_RULES, validatePassword } from '../../utils/passwordUtils'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
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
      navigate('/', { state: { message: 'Registration successful! Welcome to the complaint system.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
    <GlassCard>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Create Account
        </h1>
        <p className="text-white/50 text-sm mt-1">Register as a citizen</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-white/70 mb-1.5">
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
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
            placeholder="9876543210"
          />
          {mobile.length > 0 && (
            <p
              className={`mt-1.5 text-xs flex items-center gap-1 ${
                mobileValid ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {mobileValid ? <FiCheck /> : <FiX />}
              {mobileValid ? 'Valid mobile number' : 'Enter 10-digit mobile number'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
            placeholder="Create a strong password"
          />

          {(passwordFocused || password.length > 0) && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password)
                return (
                  <li
                    key={rule.id}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      passed ? 'text-green-400' : 'text-white/40'
                    }`}
                  >
                    {passed ? <FiCheck className="flex-shrink-0" /> : <FiX className="flex-shrink-0" />}
                    {rule.label}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-1.5">
            Re-enter Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
            placeholder="Confirm your password"
          />
          {confirmPassword.length > 0 && (
            <p
              className={`mt-1.5 text-xs flex items-center gap-1 ${
                passwordsMatch ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {passwordsMatch ? <FiCheck /> : <FiX />}
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </p>
          )}
        </div>

        <NeonButton type="submit" disabled={!canSubmit} className="w-full">
          {submitting ? 'Creating account...' : 'Register'}
        </NeonButton>
      </form>

      <p className="text-center text-sm text-white/50 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-neon-blue hover:text-neon-purple transition-colors">
          Sign In
        </Link>
      </p>
    </GlassCard>
    </div>
  )
}
