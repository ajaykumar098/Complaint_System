import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { safeGetItem, safeGetJSON } from '../utils/localStorageHelper'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUsername, setAdminUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser = safeGetJSON('currentUser')
      if (storedUser) {
        setCurrentUser(storedUser)
      }
      const adminFlag = safeGetItem('isAdmin')
      if (adminFlag === 'true') {
        setIsAdmin(true)
        setAdminUsername(safeGetItem('adminUsername'))
      }
    } catch {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('adminUsername')
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name, email, password, mobile) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed')
      }

      const sessionUser = {
        id: data.userId,
        name: data.name,
        email: data.email,
        mobile: mobile,
      }

      localStorage.setItem('currentUser', JSON.stringify(sessionUser))
      setCurrentUser(sessionUser)
      return sessionUser
    } catch (err) {
      throw err
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      const sessionUser = {
        id: data.userId,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
      }

      localStorage.setItem('currentUser', JSON.stringify(sessionUser))
      setCurrentUser(sessionUser)
      return sessionUser
    } catch (err) {
      throw err
    }
  }, [])

  const adminLogin = useCallback(async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Admin login failed')
      }

      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminUsername', username)
      setIsAdmin(true)
      setAdminUsername(username)
      return { username }
    } catch (err) {
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    const wasAdmin = localStorage.getItem('isAdmin') === 'true'
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminUsername')
    setCurrentUser(null)
    setIsAdmin(false)
    setAdminUsername(null)
    return wasAdmin ? '/admin/login' : '/login'
  }, [])

  const updateUser = useCallback(async (name, email, mobile) => {
    try {
      const res = await fetch(`${API_BASE}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }
      const updatedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
      }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
      return updatedUser
    } catch (err) {
      throw err
    }
  }, [currentUser])

  const value = useMemo(
    () => ({
      currentUser,
      isAdmin,
      adminUsername,
      loading,
      register,
      login,
      adminLogin,
      logout,
      updateUser,
    }),
    [currentUser, isAdmin, adminUsername, loading, register, login, adminLogin, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
