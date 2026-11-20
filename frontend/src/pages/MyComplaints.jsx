import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiMapPin, FiAlertCircle, FiCheckCircle, FiEye, FiEdit, FiTrash2, FiPlus, FiFileText } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const statusColors = {
  SENT: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  CANCELLED: 'bg-slate-800 text-slate-400 border-slate-700',
}

const priorityColors = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  HIGH: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
}

const statusLabels = {
  SENT: 'Submitted',
  IN_PROGRESS: 'In Investigation',
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
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to cancel complaint')
      setComplaints((prev) => prev.filter((c) => c.id !== complaintDbId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to cancel complaint:', err)
      alert('Failed to cancel complaint. Please try again.')
      setDeleteConfirm(null)
    }
  }

  const canEdit = (status) => status === 'SENT'
  const canDelete = (status) => status === 'SENT'

  if (loading) {
    return (
      <GlassCard className="border-slate-800">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading your registered complaints...</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <GlassCard className="border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Grievance History</h1>
            <p className="text-slate-400 text-xs mt-1">
              You have submitted {complaints.length} official {complaints.length === 1 ? 'grievance' : 'grievances'}.
            </p>
          </div>
          <NeonButton onClick={() => navigate('/')} className="inline-flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> File New Grievance
          </NeonButton>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <FiFileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">No grievances registered</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
              You haven't submitted any complaints yet. When you do, they will appear here with live tracking.
            </p>
            <NeonButton onClick={() => navigate('/')}>Register Your First Complaint</NeonButton>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const imageCount = complaint.evidence?.filter((e) => e.type === 'IMAGE').length || 0
              const videoCount = complaint.evidence?.filter((e) => e.type === 'VIDEO').length || 0

              return (
                <div
                  key={complaint.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {complaint.complaintId}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            statusColors[complaint.status] || statusColors.SENT
                          }`}
                        >
                          {statusLabels[complaint.status] || complaint.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            priorityColors[complaint.priority] || priorityColors.LOW
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <NeonButton
                        variant="outline"
                        onClick={() => navigate(`/complaints/${complaint.complaintId}`)}
                        className="text-xs py-2 px-3 flex-1 sm:flex-none inline-flex items-center gap-1.5"
                      >
                        <FiEye className="w-3.5 h-3.5 text-blue-400" /> Details
                      </NeonButton>
                      <NeonButton
                        variant="outline"
                        onClick={() => navigate(`/complaints/${complaint.complaintId}/edit`)}
                        disabled={!canEdit(complaint.status)}
                        className={`text-xs py-2 px-3 flex-1 sm:flex-none inline-flex items-center gap-1.5 ${!canEdit(complaint.status) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <FiEdit className="w-3.5 h-3.5" /> Edit
                      </NeonButton>
                      <NeonButton
                        variant="danger"
                        onClick={() => setDeleteConfirm(complaint.id)}
                        disabled={!canDelete(complaint.status)}
                        className={`text-xs py-2 px-3 flex-1 sm:flex-none inline-flex items-center gap-1.5 ${!canDelete(complaint.status) ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Cancel
                      </NeonButton>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-900">
                    <div className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(complaint.createdAt)}
                    </div>
                    {complaint.locationAddress && (
                      <div className="flex items-center gap-1.5 truncate max-w-xs">
                        <FiMapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{complaint.locationAddress.split(',').slice(0, 2).join(',')}</span>
                      </div>
                    )}
                    {(imageCount > 0 || videoCount > 0) && (
                      <div className="flex items-center gap-1.5">
                        <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{imageCount} photo{imageCount === 1 ? '' : 's'}{videoCount > 0 ? `, ${videoCount} video${videoCount === 1 ? '' : 's'}` : ''}</span>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">Withdraw Grievance?</h3>
              <p className="text-slate-400 text-xs mb-6">
                Are you sure you want to cancel this complaint? The investigation file will be closed immediately.
              </p>

              <div className="flex gap-3">
                <NeonButton
                  onClick={() => setDeleteConfirm(null)}
                  variant="outline"
                  className="flex-1 text-xs py-2.5"
                >
                  Keep Active
                </NeonButton>
                <NeonButton
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="danger"
                  className="flex-1 text-xs py-2.5"
                >
                  Yes, Withdraw
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
