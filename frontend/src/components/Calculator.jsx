import { useState } from 'react'

export default function Calculator() {

  const offences = [

    {
      name: 'Helmet Violation',
    },

    {
      name: 'Triple Riding',
    },

    {
      name: 'Mobile While Driving',
    },

    {
      name: 'No Insurance',
    },

    {
      name: 'Seat Belt Violation',
    },

    {
      name: 'Drunk Driving',
    },

  ]

  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)

  const [repeatOffence, setRepeatOffence] =
    useState(false)

  const [isOffline, setIsOffline] =
    useState(false)

  const toggleOffence = async (offence) => {

    try {

      // OFFLINE SIMULATION

      if (isOffline) {

        throw new Error('Offline')

      }

      const response = await fetch(
        'https://drivelegal-backend.onrender.com/api/challan',
        {

          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({

            violation: offence.name,

            vehicle_type: 'Bike',

            state: 'Tamil Nadu',

            is_repeat: repeatOffence,

          }),
        }
      )

      const data = await response.json()

      if (data.status === 'ok') {

        setSelected((prev) => [
          ...prev,
          data,
        ])

        setResult(data)

      }

    } catch (error) {

      setIsOffline(true)

      setResult({

        violation: offence.name,

        law_section: 'Offline Mode',

        base_fine: 0,

        court_fee: 0,

        state: 'Unavailable',

        notes:
          '⚠ DriveLegal is currently offline. Previously calculated challans remain available.',

      })

    }
  }

  const total = selected.reduce(
    (sum, item) => sum + item.total,
    0
  )

  return (

    <div
      className="
        bg-[#1b2138]
        border
        border-gray-700
        rounded-3xl
        p-8
        shadow-2xl
        mt-8
      "
    >

      {/* OFFLINE BANNER */}

      {isOffline && (

        <div
          className="
            bg-orange-500
            text-white
            text-center
            py-3
            rounded-2xl
            font-bold
            mb-6
          "
        >
          ⚠ Offline Mode Enabled
        </div>

      )}

      {/* TITLE */}

      <div className="flex items-center justify-between mb-6">

        <h2
          className="
            text-3xl
            font-bold
            text-pink-400
          "
        >
          🧮 Challan Calculator
        </h2>

        {/* OFFLINE BUTTON */}

        <button
          onClick={() =>
            setIsOffline(!isOffline)
          }

          className="
            bg-orange-500
            hover:bg-orange-600
            px-4
            py-2
            rounded-xl
            text-white
            font-semibold
            transition
          "
        >

          {isOffline
            ? 'Disable Offline Simulation'
            : 'Simulate Offline Mode'}

        </button>

      </div>

      {/* REPEAT TOGGLE */}

      <div
        className="
          flex
          items-center
          gap-3
          mb-6
        "
      >

        <input
          type="checkbox"

          checked={repeatOffence}

          onChange={() =>
            setRepeatOffence(!repeatOffence)
          }

          className="
            w-5
            h-5
          "
        />

        <p className="text-lg text-yellow-300">
          Repeat Offence
        </p>

      </div>

      {/* OFFENCES */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        "
      >

        {offences.map((offence, idx) => (

          <button
            key={idx}

            onClick={() =>
              toggleOffence(offence)
            }

            className="
              p-4
              rounded-2xl
              border
              text-left
              transition
              bg-[#242c49]
              border-gray-700
              hover:border-pink-500
              hover:bg-[#2f3a63]
            "
          >

            <p className="text-lg font-semibold">
              {offence.name}
            </p>

          </button>

        ))}

      </div>

      {/* RESULT */}

      <div
        className="
          mt-8
          bg-[#242c49]
          rounded-2xl
          p-6
        "
      >

        <h3
          className="
            text-2xl
            font-bold
            text-green-400
          "
        >
          Total Fine: ₹{total}
        </h3>

        {result && (

          <div className="mt-5 space-y-3">

            <p>
              🚦 Violation:
              {' '}
              {result.violation}
            </p>

            <p>
              📘 Section:
              {' '}
              {result.law_section}
            </p>

            <p>
              💰 Base Fine:
              {' '}
              ₹{result.base_fine}
            </p>

            <p>
              🏛 Court Fee:
              {' '}
              ₹{result.court_fee}
            </p>

            <p>
              ⚠ State:
              {' '}
              {result.state}
            </p>

            <p>
              🔁 Repeat Offence:
              {' '}
              {repeatOffence ? 'Yes' : 'No'}
            </p>

            <p>
              📝 Notes:
              {' '}
              {result.notes}
            </p>

          </div>

        )}

      </div>

      {/* ANALYTICS */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >

        <div
          className="
            bg-[#242c49]
            rounded-2xl
            p-5
            text-center
          "
        >

          <p className="text-gray-400 mb-2">
            📍 Supported States
          </p>

          <h3 className="text-3xl font-bold text-pink-400">
            4
          </h3>

        </div>

        <div
          className="
            bg-[#242c49]
            rounded-2xl
            p-5
            text-center
          "
        >

          <p className="text-gray-400 mb-2">
            🚨 Total Violations
          </p>

          <h3 className="text-3xl font-bold text-yellow-400">
            48+
          </h3>

        </div>

        <div
          className="
            bg-[#242c49]
            rounded-2xl
            p-5
            text-center
          "
        >

          <p className="text-gray-400 mb-2">
            ⚠ High Risk Offences
          </p>

          <h3 className="text-3xl font-bold text-red-400">
            18
          </h3>

        </div>

      </div>

    </div>
  )
}