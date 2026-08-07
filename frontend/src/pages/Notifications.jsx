import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiCheckCircle, FiAlertCircle, FiClock, FiInbox, FiCheck } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const API_BASE = 'http://localhost:8080/api'

const notificationIcons = {
  SENT: { icon: FiCheckCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  IN_PROGRESS: { icon: FiClock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  RESOLVED: { icon: FiCheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  REJECTED: { icon: FiAlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  CANCELLED: { icon: FiAlertCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  ADMIN_RESPONSE: { icon: FiBell, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
}

const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export default function Notifications() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    if (!currentUser?.id) {
      setNotifications([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/notifications/user/${currentUser.id}`)
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const data = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [currentUser])

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PUT',
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!currentUser?.id) return
    try {
      const res = await fetch(`${API_BASE}/notifications/user/${currentUser.id}/read-all`, {
        method: 'PUT',
      })
      if (!res.ok) throw new Error('Failed to mark all as read')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    navigate(`/complaints/${notification.complaintIdStr}`)
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <GlassCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-white/50 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <NeonButton variant="outline" onClick={markAllAsRead}>
              <FiCheck className="mr-1" /> Mark all as read
            </NeonButton>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <FiInbox className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/70 mb-2">No notifications yet</h3>
            <p className="text-white/50">You'll see updates about your complaints here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { icon: Icon, color, bgColor } = notificationIcons[notification.type] || notificationIcons.SENT

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                    !notification.isRead
                      ? 'bg-white/10 border-neon-blue/30 hover:bg-white/15'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${bgColor} flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm">{notification.message}</p>
                      <p className="text-white/50 text-xs mt-1">{getRelativeTime(notification.createdAt)}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-neon-blue flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
