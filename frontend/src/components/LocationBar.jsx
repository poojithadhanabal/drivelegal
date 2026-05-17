import { useState, useEffect } from 'react'
import { useChatStore } from '../store/chatStore'

const STATES = [
  'National', 'Tamil Nadu', 'Delhi', 'Karnataka',
  'Maharashtra', 'Kerala', 'Telangana', 'Rajasthan'
]

export default function LocationBar({ onLocationChange }) {
  const { setLocation } = useChatStore()
  const [location, setLocation]   = useState('National')
  const [detecting, setDetecting] = useState(false)
  const [isOnline, setIsOnline]   = useState(navigator.onLine)

  // Track online/offline status
  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Auto-detect on first load
  useEffect(() => { detectLocation() }, [])

  const detectLocation = () => {
    setDetecting(true)
    if (!navigator.geolocation) { setDetecting(false); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocode using free API
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const state = data.address?.state || 'National'
          // Match to our known states
          const matched = STATES.find(s =>
            state.toLowerCase().includes(s.toLowerCase())
          ) || 'National'
          setLocation(matched)
          setLocation(matched)
          onLocationChange(matched)
        } catch { setDetecting(false) }
        setDetecting(false)
      },
      () => setDetecting(false)
    )
  }

  const handleChange = (e) => {
    setLocation(e.target.value)
    setLocation(e.target.value)
    onLocationChange(e.target.value)
    // Save to localStorage for offline use
    localStorage.setItem('drivelegal_location', e.target.value)
    localStorage.setItem('drivelegal_cache_date', new Date().toLocaleDateString())
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-wrap">
      {/* Offline banner */}
      {!isOnline && (
        <div className="w-full bg-orange-500 text-white text-xs px-3 py-1 rounded-lg text-center">
          ⚠️ Offline mode — showing cached data
          from {localStorage.getItem('drivelegal_cache_date') || 'last session'}
        </div>
      )}

      <span className="text-sm text-gray-500">📍 Your location:</span>

      <select
        value={location}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg px-3 py-1 text-sm
                   focus:outline-none focus:ring-2 focus:ring-green-500">
        {STATES.map(s => <option key={s}>{s}</option>)}
      </select>

      <button
        onClick={detectLocation}
        disabled={detecting}
        className="text-xs text-green-700 hover:text-green-900 underline disabled:opacity-50">
        {detecting ? 'Detecting...' : '🎯 Auto-detect'}
      </button>
    </div>
  )
}