import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiCheckCircle, FiAlertCircle, FiClock, FiInbox, FiCheck } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

import { API_BASE } from '../api/config'

const notificationIcons = {
  SENT: { icon: FiCheckCircle, color: 'text-sky-400', bgColor: 'bg-sky-500/15 border border-sky-500/25' },
  IN_PROGRESS: { icon: FiClock, color: 'text-amber-400', bgColor: 'bg-amber-500/15 border border-amber-500/25' },
  RESOLVED: { icon: FiCheckCircle, color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border border-emerald-500/25' },
  REJECTED: { icon: FiAlertCircle, color: 'text-rose-400', bgColor: 'bg-rose-500/15 border border-rose-500/25' },
  CANCELLED: { icon: FiAlertCircle, color: 'text-slate-400', bgColor: 'bg-slate-800 border border-slate-700' },
  ADMIN_RESPONSE: { icon: FiBell, color: 'text-indigo-400', bgColor: 'bg-indigo-500/15 border border-indigo-500/25' },
}

const getRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
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

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <GlassCard className="border-slate-800">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading notifications...</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <GlassCard className="border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notification Center</h1>
            <p className="text-slate-400 text-xs mt-1">
              {unreadCount} unread update{unreadCount !== 1 ? 's' : ''} regarding your grievances
            </p>
          </div>
          {unreadCount > 0 && (
            <NeonButton variant="outline" onClick={markAllAsRead} className="text-xs py-2 px-3 inline-flex items-center gap-1.5">
              <FiCheck className="w-3.5 h-3.5" /> Mark all as read
            </NeonButton>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <FiInbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">No notifications yet</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              You will receive real-time updates here whenever an investigation officer acts on your grievance.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const { icon: Icon, color, bgColor } = notificationIcons[notification.type] || notificationIcons.SENT
              const isUnread = !notification.read

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isUnread
                      ? 'bg-slate-900/90 border-blue-500/30 shadow-md shadow-blue-500/5 hover:border-blue-500/50'
                      : 'bg-slate-950/50 border-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl ${bgColor} shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${isUnread ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">{getRelativeTime(notification.createdAt)}</p>
                    </div>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-2" />
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
