import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPhone, FiMail, FiMessageSquare, FiEye, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
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
  { value: 'All', label: 'All Status' },
  { value: 'SENT', label: 'Sent' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const priorityOptions = [
  { value: 'All', label: 'All Priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
]

const cardStatusOptions = [
  { value: 'SENT', label: 'Sent' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/complaints`)
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
  }, [])

  const handleStatusUpdate = async (complaintDbId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/admin/complaints/${complaintDbId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintDbId ? updated : c))
      )
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const getFilteredAndSortedComplaints = () => {
    let filtered = [...complaints]

    if (statusFilter !== 'All') {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    if (priorityFilter !== 'All') {
      filtered = filtered.filter((c) => c.priority === priorityFilter)
    }

    filtered.sort((a, b) => {
      const diff = new Date(b.createdAt) - new Date(a.createdAt)
      return sortBy === 'newest' ? diff : -diff
    })

    return filtered
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

  const stats = {
    total: complaints.length,
    sent: complaints.filter((c) => c.status === 'SENT').length,
    inProgress: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
    rejected: complaints.filter((c) => c.status === 'REJECTED').length,
  }

  const filteredComplaints = getFilteredAndSortedComplaints()

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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/50 mt-1">Manage and respond to citizen complaints</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-white/50 text-sm">Total</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.sent}</p>
          <p className="text-white/50 text-sm">Sent</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
          <p className="text-white/50 text-sm">In Progress</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
          <p className="text-white/50 text-sm">Resolved</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          <p className="text-white/50 text-sm">Rejected</p>
        </GlassCard>
      </div>

      {/* Filter/Sort Bar */}
      <GlassCard className="mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">Filters:</span>
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className="w-full sm:w-40"
          />
          <CustomSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
            className="w-full sm:w-40"
          />
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <span className="text-white/60 text-sm">Sort:</span>
            <button
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
            >
              {sortBy === 'newest' ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
              {sortBy === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Complaint Cards */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12">
              <p className="text-white/50">No complaints found matching your filters.</p>
            </div>
          </GlassCard>
        ) : (
          filteredComplaints.map((complaint) => {
            const imageEvidence = complaint.evidence?.filter((e) => e.type === 'IMAGE') || []
            const videoEvidence = complaint.evidence?.filter((e) => e.type === 'VIDEO') || []

            return (
              <GlassCard key={complaint.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-white/50">Name</p>
                        <p className="text-white/90">{complaint.userName}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Phone</p>
                        <p className="text-white/90">{complaint.userMobile || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/50">Email</p>
                        <p className="text-white/90 text-xs">{complaint.userEmail || complaint.userId}</p>
                      </div>
                    </div>

                    <p className="text-white/80 text-sm line-clamp-2 mb-3">{complaint.description}</p>

                    {/* Evidence Thumbnails */}
                    {imageEvidence.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto">
                        {imageEvidence.slice(0, 3).map((evidence, index) => (
                          <img
                            key={index}
                            src={evidence.filePath}
                            alt={`Evidence ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-white/10 hover:border-neon-blue/50 transition-colors cursor-pointer flex-shrink-0"
                            onClick={() => window.open(evidence.filePath, '_blank')}
                          />
                        ))}
                        {imageEvidence.length > 3 && (
                          <div className="w-16 h-16 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 text-xs flex-shrink-0">
                            +{imageEvidence.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                      <span>
                        {imageEvidence.length} image{imageEvidence.length !== 1 ? 's' : ''}, {videoEvidence.length} video{videoEvidence.length !== 1 ? 's' : ''}
                      </span>
                      {complaint.locationAddress && (
                        <span className="truncate max-w-xs">
                          📍 {complaint.locationAddress.split(',').slice(0, 2).join(',')}
                        </span>
                      )}
                      <span>{formatDate(complaint.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px] w-full lg:w-auto">
                    <div className="flex flex-row sm:flex-col gap-2">
                      <NeonButton
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                        className="flex-1 sm:flex-none min-h-[44px]"
                      >
                        <FiEye className="mr-1" /> View
                      </NeonButton>
                      <a
                        href={complaint.userMobile ? `tel:${complaint.userMobile}` : undefined}
                        className={`px-3 py-2 min-h-[44px] rounded-lg border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 transition-all duration-200 flex items-center justify-center gap-1 ${
                          !complaint.userMobile ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <FiPhone className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">Call</span>
                      </a>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${complaint.userEmail || complaint.userId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 min-h-[44px] rounded-lg border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <FiMail className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">Email</span>
                      </a>
                    </div>

                    <NeonButton
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/complaints/${complaint.complaintId}#chat`)}
                      className="w-full min-h-[44px]"
                    >
                      <FiMessageSquare className="mr-1" /> Message
                    </NeonButton>

                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-xs">Status:</span>
                      <CustomSelect
                        value={complaint.status}
                        onChange={(value) => handleStatusUpdate(complaint.id, value)}
                        options={cardStatusOptions}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )
          })
        )}
      </div>
    </div>
  )
}
