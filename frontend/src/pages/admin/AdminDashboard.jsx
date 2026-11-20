import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPhone, FiMail, FiMessageSquare, FiEye, FiFilter, FiArrowUp, FiArrowDown, FiShield, FiFileText, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import GlassCard from '../../components/GlassCard'
import NeonButton from '../../components/NeonButton'
import CustomSelect from '../../components/CustomSelect'

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
  IN_PROGRESS: 'Under Investigation',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

const statusOptions = [
  { value: 'All', label: 'All Statuses' },
  { value: 'SENT', label: 'Submitted' },
  { value: 'IN_PROGRESS', label: 'Under Investigation' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const priorityOptions = [
  { value: 'All', label: 'All Priorities' },
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
]

const cardStatusOptions = [
  { value: 'SENT', label: 'Submitted' },
  { value: 'IN_PROGRESS', label: 'Under Investigation' },
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
      <GlassCard className="border-slate-800">
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading admin operations queue...</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Grievance Redressal Queue
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Review citizen petitions, manage escalation statuses, and communicate resolutions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
            {stats.total} Total Grievances
          </span>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="glass-panel p-4 border-slate-800/80">
          <p className="text-2xl font-black text-white">{stats.total}</p>
          <p className="text-xs font-medium text-slate-400 mt-1">All Petitions</p>
        </div>
        <div className="glass-panel p-4 border-slate-800/80">
          <p className="text-2xl font-black text-sky-400">{stats.sent}</p>
          <p className="text-xs font-medium text-slate-400 mt-1">New / Submitted</p>
        </div>
        <div className="glass-panel p-4 border-slate-800/80">
          <p className="text-2xl font-black text-amber-400">{stats.inProgress}</p>
          <p className="text-xs font-medium text-slate-400 mt-1">In Progress</p>
        </div>
        <div className="glass-panel p-4 border-slate-800/80">
          <p className="text-2xl font-black text-emerald-400">{stats.resolved}</p>
          <p className="text-xs font-medium text-slate-400 mt-1">Resolved</p>
        </div>
        <div className="glass-panel p-4 border-slate-800/80 col-span-2 sm:col-span-1">
          <p className="text-2xl font-black text-rose-400">{stats.rejected}</p>
          <p className="text-xs font-medium text-slate-400 mt-1">Rejected</p>
        </div>
      </div>

      {/* Filter/Sort Bar */}
      <div className="glass-panel p-4 border-slate-800/80">
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <FiFilter className="w-3.5 h-3.5" />
            <span>Filter Queue:</span>
          </div>
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className="w-full sm:w-44"
          />
          <CustomSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
            className="w-full sm:w-44"
          />
          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto justify-end">
            <button
              onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:border-slate-600 transition-colors"
            >
              {sortBy === 'newest' ? <FiArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <FiArrowDown className="w-3.5 h-3.5 text-blue-400" />}
              {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
      </div>

      {/* Grievance Queue */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <GlassCard className="border-slate-800">
            <div className="text-center py-16">
              <FiFileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 text-sm font-semibold">No grievances match the filter criteria</p>
              <p className="text-slate-500 text-xs mt-1">Try resetting the status or priority filter.</p>
            </div>
          </GlassCard>
        ) : (
          filteredComplaints.map((complaint) => {
            const imageEvidence = complaint.evidence?.filter((e) => e.type === 'IMAGE') || []
            const videoEvidence = complaint.evidence?.filter((e) => e.type === 'VIDEO') || []

            return (
              <div key={complaint.id} className="glass-panel p-5 border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Column: Complaint Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
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
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          priorityColors[complaint.priority] || priorityColors.LOW
                        }`}
                      >
                        {complaint.priority}
                      </span>
                      <span className="text-slate-500 text-xs ml-auto">
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>

                    <p className="text-slate-200 text-sm line-clamp-2 mb-3 leading-relaxed">
                      {complaint.description}
                    </p>

                    {/* Complainant Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 mb-3">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Citizen</span>
                        <span className="font-medium truncate block">{complaint.userName || 'Anonymous'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Contact Phone</span>
                        <span className="font-medium truncate block">{complaint.userMobile || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Email</span>
                        <span className="font-medium truncate block">{complaint.userEmail || 'Not available'}</span>
                      </div>
                    </div>

                    {/* Evidence Thumbnails */}
                    {(imageEvidence.length > 0 || videoEvidence.length > 0) && (
                      <div className="flex gap-2 mb-3 overflow-x-auto py-1">
                        {imageEvidence.slice(0, 3).map((evidence, index) => (
                          <img
                            key={`img-${index}`}
                            src={evidence.filePath}
                            alt={`Evidence ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-700 hover:border-indigo-400 transition-colors cursor-pointer shrink-0"
                            onClick={() => window.open(evidence.filePath, '_blank')}
                          />
                        ))}
                        {videoEvidence.slice(0, 2).map((evidence, index) => (
                          <video
                            key={`vid-${index}`}
                            src={evidence.filePath}
                            className="w-16 h-16 object-cover rounded-lg border border-slate-700 shrink-0 bg-black"
                          />
                        ))}
                        {(imageEvidence.length + videoEvidence.length) > 3 && (
                          <div className="w-16 h-16 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-center text-slate-400 text-xs shrink-0 font-medium">
                            +{(imageEvidence.length + videoEvidence.length) - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {complaint.locationAddress && (
                      <p className="text-xs text-slate-400 truncate">
                        📍 {complaint.locationAddress.split(',').slice(0, 3).join(',')}
                      </p>
                    )}
                  </div>

                  {/* Right Column: Admin Actions */}
                  <div className="flex flex-col gap-2.5 lg:w-56 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="flex flex-row sm:flex-col gap-2">
                      <NeonButton
                        variant="admin"
                        onClick={() => navigate(`/admin/complaints/${complaint.complaintId}`)}
                        className="flex-1 sm:flex-none text-xs py-2 inline-flex items-center gap-1.5"
                      >
                        <FiEye className="w-3.5 h-3.5" /> Full Review
                      </NeonButton>
                      <div className="flex gap-2 flex-1 sm:flex-none">
                        <a
                          href={complaint.userMobile ? `tel:${complaint.userMobile}` : undefined}
                          className={`flex-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-1 text-xs ${
                            !complaint.userMobile ? 'opacity-40 pointer-events-none' : ''
                          }`}
                        >
                          <FiPhone className="w-3.5 h-3.5 text-blue-400" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${complaint.userEmail || complaint.userId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-200 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-1 text-xs"
                        >
                          <FiMail className="w-3.5 h-3.5 text-blue-400" />
                          <span>Email</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-slate-400 text-[11px] font-semibold block mb-1">Update Status:</span>
                      <CustomSelect
                        value={complaint.status}
                        onChange={(value) => handleStatusUpdate(complaint.id, value)}
                        options={cardStatusOptions}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
