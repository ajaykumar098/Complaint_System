import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCamera, FiUpload, FiX, FiCheck, FiAlertCircle, FiShield, FiFileText, FiMapPin } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import { useCamera } from '../hooks/useCamera'
import { useGeolocation } from '../hooks/useGeolocation'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

export default function ReportComplaint() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { position, address, error: geoError, loading: geoLoading, getLocation } = useGeolocation()
  const { 
    stream, 
    error: cameraError, 
    videoRef, 
    recording, 
    startCamera, 
    stopCamera, 
    capturePhoto, 
    startRecording, 
    stopRecording 
  } = useCamera()

  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [images, setImages] = useState([])
  const [videos, setVideos] = useState([])
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [cameraMode, setCameraMode] = useState('photo')
  const [imageMode, setImageMode] = useState('capture')
  const [videoMode, setVideoMode] = useState('capture')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedId, setGeneratedId] = useState('')
  const [cameraLocationLoading, setCameraLocationLoading] = useState(false)
  const [cameraLocationReady, setCameraLocationReady] = useState(false)

  const fileInputRef = useRef(null)
  const videoFileInputRef = useRef(null)

  const handleOpenCameraModal = async (mode) => {
    setCameraMode(mode)
    setShowCameraModal(true)
    setCameraLocationLoading(true)
    setCameraLocationReady(false)
    
    await getLocation()
    setCameraLocationLoading(false)
    setCameraLocationReady(true)
    
    startCamera()
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const filesWithLocation = files.map((file) => ({
      file,
      location: position ? { lat: position.lat, lng: position.lng, address } : null,
      locationType: position ? 'attached' : 'none',
    }))
    setImages((prev) => [...prev, ...filesWithLocation])
  }

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files)
    const filesWithLocation = files.map((file) => ({
      file,
      location: position ? { lat: position.lat, lng: position.lng, address } : null,
      locationType: position ? 'attached' : 'none',
    }))
    setVideos((prev) => [...prev, ...filesWithLocation])
  }

  const handleCapturePhoto = () => {
    const locationData = position ? { lat: position.lat, lng: position.lng, address } : null
    const dataUrl = capturePhoto(locationData)
    if (dataUrl) {
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
          setImages((prev) => [...prev, {
            file,
            location: locationData,
            locationType: locationData ? 'embedded' : 'none',
          }])
          stopCamera()
          setShowCameraModal(false)
        })
    }
  }

  const handleStartRecording = () => {
    startRecording()
  }

  const handleStopRecording = async () => {
    const file = await stopRecording()
    const locationData = position ? { lat: position.lat, lng: position.lng, address } : null
    if (file) {
      setVideos((prev) => [...prev, {
        file,
        location: locationData,
        locationType: locationData ? 'attached' : 'none',
      }])
      stopCamera()
      setShowCameraModal(false)
    } else {
      setSubmitError('Video recording failed or was too short. Please try again.')
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (description.length < 20) {
      setSubmitError('Description must be at least 20 characters long.')
      return
    }

    if (!priority) {
      setSubmitError('Please select a priority level.')
      return
    }

    if (!currentUser?.id) {
      setSubmitError('You must be logged in to submit a complaint.')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('description', description)
      formData.append('priority', priority.toUpperCase())
      formData.append('userId', currentUser.id)
      formData.append('userName', currentUser.name || '')
      if (currentUser.mobile) {
        formData.append('userMobile', currentUser.mobile)
      }
      if (currentUser.email) {
        formData.append('userEmail', currentUser.email)
      }
      if (address) {
        formData.append('locationAddress', address)
      }
      if (position?.lat) {
        formData.append('locationLat', position.lat)
      }
      if (position?.lng) {
        formData.append('locationLng', position.lng)
      }

      images.forEach((img) => {
        formData.append('evidenceFiles', img.file)
      })
      videos.forEach((vid) => {
        formData.append('evidenceFiles', vid.file)
      })

      const res = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || 'Failed to submit complaint')
      }

      const created = await res.json()
      setGeneratedId(created.complaintId)
      setShowSuccess(true)
    } catch (err) {
      console.error('Failed to submit complaint:', err)
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setDescription('')
    setPriority('Medium')
    setImages([])
    setVideos([])
    setShowSuccess(false)
    setGeneratedId('')
    getLocation()
  }

  const descriptionValid = description.length >= 20

  return (
    <div className="max-w-4xl mx-auto px-4">
      <GlassCard className="border-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <FiShield className="w-3.5 h-3.5" /> Official Grievance Filing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Register a Public Grievance
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Provide comprehensive details and evidence for official investigation and rapid resolution.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Citizen Info */}
          <section className="space-y-3.5">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                1
              </span>
              Complainant Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm">
                  {currentUser?.name || 'Not logged in'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Registered Mobile</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm">
                  {currentUser?.mobile || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm truncate">
                  {currentUser?.email || 'Not logged in'}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Complaint Description */}
          <section className="space-y-3.5">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Grievance Description
            </h2>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                placeholder="Describe your complaint clearly. Include what happened, location, landmarks, timeline, and any specifics to expedite verification."
              />
              <div className="flex justify-between items-center mt-2 px-1">
                <p className={`text-xs ${descriptionValid ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {description.length} / 20 minimum characters
                </p>
                {!descriptionValid && description.length > 0 && (
                  <p className="text-xs text-rose-400 font-medium">Please enter at least 20 characters</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Capture Evidence */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              Supporting Evidence
            </h2>

            {/* Images */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Photo Evidence</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('capture')
                      handleOpenCameraModal('photo')
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      imageMode === 'capture'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FiCamera className="w-3.5 h-3.5" /> Capture Live
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('upload')
                      fileInputRef.current?.click()
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      imageMode === 'upload'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FiUpload className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <img
                        src={URL.createObjectURL(img.file)}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/75 text-slate-200">
                        {img.locationType === 'embedded' ? '📍 GPS Verified' : img.locationType === 'attached' ? '📍 Attached' : 'No GPS'}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center opacity-90 transition-opacity"
                      >
                        <FiX className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Video Evidence</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoMode('capture')
                      handleOpenCameraModal('video')
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      videoMode === 'capture'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FiCamera className="w-3.5 h-3.5" /> Record Live
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoMode('upload')
                      videoFileInputRef.current?.click()
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      videoMode === 'upload'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-300 border border-slate-700/60 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <FiUpload className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>

              {videos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {videos.map((vid, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <video
                        src={URL.createObjectURL(vid.file)}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/75 text-slate-200">
                        {vid.locationType === 'attached' ? '📍 GPS Verified' : 'No GPS'}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center opacity-90 transition-opacity"
                      >
                        <FiX className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Priority */}
          <section className="space-y-3.5">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs font-bold">
                4
              </span>
              Urgency / Priority Level
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {[
                { level: 'Low', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
                { level: 'Medium', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
                { level: 'High', color: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
              ].map(({ level, color }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    priority === level
                      ? `${color} ring-1 ring-current shadow-sm`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>

          {/* Section 5: Submit */}
          <section className="pt-2">
            {submitError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{submitError}</span>
              </div>
            )}

            <NeonButton
              type="submit"
              disabled={submitting || !descriptionValid}
              className="w-full py-3 text-base shadow-lg"
            >
              {submitting ? 'Submitting Grievance...' : 'Submit Complaint'}
            </NeonButton>
          </section>
        </form>
      </GlassCard>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCameraModal && (
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
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FiCamera className="text-blue-400" />
                  {cameraMode === 'photo' ? 'Capture Verified Photo' : 'Record Verified Video'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera()
                    setShowCameraModal(false)
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {cameraError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {cameraLocationLoading && (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-4">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Acquiring GPS coordinates for evidence authenticity...
                </div>
              )}

              <div className="relative bg-black rounded-xl overflow-hidden mb-4 border border-slate-800" style={{ height: '320px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {recording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                    Recording in Progress
                  </div>
                )}
                {!cameraLocationReady && !cameraLocationLoading && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-amber-500/90 text-slate-950 px-3 py-1 rounded-full text-xs font-medium">
                    <FiAlertCircle className="w-3.5 h-3.5" />
                    <span>GPS Signal Weak</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                {cameraMode === 'photo' ? (
                  <NeonButton
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={!cameraLocationReady && !cameraLocationLoading}
                    className="flex items-center gap-2 px-6"
                  >
                    <FiCamera className="w-4 h-4" /> Capture Photo
                  </NeonButton>
                ) : (
                  <>
                    {!recording ? (
                      <NeonButton
                        type="button"
                        onClick={handleStartRecording}
                        className="flex items-center gap-2 px-6"
                      >
                        <FiCamera className="w-4 h-4" /> Start Recording
                      </NeonButton>
                    ) : (
                      <NeonButton
                        type="button"
                        onClick={handleStopRecording}
                        variant="danger"
                        className="flex items-center gap-2 px-6"
                      >
                        <FiX className="w-4 h-4" /> Stop Recording
                      </NeonButton>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
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
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FiCheck className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-white mb-1.5">Grievance Registered</h3>
              <p className="text-slate-400 text-xs mb-5">Your complaint has been submitted for official review.</p>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6">
                <p className="text-xs text-slate-400 mb-1">Official Complaint Tracking ID</p>
                <p className="text-lg font-mono font-bold text-blue-400 tracking-wider select-all">{generatedId}</p>
              </div>

              <div className="flex gap-3">
                <NeonButton
                  onClick={() => navigate('/my-complaints')}
                  className="flex-1"
                >
                  View My Complaints
                </NeonButton>
                <NeonButton
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Submit Another
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
