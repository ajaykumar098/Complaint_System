import { useState } from 'react'
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiSearch, FiClock, FiCheckCircle, FiAlertCircle, FiShield } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const statusStyles = {
  SENT: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  IN_PROGRESS: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  RESOLVED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  REJECTED: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  CANCELLED: 'text-slate-400 bg-slate-800 border-slate-700',
}

export default function Profile() {
  const { currentUser, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedInfo, setEditedInfo] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    mobile: currentUser?.mobile || ''
  })
  const [searchComplaintId, setSearchComplaintId] = useState('')
  const [complaintStatus, setComplaintStatus] = useState(null)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedInfo({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      mobile: currentUser?.mobile || ''
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUser(editedInfo.name, editedInfo.email, editedInfo.mobile)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSearchComplaint = async () => {
    if (!searchComplaintId.trim()) return

    setSearching(true)
    try {
      const res = await fetch(`${API_BASE}/complaints/by-complaint-id/${searchComplaintId}`)
      if (!res.ok) {
        if (res.status === 404) {
          alert('Complaint not found. Please check the ID and try again.')
          setComplaintStatus(null)
          return
        }
        throw new Error('Failed to fetch complaint')
      }
      const data = await res.json()
      setComplaintStatus(data)
    } catch (error) {
      console.error('Error searching complaint:', error)
      alert('Failed to search complaint. Please try again.')
      setComplaintStatus(null)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      {/* Citizen Information Section */}
      <GlassCard className="border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Citizen Profile</h2>
              <p className="text-slate-400 text-xs">Manage your registered personal and contact details</p>
            </div>
          </div>
          {!isEditing ? (
            <NeonButton variant="outline" onClick={handleEdit} className="text-xs py-2 px-3.5 inline-flex items-center gap-1.5">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit Profile
            </NeonButton>
          ) : (
            <div className="flex gap-2">
              <NeonButton variant="outline" onClick={handleCancel} className="text-xs py-2 px-3 inline-flex items-center gap-1.5">
                <FiX className="w-3.5 h-3.5" /> Cancel
              </NeonButton>
              <NeonButton onClick={handleSave} disabled={saving} className="text-xs py-2 px-3.5 inline-flex items-center gap-1.5">
                <FiSave className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
              </NeonButton>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
              <FiUser className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Full Legal Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedInfo.name}
                  onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white font-medium text-sm">{currentUser?.name || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <FiMail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedInfo.email}
                  onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white font-medium text-sm">{currentUser?.email || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <FiPhone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Registered Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedInfo.mobile}
                  onChange={(e) => setEditedInfo({ ...editedInfo, mobile: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white font-medium text-sm">{currentUser?.mobile || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Track Grievance by ID Section */}
      <GlassCard className="border-slate-800">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FiSearch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Direct Grievance Lookup</h2>
            <p className="text-slate-400 text-xs">Verify current investigation status using an official Complaint Tracking ID</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={searchComplaintId}
            onChange={(e) => setSearchComplaintId(e.target.value)}
            placeholder="Enter Complaint ID (e.g., CMP-2026-00001)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          <NeonButton onClick={handleSearchComplaint} disabled={searching} className="px-6 text-xs py-2.5">
            {searching ? 'Looking up...' : 'Lookup Status'}
          </NeonButton>
        </div>

        {complaintStatus && (
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900">
              <div>
                <p className="text-slate-400 text-xs font-semibold">Complaint Tracking ID</p>
                <p className="text-white font-mono font-bold text-base mt-0.5">{complaintStatus.complaintId}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[complaintStatus.status] || 'text-white bg-slate-800 border-slate-700'}`}>
                {complaintStatus.status}
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold mb-1">Grievance Summary</p>
              <p className="text-slate-200 text-sm leading-relaxed">{complaintStatus.description}</p>
            </div>

            <div className="text-xs text-slate-500">
              Registered Date:{' '}
              <span className="text-slate-300">
                {new Date(complaintStatus.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
