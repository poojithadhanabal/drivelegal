import { useState } from 'react'

const API =
  import.meta.env.VITE_API_URL ||
  'https://drivelegal-backend.onrender.com/api'

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

export default function Calculator({ location, setIsOnline }) {
  const [vehicle, setVehicle] = useState('Two-Wheeler')
  const [state, setState] = useState(location || 'Tamil Nadu')
  const [violation, setViolation] = useState('Helmet Violation')
  const [repeatOffence, setRepeatOffence] = useState(false)
  const [selectedOffences, setSelectedOffences] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ========================================
  // ADD OFFENCE
  // ========================================
  const addOffence = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API}/challan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violation,
          vehicle_type: vehicle,
          state,
          is_repeat: repeatOffence,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSelectedOffences((prev) => [...prev, data])
      }
    } catch {
      setIsOnline?.(false)
      setError('DriveLegal is offline.')
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
  const grandTotal = selectedOffences.reduce(
    (sum, item) => sum + item.total,
    0
  )

  return (
    <div className="calc-root">

      {/* ── HEADER ── */}
      <div className="calc-header">
        <div>
          <h1 className="calc-title">Challan Calculator</h1>
          <p className="calc-subtitle">Calculate traffic fines instantly</p>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="calc-filters">

        {/* Vehicle */}
        <div className="calc-filter-group">
          <label className="calc-filter-label">Vehicle Type</label>
          <select
            className="dl-select"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          >
            {VEHICLES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* State */}
        <div className="calc-filter-group">
          <label className="calc-filter-label">State</label>
          <select
            className="dl-select"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Offence */}
        <div className="calc-filter-group">
          <label className="calc-filter-label">Offence</label>
          <select
            className="dl-select"
            value={violation}
            onChange={(e) => setViolation(e.target.value)}
          >
            {VIOLATIONS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Repeat toggle */}
        <label className="calc-repeat-toggle">
          <input
            type="checkbox"
            checked={repeatOffence}
            onChange={(e) => setRepeatOffence(e.target.checked)}
          />
          <span className="calc-repeat-label">
            Repeat offence
            <span className="calc-repeat-note">(higher fine)</span>
          </span>
        </label>
      </div>

      {/* ── ADD BUTTON ── */}
      <button
        className="calc-add-btn"
        onClick={addOffence}
        disabled={loading}
      >
        {loading ? 'Calculating...' : '+ Add Offence'}
      </button>

      {/* ── ERROR ── */}
      {error && <div className="calc-error">{error}</div>}

      {/* ── OFFENCE LIST ── */}
      {selectedOffences.length > 0 && (
        <div className="calc-result">
          <h2 className="calc-result-title">Challan Summary</h2>

          {selectedOffences.map((item, index) => (
            <div key={index} className="calc-result-card">
              {/* Card header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {item.violation}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--n-400)', marginTop: 2 }}>
                    {item.state}
                  </div>
                </div>
                <button
                  onClick={() => removeOffence(index)}
                  style={{
                    background: 'var(--red-dim)',
                    border: '1px solid rgba(240,82,82,0.25)',
                    color: '#fca5a5',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                  }}
                >
                  Remove
                </button>
              </div>

              {/* Fee rows */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '12px 14px',
                  background: 'var(--n-750)',
                  borderRadius: 10,
                  border: '1px solid var(--n-700)',
                  marginBottom: 10,
                }}
              >
                {[
                  ['Base Fine', item.base_fine],
                  ['Court Fee', item.court_fee],
                  ['Processing Fee', item.processing_fee],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13,
                      color: 'var(--n-300)',
                    }}
                  >
                    <span>{label}</span>
                    <span style={{ fontFamily: 'var(--mono)' }}>₹{val}</span>
                  </div>
                ))}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    marginTop: 4,
                    borderTop: '1px solid var(--n-600)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--g-300)',
                  }}
                >
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>₹{item.total}</span>
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--n-400)',
                    background: 'var(--g-900)',
                    border: '1px solid var(--g-800)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    display: 'inline-block',
                    width: 'fit-content',
                  }}
                >
                  📘 {item.section}
                </div>
                <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 2 }}>
                  ⚠️ {item.risk_score}
                </div>
                <div style={{ fontSize: 12, color: 'var(--n-400)', marginTop: 2, lineHeight: 1.6 }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}

          {/* Grand total */}
          <div className="calc-grand-total">
            <span className="calc-grand-label">Grand Total</span>
            <span className="calc-grand-amount">₹{grandTotal}</span>
          </div>
        </div>
      )}
    </div>
  )
}