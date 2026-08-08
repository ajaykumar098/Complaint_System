import { useState } from 'react'
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiSearch, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'SENT':
        return 'text-neon-blue'
      case 'IN_PROGRESS':
        return 'text-yellow-400'
      case 'RESOLVED':
        return 'text-green-400'
      case 'REJECTED':
        return 'text-red-400'
      case 'CANCELLED':
        return 'text-gray-400'
      default:
        return 'text-white'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <FiCheckCircle />
      case 'IN_PROGRESS':
        return <FiClock />
      default:
        return <FiAlertCircle />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Your Information Section */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-neon-blue/20">
              <FiUser className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Information</h2>
              <p className="text-white/50 text-sm">Manage your personal details</p>
            </div>
          </div>
          {!isEditing ? (
            <NeonButton variant="outline" onClick={handleEdit} className="text-sm py-2 px-4">
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </NeonButton>
          ) : (
            <div className="flex gap-2">
              <NeonButton variant="outline" onClick={handleCancel} className="text-sm py-2 px-4">
                <FiX className="w-4 h-4 mr-2" />
                Cancel
              </NeonButton>
              <NeonButton onClick={handleSave} disabled={saving} className="text-sm py-2 px-4">
                <FiSave className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </NeonButton>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="p-2 rounded-lg bg-neon-purple/20 mt-1">
              <FiUser className="w-5 h-5 text-neon-purple" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedInfo.name}
                  onChange={(e) => setEditedInfo({ ...editedInfo, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
                />
              ) : (
                <p className="text-white">{currentUser?.name || 'N/A'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="p-2 rounded-lg bg-neon-blue/20 mt-1">
              <FiMail className="w-5 h-5 text-neon-blue" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedInfo.email}
                  onChange={(e) => setEditedInfo({ ...editedInfo, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
                />
              ) : (
                <p className="text-white">{currentUser?.email || 'N/A'}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="p-2 rounded-lg bg-neon-green/20 mt-1">
              <FiPhone className="w-5 h-5 text-neon-green" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/70 mb-1">Mobile Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedInfo.mobile}
                  onChange={(e) => setEditedInfo({ ...editedInfo, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-neon-blue/50 transition-colors"
                />
              ) : (
                <p className="text-white">{currentUser?.mobile || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Track Application Section */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-neon-green/20">
            <FiSearch className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Track Application</h2>
            <p className="text-white/50 text-sm">Search for your complaint status</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={searchComplaintId}
            onChange={(e) => setSearchComplaintId(e.target.value)}
            placeholder="Enter Complaint ID (e.g., CMP-2026-00001)"
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
          />
          <NeonButton onClick={handleSearchComplaint} disabled={searching} className="px-6">
            {searching ? 'Searching...' : 'Search'}
          </NeonButton>
        </div>

        {complaintStatus && (
          <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm">Complaint ID</p>
                <p className="text-white font-medium">{complaintStatus.complaintId}</p>
              </div>
              <div className={`flex items-center gap-2 ${getStatusColor(complaintStatus.status)}`}>
                {getStatusIcon(complaintStatus.status)}
                <span className="font-medium">{complaintStatus.status}</span>
              </div>
            </div>

            <div>
              <p className="text-white/50 text-sm">Description</p>
              <p className="text-white">{complaintStatus.description}</p>
            </div>

            <div>
              <p className="text-white/50 text-sm">Submitted On</p>
              <p className="text-white">
                {new Date(complaintStatus.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
