import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCamera, FiUpload, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import { useCamera } from '../hooks/useCamera'
import { useGeolocation } from '../hooks/useGeolocation'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const API_BASE = 'http://localhost:8080/api'

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
  const [cameraMode, setCameraMode] = useState('photo') // 'photo' or 'video'
  const [imageMode, setImageMode] = useState('capture') // 'capture' or 'upload'
  const [videoMode, setVideoMode] = useState('capture') // 'capture' or 'upload'
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
    
    // Fetch location when camera opens
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
    <div className="max-w-3xl mx-auto">
      <GlassCard>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Report a Complaint
          </h1>
          <p className="text-white/50 mt-2">
            Submit your complaint securely. We'll review and take appropriate action.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Citizen Info */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-sm">
                1
              </span>
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
                <div className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60">
                  {currentUser?.name || 'Not logged in'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Mobile Number</label>
                <div className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60">
                  {currentUser?.mobile || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                <div className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60">
                  {currentUser?.email || 'Not logged in'}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Complaint Description */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-sm">
                2
              </span>
              Complaint Description
            </h2>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors resize-none"
                placeholder="Describe your complaint clearly. Include what happened, where it happened, when it happened, nearby landmarks, and any important details that will help resolve the issue."
              />
              <div className="flex justify-between items-center mt-2">
                <p className={`text-xs ${descriptionValid ? 'text-green-400' : 'text-white/40'}`}>
                  {description.length}/20 minimum characters
                </p>
                {!descriptionValid && description.length > 0 && (
                  <p className="text-xs text-red-400">Description must be at least 20 characters</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Capture Evidence */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-sm">
                3
              </span>
              Evidence
            </h2>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/70">Images</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('capture')
                      handleOpenCameraModal('photo')
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      imageMode === 'capture'
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <FiCamera className="inline mr-1" /> Capture Live
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('upload')
                      fileInputRef.current?.click()
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      imageMode === 'upload'
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <FiUpload className="inline mr-1" /> Upload File
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(img.file)}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-white/10"
                      />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium bg-black/60 text-white/80">
                        {img.locationType === 'embedded' ? '📍 Embedded' : img.locationType === 'attached' ? '📍 Attached' : 'No location'}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/70">Videos</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoMode('capture')
                      handleOpenCameraModal('video')
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      videoMode === 'capture'
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <FiCamera className="inline mr-1" /> Record Live
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoMode('upload')
                      videoFileInputRef.current?.click()
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      videoMode === 'upload'
                        ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                        : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <FiUpload className="inline mr-1" /> Upload File
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {videos.map((vid, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={URL.createObjectURL(vid.file)}
                        className="w-full h-20 object-cover rounded-lg border border-white/10"
                      />
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium bg-black/60 text-white/80">
                        {vid.locationType === 'attached' ? '📍 Attached' : 'No location'}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Priority */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-sm">
                4
              </span>
              Priority Level
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                    priority === level
                      ? level === 'Low'
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : level === 'Medium'
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                        : 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>

          {/* Section 5: Submit */}
          <section className="pt-4">
            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <NeonButton
              type="submit"
              disabled={submitting || !descriptionValid}
              className="w-full py-3 text-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Complaint'}
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-base border border-white/10 rounded-xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {cameraMode === 'photo' ? 'Take Photo' : 'Record Video'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera()
                    setShowCameraModal(false)
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {cameraError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {cameraError}
                </div>
              )}

              {cameraLocationLoading && (
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-4">
                  <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                  Fetching location...
                </div>
              )}

              <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ height: '300px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {recording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-sm">Recording</span>
                  </div>
                )}
                {!cameraLocationReady && !cameraLocationLoading && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-yellow-500/80 px-3 py-1 rounded-full">
                    <FiAlertCircle className="w-4 h-4" />
                    <span className="text-white text-sm">Location unavailable</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                {cameraMode === 'photo' ? (
                  <NeonButton
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={!cameraLocationReady && !cameraLocationLoading}
                    className="flex items-center gap-2"
                  >
                    <FiCamera /> Capture Photo
                  </NeonButton>
                ) : (
                  <>
                    {!recording ? (
                      <NeonButton
                        type="button"
                        onClick={handleStartRecording}
                        className="flex items-center gap-2"
                      >
                        <FiCamera /> Start Recording
                      </NeonButton>
                    ) : (
                      <NeonButton
                        type="button"
                        onClick={handleStopRecording}
                        variant="danger"
                        className="flex items-center gap-2"
                      >
                        <FiX /> Stop Recording
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-base border border-white/10 rounded-xl p-8 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <FiCheck className="w-10 h-10 text-green-400" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-2">Complaint Submitted!</h3>
              <p className="text-white/60 mb-4">Your complaint has been recorded successfully.</p>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-white/50 mb-1">Complaint ID</p>
                <p className="text-xl font-mono text-neon-blue">{generatedId}</p>
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
