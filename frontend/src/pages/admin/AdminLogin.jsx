import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { adminLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await adminLogin(username, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <GlassCard>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Admin Login
        </h1>
        <p className="text-white/50 text-sm mt-1">Authorized personnel only</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1.5">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-colors"
            placeholder="Admin username"
          />
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
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/30 transition-colors"
            placeholder="Admin password"
          />
        </div>

        <NeonButton type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in...' : 'Sign In as Admin'}
        </NeonButton>
      </form>
    </GlassCard>
  )
}
