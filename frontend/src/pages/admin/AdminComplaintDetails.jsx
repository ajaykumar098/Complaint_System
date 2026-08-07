import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiClock, FiMapPin, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import ChatThread from '../../components/ChatThread'
import CustomSelect from '../../components/CustomSelect'

const API_BASE = 'http://localhost:8080/api'

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

const statusOptions = [
  { value: 'SENT', label: 'Sent' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
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
    } catch (err) {
      console.error('Failed to update status:', err)
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
      // Refresh chat thread
      const chatRes = await fetch(`${API_BASE}/chat/complaints/${complaint.id}/messages`)
      const messages = await chatRes.json()
      setChatMessages(Array.isArray(messages) ? messages : [])
      // Show success toast
      setToast({ message: 'Update sent successfully', type: 'success' })
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
      <GlassCard>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </GlassCard>
    )
  }

  if (!complaint) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <FiAlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/70 mb-2">Complaint Not Found</h3>
          <p className="text-white/50 mb-6">The complaint you're looking for doesn't exist.</p>
          <NeonButton onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</NeonButton>
        </div>
      </GlassCard>
    )
  }

  const imageEvidence = complaint.evidence?.filter((e) => e.type === 'IMAGE') || []
  const videoEvidence = complaint.evidence?.filter((e) => e.type === 'VIDEO') || []

  return (
    <div className="max-w-5xl mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <NeonButton variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <FiArrowLeft className="mr-1" /> Back
          </NeonButton>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Complaint Details</h1>
            <p className="text-white/50 mt-1">{complaint.complaintId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Left Column - Complaint Info */}
          <div className="lg:col-span-3 space-y-4">
            {/* Status and Priority */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  statusColors[complaint.status] || statusColors.SENT
                }`}
              >
                {statusLabels[complaint.status] || complaint.status}
              </span>
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  priorityColors[complaint.priority] || priorityColors.LOW
                }`}
              >
                {complaint.priority} Priority
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-2">Description</h3>
              <p className="text-white/90 bg-white/5 border border-white/10 rounded-lg p-4">
                {complaint.description}
              </p>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Submitted By</h3>
                <p className="text-white/90">{complaint.userName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Mobile</h3>
                <div className="flex items-center gap-2">
                  <p className="text-white/90">{complaint.userMobile || 'Not provided'}</p>
                  {complaint.userMobile && (
                    <a
                      href={`tel:${complaint.userMobile}`}
                      className="p-1 rounded-lg bg-neon-blue/20 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/30 transition-colors"
                      title="Call"
                    >
                      <FiPhone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Email</h3>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${complaint.userEmail || complaint.userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 text-sm hover:text-neon-blue transition-colors"
                >
                  {complaint.userEmail || complaint.userId}
                </a>
              </div>
            </div>

            {/* Location */}
            {(complaint.locationAddress || complaint.locationLat || complaint.locationLng) && (
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Location</h3>
                <div className="flex items-start gap-2 text-white/90 bg-white/5 border border-white/10 rounded-lg p-4">
                  <FiMapPin className="w-4 h-4 text-neon-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{complaint.locationAddress || 'Address not found'}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {complaint.locationLat?.toFixed(6)}, {complaint.locationLng?.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <FiClock className="w-4 h-4" />
              Submitted on {formatDate(complaint.createdAt)}
            </div>

            {/* Evidence */}
            {complaint.evidence?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-white/70 mb-2">Evidence</h3>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageEvidence.map((evidence, index) => (
                      <img
                        key={`img-${index}`}
                        src={evidence.filePath}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-white/10 hover:border-neon-blue/50 transition-colors cursor-pointer"
                        onClick={() => window.open(evidence.filePath, '_blank')}
                      />
                    ))}
                    {videoEvidence.map((evidence, index) => (
                      <video
                        key={`vid-${index}`}
                        src={evidence.filePath}
                        controls
                        className="w-full h-48 object-cover rounded-lg border border-white/10"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Admin Controls */}
          <div className="lg:sticky lg:top-4 self-start space-y-4">
            {/* Status Update */}
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-2">Update Status</h3>
              <CustomSelect
                value={complaint.status}
                onChange={handleStatusUpdate}
                options={statusOptions}
                className="w-full"
              />
            </div>


            {/* Updates */}
            <div id="chat">
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
