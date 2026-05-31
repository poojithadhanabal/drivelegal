import { useState, useEffect } from 'react'
import { useChatStore } from '../store/chatStore'

// ✅ ONLY SUPPORTED STATES

const STATES = [

  'Central',

  'Tamil Nadu',

  'Delhi',

  'Karnataka',

  'Maharashtra',

  'UK',
]

export default function LocationBar({

  onLocationChange

}) {

  const {
    setLocation: setGlobalLocation
  } = useChatStore()

  const [location, setLocation] =
    useState('Central')

  const [detecting, setDetecting] =
    useState(false)

  const [isOnline, setIsOnline] =
    useState(navigator.onLine)

  // ========================================
  // ONLINE / OFFLINE STATUS
  // ========================================

  useEffect(() => {

    const updateStatus = () => {

      setIsOnline(
        navigator.onLine
      )
    }

    window.addEventListener(
      'online',
      updateStatus
    )

    window.addEventListener(
      'offline',
      updateStatus
    )

    updateStatus()

    return () => {

      window.removeEventListener(
        'online',
        updateStatus
      )

      window.removeEventListener(
        'offline',
        updateStatus
      )
    }

  }, [])

  // ========================================
  // AUTO DETECT LOCATION
  // ========================================

  useEffect(() => {

    detectLocation()

  }, [])

  const detectLocation = () => {

    setDetecting(true)

    if (!navigator.geolocation) {

      setDetecting(false)

      return
    }

    navigator.geolocation.getCurrentPosition(

      async (pos) => {

        try {

          const {
            latitude,
            longitude
          } = pos.coords

          // REVERSE GEOLOCATION

          const res = await fetch(

            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`

          )

          const data =
            await res.json()

          // RAW STATE

          const rawState =
            data.address?.state || ''

          // MATCH ONLY SUPPORTED STATES

          const matched =
            STATES.find(s =>

              rawState
                .toLowerCase()
                .includes(
                  s.toLowerCase()
                )

            ) || 'Central'

          setGlobalLocation(matched)

          setLocation(matched)

          onLocationChange?.(
            matched
          )

          // SAVE CACHE

          localStorage.setItem(
            'drivelegal_location',
            matched
          )

          localStorage.setItem(

            'drivelegal_cache_date',

            new Date()
              .toLocaleDateString()
          )

        } catch {

          setLocation('Central')

        }

        setDetecting(false)

      },

      () => {

        setLocation('Central')

        setDetecting(false)

      }

    )
  }

  // ========================================
  // MANUAL DROPDOWN CHANGE
  // ========================================

  const handleChange = (e) => {

    const selected =
      e.target.value

    setGlobalLocation(selected)

    setLocation(selected)

    onLocationChange?.(
      selected
    )

    // SAVE CACHE

    localStorage.setItem(

      'drivelegal_location',

      selected
    )

    localStorage.setItem(

      'drivelegal_cache_date',

      new Date()
        .toLocaleDateString()
    )
  }

  return (

    <div
      className="
        bg-[#141a2b]
        border
        border-[#27304a]
        rounded-2xl
        p-4
        space-y-3
      "
    >

      {/* OFFLINE BANNER */}

      {!isOnline && (

        <div
          className="
            bg-orange-500/20
            border
            border-orange-500/30
            text-orange-300
            text-xs
            px-3
            py-2
            rounded-xl
          "
        >

          ⚠️ Offline mode —
          showing cached data from
          {' '}
          {

            localStorage.getItem(
              'drivelegal_cache_date'
            ) || 'last session'

          }

        </div>

      )}

      {/* LABEL */}

      <div
        className="
          text-xs
          uppercase
          tracking-wide
          text-gray-400
        "
      >

        📍 Your State

      </div>

      {/* DROPDOWN */}

      <select

        value={location}

        onChange={handleChange}

        className="
          w-full
          bg-[#1d2438]
          border
          border-[#334155]
          rounded-xl
          px-4
          py-3
          text-white
          focus:outline-none
          focus:ring-2
          focus:ring-green-500
        "
      >

        {STATES.map((s) => (

          <option
            key={s}
            value={s}
          >

            {s}

          </option>

        ))}

      </select>

      {/* LIVE STATUS */}

      <div
        className="
          flex
          items-center
          justify-between
          text-xs
        "
      >

        <div
          className="
            flex
            items-center
            gap-2
            text-green-400
          "
        >

          <span
            className="
              w-2
              h-2
              rounded-full
              bg-green-400
            "
          />

          Live data

        </div>

        {/* AUTO DETECT */}

        <button

          onClick={detectLocation}

          disabled={detecting}

          className="
            text-green-400
            hover:text-green-300
            underline
            disabled:opacity-50
          "
        >

          {

            detecting

              ? 'Detecting...'

              : '🎯 Auto-detect'

          }

        </button>

      </div>

    </div>
  )
}