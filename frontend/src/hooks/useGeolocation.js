import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )
      const data = await response.json()
      if (data.display_name) {
        setAddress(data.display_name)
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
    }
  }, [])

  const getLocation = useCallback(() => {
    setLoading(true)
    setError(null)
    setAddress(null)
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(coords)
        await reverseGeocode(coords.lat, coords.lng)
        setLoading(false)
      },
      (err) => {
        setError('Location access denied. Please enable location permissions in your browser settings.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [reverseGeocode])

  return { position, address, error, loading, getLocation }
}
