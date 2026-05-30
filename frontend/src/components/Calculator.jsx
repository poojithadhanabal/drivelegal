import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'https://drivelegal-backend.onrender.com'

const VIOLATIONS = [
  { name: 'Helmet Violation',      icon: '🪖', severity: 'high'   },
  { name: 'Triple Riding',         icon: '🏍️', severity: 'medium' },
  { name: 'Mobile While Driving',  icon: '📱', severity: 'high'   },
  { name: 'No Insurance',          icon: '📋', severity: 'high'   },
  { name: 'Seat Belt Violation',   icon: '🔒', severity: 'medium' },
  { name: 'Drunk Driving',         icon: '🍺', severity: 'severe' },
  { name: 'Overspeeding',          icon: '⚡', severity: 'high'   },
  { name: 'Red Light Jump',        icon: '🔴', severity: 'high'   },
]

const VEHICLES = ['Two-Wheeler', 'Car / Jeep / Van', 'Bus / Truck (HMV)', 'Auto Rickshaw']
const STATES   = ['Tamil Nadu', 'Delhi', 'Karnataka', 'Maharashtra', 'National']

const SEVERITY_COLORS = {
  severe: 'sev-severe',
  high:   'sev-high',
  medium: 'sev-medium',
  low:    'sev-low',
}

export default function Calculator({ location, setIsOnline }) {
  const [vehicle,       setVehicle]       = useState('Two-Wheeler')
  const [state,         setState]         = useState(location || 'Tamil Nadu')
  const [repeatOffence, setRepeatOffence] = useState(false)
  const [result,        setResult]        = useState(null)
  const [loading,       setLoading]       = useState(null)
  const [error,         setError]         = useState('')

  const calculate = async (offence) => {
    setLoading(offence.name)
    setError('')
    setResult(null)

    try {
      const res  = await fetch(`${API}/challan`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          violation:   offence.name,
          vehicle_type: vehicle,
          state,
          is_repeat:   repeatOffence,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult({ ...data, icon: offence.icon })
      }
    } catch {
      setIsOnline?.(false)
      setResult({
        violation:   offence.name,
        icon:        offence.icon,
        law_section: 'Offline Mode',
        base_fine:   0,
        court_fee:   0,
        total:       0,
        state:       'Unavailable',
        notes:       '⚠️ DriveLegal is offline. Connect to the internet for live data.',
      })
    }
    setLoading(null)
  }

  return (
    <div className="calc-root">

      {/* ── HEADER ── */}
      <div className="calc-header">
        <div>
          <h1 className="calc-title">Challan Calculator</h1>
          <p className="calc-subtitle">Select a violation to instantly calculate the fine</p>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="calc-filters">
        <div className="calc-filter-group">
          <label className="calc-filter-label">Vehicle Type</label>
          <select
            className="dl-select"
            value={vehicle}
            onChange={e => setVehicle(e.target.value)}
          >
            {VEHICLES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>

        <div className="calc-filter-group">
          <label className="calc-filter-label">State</label>
          <select
            className="dl-select"
            value={state}
            onChange={e => setState(e.target.value)}
          >
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <label className="calc-repeat-toggle">
          <input
            type="checkbox"
            checked={repeatOffence}
            onChange={e => setRepeatOffence(e.target.checked)}
          />
          <span className="calc-repeat-label">
            Repeat offence
            <span className="calc-repeat-note">(higher fine)</span>
          </span>
        </label>
      </div>

      {/* ── VIOLATION GRID ── */}
      <div className="calc-grid">
        {VIOLATIONS.map((v, i) => (
          <button
            key={i}
            className={`calc-card ${SEVERITY_COLORS[v.severity]} ${loading === v.name ? 'loading' : ''}`}
            onClick={() => calculate(v)}
            disabled={!!loading}
          >
            <span className="calc-card-icon">{v.icon}</span>
            <span className="calc-card-name">{v.name}</span>
            <span className={`calc-card-badge ${v.severity}`}>{v.severity}</span>
            {loading === v.name && <span className="calc-card-spinner">⏳</span>}
          </button>
        ))}
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="calc-error">{error}</div>
      )}

      {/* ── RESULT CARD ── */}
      {result && (
        <div className="calc-result">
          <div className="calc-result-header">
            <span className="calc-result-icon">{result.icon}</span>
            <div>
              <div className="calc-result-title">{result.violation}</div>
              <div className="calc-result-meta">{result.state} · {repeatOffence ? 'Repeat offence' : 'First offence'}</div>
            </div>
          </div>

          <div className="calc-result-breakdown">
            <div className="calc-result-row">
              <span>Base fine</span>
              <span>₹{result.base_fine?.toLocaleString()}</span>
            </div>
            <div className="calc-result-row">
              <span>Court fee (~10%)</span>
              <span>₹{result.court_fee?.toLocaleString()}</span>
            </div>
            <div className="calc-result-total">
              <span>Total payable</span>
              <span>₹{result.total?.toLocaleString()}</span>
            </div>
          </div>

          {result.law_section && (
            <div className="calc-result-section">
              📘 {result.law_section}
            </div>
          )}
          {result.notes && (
            <div className="calc-result-notes">{result.notes}</div>
          )}
        </div>
      )}

    </div>
  )
}
