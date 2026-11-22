const rawApiBase = (import.meta.env.VITE_API_BASE || 'http://localhost:8080/api')
  .trim()
  .replace(/\/+$/, '')

export const API_BASE = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`
