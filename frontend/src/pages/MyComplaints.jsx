import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiMapPin, FiAlertCircle, FiCheckCircle, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const statusColors = {
  SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  RESOLVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CANCELLED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const priorityColors = {
  LOW: 'bg-green-500/20 text-green-400',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400',
  HIGH: 'bg-red-500/20 text-red-400',
}

const statusLabels = {
  SENT: 'Sent',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

export default function MyComplaints() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const loadComplaints = async () => {
    if (!currentUser?.id) {
      setComplaints([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/complaints/user/${currentUser.id}`)
      if (!res.ok) throw new Error('Failed to fetch complaints')
      const data = await res.json()
      setComplaints(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load complaints:', err)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [currentUser])

  const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDelete = async (complaintDbId) => {
    try {
      const res = await fetch(`${API_BASE}/complaints/${complaintDbId}/cancel`, {
        method: 'PUT',
      })
      if (!res.ok) throw new Error('Failed to cancel complaint')
      const updated = await res.json()
      setComplaints((prev) => prev.map((c) => (c.id === complaintDbId ? updated : c)))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to cancel complaint:', err)
    }
  }

  const canEdit = (status) => status === 'SENT'
  const canDelete = (status) => status === 'SENT'

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
            <h1 className="text-2xl font-bold text-white">My Complaints</h1>
            <p className="text-white/50 mt-1">
              {complaints.length} {complaints.length === 1 ? 'complaint' : 'complaints'} submitted
            </p>
          </div>
          <NeonButton onClick={() => navigate('/')}>New Complaint</NeonButton>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-12">
            <FiAlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/70 mb-2">No complaints yet</h3>
            <p className="text-white/50 mb-6">You haven't submitted any complaints.</p>
            <NeonButton onClick={() => navigate('/')}>Submit Your First Complaint</NeonButton>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const imageCount = complaint.evidence?.filter((e) => e.type === 'IMAGE').length || 0
              const videoCount = complaint.evidence?.filter((e) => e.type === 'VIDEO').length || 0

              return (
                <div
                  key={complaint.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-neon-blue">{complaint.complaintId}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            statusColors[complaint.status] || statusColors.SENT
                          }`}
                        >
                          {statusLabels[complaint.status] || complaint.status}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priorityColors[complaint.priority] || priorityColors.LOW
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm line-clamp-2">{complaint.description}</p>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:w-full sm:min-w-[120px]">
                      <NeonButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/complaints/${complaint.complaintId}`)}
                        className="flex-1 sm:flex-none min-h-[44px]"
                      >
                        <FiEye className="mr-1" /> View
                      </NeonButton>
                      <NeonButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/complaints/${complaint.complaintId}/edit`)}
                        disabled={!canEdit(complaint.status)}
                        className={`flex-1 sm:flex-none min-h-[44px] ${!canEdit(complaint.status) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FiEdit className="mr-1" /> Edit
                      </NeonButton>
                      <NeonButton
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteConfirm(complaint.id)}
                        disabled={!canDelete(complaint.status)}
                        className={`flex-1 sm:flex-none min-h-[44px] ${!canDelete(complaint.status) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <FiTrash2 className="mr-1" /> Cancel
                      </NeonButton>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {formatDate(complaint.createdAt)}
                    </div>
                    {complaint.locationAddress && (
                      <div className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        {complaint.locationAddress.split(',').slice(0, 2).join(',')}
                      </div>
                    )}
                    {(imageCount > 0 || videoCount > 0) && (
                      <div className="flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        {imageCount} images, {videoCount} videos
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-base border border-white/10 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-2">Cancel Complaint?</h3>
              <p className="text-white/60 mb-6">
                Are you sure you want to cancel this complaint? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <NeonButton
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline"
                  className="flex-1"
                >
                  No, Keep It
                </NeonButton>
                <NeonButton
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="danger"
                  className="flex-1"
                >
                  Yes, Cancel
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}