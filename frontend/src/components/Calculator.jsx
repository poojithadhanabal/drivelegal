import { useState } from 'react'

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api'

const VEHICLES = [
  'Two-Wheeler',
  'Car / Jeep / Van',
  'Bus / Truck (HMV)',
  'Auto Rickshaw',
]

const STATES = [
  'Tamil Nadu',
  'Delhi',
  'Karnataka',
  'Maharashtra',
  'National',
]

const VIOLATIONS = [
  'Helmet Violation',
  'Triple Riding',
  'Mobile While Driving',
  'No Insurance',
  'Seat Belt Violation',
  'Drunk Driving',
  'Overspeeding',
  'Red Light Jump',
]

export default function Calculator({

  location,
  setIsOnline,

}) {

  const [vehicle, setVehicle] =
    useState('Two-Wheeler')

  const [state, setState] =
    useState(location || 'Tamil Nadu')

  const [violation, setViolation] =
    useState('Helmet Violation')

  const [repeatOffence, setRepeatOffence] =
    useState(false)

  const [selectedOffences, setSelectedOffences] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  // ========================================
  // ADD OFFENCE
  // ========================================

  const addOffence = async () => {

    setLoading(true)
    setError('')

    try {

      const res = await fetch(
        `${API}/challan`,
        {

          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            violation,

            vehicle_type: vehicle,

            state,

            is_repeat: repeatOffence,
          }),
        }
      )

      const data = await res.json()

      if (data.error) {

        setError(data.error)

      } else {

        setSelectedOffences(prev => [

          ...prev,

          data,
        ])
      }

    } catch {

      setIsOnline?.(false)

      setError(
        'DriveLegal is offline.'
      )

    }

    setLoading(false)
  }

  // ========================================
  // REMOVE OFFENCE
  // ========================================

  const removeOffence = (index) => {

    const updated = [...selectedOffences]

    updated.splice(index, 1)

    setSelectedOffences(updated)
  }

  // ========================================
  // TOTAL
  // ========================================

  const grandTotal =
    selectedOffences.reduce(

      (sum, item) => sum + item.total,

      0
    )

  return (

    <div className="calc-root">

      {/* HEADER */}

      <div className="calc-header">

        <div>

          <h1 className="calc-title">
            Challan Calculator
          </h1>

          <p className="calc-subtitle">
            Calculate traffic fines instantly
          </p>

        </div>

      </div>

      {/* FILTERS */}

      <div className="calc-filters">

        {/* VEHICLE */}

        <div className="calc-filter-group">

          <label className="calc-filter-label">
            Vehicle Type
          </label>

          <select
            className="dl-select"

            value={vehicle}

            onChange={(e) =>
              setVehicle(e.target.value)
            }
          >

            {VEHICLES.map(v => (

              <option key={v}>
                {v}
              </option>

            ))}

          </select>

        </div>

        {/* STATE */}

        <div className="calc-filter-group">

          <label className="calc-filter-label">
            State
          </label>

          <select
            className="dl-select"

            value={state}

            onChange={(e) =>
              setState(e.target.value)
            }
          >

            {STATES.map(s => (

              <option key={s}>
                {s}
              </option>

            ))}

          </select>

        </div>

        {/* OFFENCE */}

        <div className="calc-filter-group">

          <label className="calc-filter-label">
            Offence
          </label>

          <select
            className="dl-select"

            value={violation}

            onChange={(e) =>
              setViolation(e.target.value)
            }
          >

            {VIOLATIONS.map(v => (

              <option key={v}>
                {v}
              </option>

            ))}

          </select>

        </div>

        {/* REPEAT */}

        <label className="calc-repeat-toggle">

          <input
            type="checkbox"

            checked={repeatOffence}

            onChange={(e) =>
              setRepeatOffence(
                e.target.checked
              )
            }
          />

          <span className="calc-repeat-label">

            Repeat offence

            <span className="calc-repeat-note">
              (higher fine)
            </span>

          </span>

        </label>

      </div>

      {/* BUTTON */}

      <button
        className="calc-add-btn"

        onClick={addOffence}

        disabled={loading}
      >

        {loading

          ? 'Calculating...'

          : 'Add Offence'}

      </button>

      {/* ERROR */}

      {error && (

        <div className="calc-error">
          {error}
        </div>

      )}

      {/* OFFENCE LIST */}

      {selectedOffences.length > 0 && (

        <div className="calc-result">

          <h2 className="calc-result-title">
            Challan Summary
          </h2>

          {selectedOffences.map((item, index) => (

            <div
              key={index}

              className="calc-result-card"
            >

              <div className="
                flex
                justify-between
                items-center
              ">

                <div>

                  <h3 className="
                    text-xl
                    font-semibold
                  ">
                    {item.violation}
                  </h3>

                  <p className="
                    text-sm
                    opacity-70
                  ">
                    {item.state}
                  </p>

                </div>

                <button
                  onClick={() =>
                    removeOffence(index)
                  }

                  className="
                    text-red-400
                    text-sm
                  "
                >
                  Remove
                </button>

              </div>

              <div className="
                mt-4
                space-y-2
              ">

                <div className="
                  flex
                  justify-between
                ">
                  <span>
                    Base Fine
                  </span>

                  <span>
                    ₹{item.base_fine}
                  </span>
                </div>

                <div className="
                  flex
                  justify-between
                ">
                  <span>
                    Court Fee
                  </span>

                  <span>
                    ₹{item.court_fee}
                  </span>
                </div>

                <div className="
                  flex
                  justify-between
                ">
                  <span>
                    Processing Fee
                  </span>

                  <span>
                    ₹{item.processing_fee}
                  </span>
                </div>

                <div className="
                  flex
                  justify-between
                  font-bold
                  text-green-400
                  pt-2
                ">
                  <span>
                    Total
                  </span>

                  <span>
                    ₹{item.total}
                  </span>
                </div>

              </div>

              <div className="
                mt-4
                text-sm
                opacity-80
              ">

                📘 Section:
                {' '}
                {item.section}

              </div>

              <div className="
                mt-2
                text-sm
              ">

                ⚠️
                {' '}
                {item.risk_score}

              </div>

              <div className="
                mt-3
                text-sm
                opacity-80
              ">

                {item.description}

              </div>

            </div>

          ))}

          {/* GRAND TOTAL */}

          <div className="
            mt-6
            p-5
            rounded-2xl
            bg-[#182033]
            border
            border-green-500
          ">

            <div className="
              flex
              justify-between
              items-center
            ">

              <span className="
                text-xl
                font-bold
              ">
                Grand Total
              </span>

              <span className="
                text-3xl
                font-bold
                text-green-400
              ">
                ₹{grandTotal}
              </span>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}