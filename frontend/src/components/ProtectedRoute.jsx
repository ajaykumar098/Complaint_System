import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Loader from './Loader'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser, isAdmin, loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  if (requireAdmin) {
    if (!isAdmin) {
      return <Navigate to="/admin/login" replace />
    }
    return children
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}
