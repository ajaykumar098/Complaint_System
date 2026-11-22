import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiClock, FiMapPin, FiAlertCircle, FiArrowLeft, FiPhone, FiMail, FiExternalLink, FiUser, FiShield, FiCheckCircle } from 'react-icons/fi'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import ChatThread from '../../components/ChatThread'
import CustomSelect from '../../components/CustomSelect'

import { API_BASE } from '../../api/config'

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
  IN_PROGRESS: 'Under Investigation',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

const statusOptions = [
  { value: 'SENT', label: 'Submitted' },
  { value: 'IN_PROGRESS', label: 'Under Investigation' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function AdminComplaintDetails() {
  const { complaintId } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [toast, setToast] = useState(null)

  const loadComplaint = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/complaints/by-complaint-id/${complaintId}`)
      if (!res.ok) throw new Error('Failed to fetch complaint')
      const found = await res.json()
      setComplaint(found || null)
      setChatMessages(found?.chatMessages || [])
    } catch (err) {
      console.error('Failed to load complaint:', err)
      setComplaint(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaint()
  }, [complaintId])

  const handleStatusUpdate = async (newStatus) => {
    if (!complaint) return
    try {
      const res = await fetch(`${API_BASE}/admin/complaints/${complaint.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      setComplaint(updated)
      setToast({ message: 'Complaint status updated successfully', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Failed to update status:', err)
      setToast({ message: 'Failed to update status', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleSendMessage = async (messageContent) => {
    if (!complaint) return
    try {
      const res = await fetch(`${API_BASE}/chat/complaints/${complaint.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'admin',
          senderType: 'ADMIN',
          message: messageContent,
        }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      const chatRes = await fetch(`${API_BASE}/chat/complaints/${complaint.id}/messages`)
      const messages = await chatRes.json()
      setChatMessages(Array.isArray(messages) ? messages : [])
      setToast({ message: 'Official response dispatched', type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Failed to send chat message:', err)
      setToast({ message: 'Failed to send update', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    }
  }

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

  if (loading) {
    return (
      <GlassCard className="border-slate-800">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading complaint investigation file...</p>
        </div>
      </GlassCard>
    )
  }

  if (!complaint) {
    return (
      <GlassCard className="border-slate-800">
        <div className="text-center py-16 px-4">
          <FiAlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Grievance Record Not Found</h3>
          <p className="text-slate-400 text-xs mb-6">The grievance petition you are trying to review does not exist.</p>
          <NeonButton variant="admin" onClick={() => navigate('/admin/dashboard')}>
            Back to Queue
          </NeonButton>
        </div>
      </GlassCard>
    )
  }

  const imageEvidence = complaint.evidence?.filter((e) => e.type === 'IMAGE') || []
  const videoEvidence = complaint.evidence?.filter((e) => e.type === 'VIDEO') || []

  return (
    <div className="max-w-6xl mx-auto px-4">
      {toast && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-xl shadow-2xl z-50 text-xs font-semibold flex items-center gap-2 border ${
          toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
        }`}>
          {toast.type === 'success' ? <FiCheckCircle className="w-4 h-4 text-emerald-400" /> : <FiAlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <GlassCard className="border-slate-800">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <NeonButton variant="outline" onClick={() => navigate('/admin/dashboard')} className="py-2 px-3 text-xs">
              <FiArrowLeft className="mr-1" /> Back
            </NeonButton>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Grievance Investigation File</h1>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {complaint.complaintId}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <FiClock className="w-3.5 h-3.5 text-slate-500" />
                Registered on {formatDate(complaint.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                statusColors[complaint.status] || statusColors.SENT
              }`}
            >
              {statusLabels[complaint.status] || complaint.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                priorityColors[complaint.priority] || priorityColors.LOW
              }`}
            >
              {complaint.priority} Priority
            </span>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Complainant Statement</h3>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {/* Complainant Contact */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Complainant Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <FiUser className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{complaint.userName || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FiPhone className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{complaint.userMobile || 'Not provided'}</span>
                  {complaint.userMobile && (
                    <a
                      href={`tel:${complaint.userMobile}`}
                      className="ml-auto px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
                    >
                      Call
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FiMail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${complaint.userEmail || complaint.userId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:text-indigo-400 transition-colors"
                  >
                    {complaint.userEmail || complaint.userId}
                  </a>
                </div>
              </div>
            </div>

            {/* Location */}
            {(complaint.locationAddress || complaint.locationLat || complaint.locationLng) && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Incident Location</h3>
                <div className="flex items-start gap-2.5 text-slate-200 text-sm">
                  <FiMapPin className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium">{complaint.locationAddress || 'Address on file'}</p>
                    {complaint.locationLat && complaint.locationLng && (
                      <p className="text-slate-400 text-xs font-mono mt-0.5">
                        Coordinates: {complaint.locationLat.toFixed(6)}, {complaint.locationLng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Gallery */}
            {(imageEvidence.length > 0 || videoEvidence.length > 0) && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Submitted Evidence ({imageEvidence.length + videoEvidence.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageEvidence.map((evidence, index) => (
                    <div key={`img-${index}`} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <img
                        src={evidence.filePath}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-36 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => window.open(evidence.filePath, '_blank')}
                      />
                      <button
                        type="button"
                        onClick={() => window.open(evidence.filePath, '_blank')}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {videoEvidence.map((evidence, index) => (
                    <video
                      key={`vid-${index}`}
                      src={evidence.filePath}
                      controls
                      className="w-full h-36 object-cover rounded-xl border border-slate-700 bg-black"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Admin Actions & Communications */}
          <div className="space-y-4">
            {/* Status Update Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escalation Status</h3>
              <CustomSelect
                value={complaint.status}
                onChange={handleStatusUpdate}
                options={statusOptions}
                className="w-full"
              />
            </div>

            {/* Updates / Communication Thread */}
            <div id="chat" className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <ChatThread
                complaintId={complaint.id}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                currentSender="ADMIN"
                isAdmin={true}
                readOnly={false}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
