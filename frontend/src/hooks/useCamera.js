import { useState, useCallback, useRef } from 'react'

export function useCamera() {
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [recording, setRecording] = useState(false)
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: true 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions in your browser settings.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [stream])

  const capturePhoto = useCallback((locationData = null) => {
    if (!videoRef.current) return null

    const video = videoRef.current

    // Guard against capturing before the video stream actually has a frame
    if (!video.videoWidth || !video.videoHeight) {
      setError('Camera not ready yet. Please wait a moment and try again.')
      return null
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    // Draw the video frame
    ctx.drawImage(video, 0, 0)

    // Add watermark overlay
    const watermarkHeight = Math.max(60, canvas.height * 0.15)
    const overlayY = canvas.height - watermarkHeight

    // Semi-transparent dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, overlayY, canvas.width, watermarkHeight)

    // Watermark text
    ctx.fillStyle = '#ffffff'
    ctx.font = `${Math.max(12, watermarkHeight * 0.35)}px Arial`
    ctx.textBaseline = 'middle'

    const timestamp = new Date().toLocaleString()
    let locationText = ''

    if (locationData && locationData.address) {
      const shortAddress = locationData.address.split(',').slice(0, 2).join(',')
      locationText = `${shortAddress} | ${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}`
    } else {
      locationText = 'Location unavailable'
    }

    // Draw timestamp
    ctx.fillText(timestamp, 10, overlayY + watermarkHeight * 0.3)

    // Draw location
    ctx.fillText(locationText, 10, overlayY + watermarkHeight * 0.7)

    return canvas.toDataURL('image/jpeg', 0.9)
  }, [])

  const startRecording = useCallback(() => {
    if (!stream) return null

    try {
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      setError('Failed to start recording. Please try again.')
    }
  }, [stream])

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        setRecording(false)
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        if (blob.size === 0) {
          resolve(null)
          return
        }
        const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' })
        resolve(file)
      }

      recorder.stop()
    })
  }, [])

  return { 
    stream, 
    error, 
    videoRef, 
    recording, 
    startCamera, 
    stopCamera, 
    capturePhoto, 
    startRecording, 
    stopRecording 
  }
}
