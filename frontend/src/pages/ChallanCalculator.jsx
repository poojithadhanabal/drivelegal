import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000/api'

const VIOLATIONS = [
  'Overspeeding',
  'Drunk Driving',
  'No Helmet',
  'No Seatbelt',
  'Mobile Phone Use',
  'Red Light Jump',
  'No Licence',
  'No Insurance',
  'Wrong Side Driving',
  'Overloading'
]

const VEHICLES = [
  'Two-Wheeler',
  'Car / Jeep / Van',
  'Bus / Truck (HMV)',
  'Auto Rickshaw',
  'Any Vehicle'
]

const STATES = [
  'National',
  'Tamil Nadu',
  'Delhi',
  'Karnataka',
  'Maharashtra'
]

export default function ChallanCalculator() {
  const [violation, setViolation] = useState('Overspeeding')
  const [vehicleType, setVehicleType] = useState('Two-Wheeler')
  const [state, setState] = useState('National')
  const [isRepeat, setIsRepeat] = useState(false)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calculateFine = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await axios.post(`${API}/challan`, {
        violation,
        vehicle_type: vehicleType,
        state,
        is_repeat: isRepeat
      })

      if (res.data.status === 'ok') {
        setResult(res.data)
      } else {
        setError(res.data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('⚠️ Could not connect to backend server.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-2">
            💰 Challan Calculator
          </h1>

          <p className="text-gray-500">
            Calculate your exact fine based on violation, vehicle, and state.
          </p>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Violation */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Violation Type
            </label>

            <select
              value={violation}
              onChange={(e) => setViolation(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {VIOLATIONS.map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Vehicle Type
            </label>

            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {VEHICLES.map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              State
            </label>

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3
                         focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {STATES.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Repeat offence */}
          <div className="flex items-center mt-8">
            <input
              type="checkbox"
              checked={isRepeat}
              onChange={() => setIsRepeat(!isRepeat)}
              className="w-5 h-5 accent-green-600"
            />

            <label className="ml-3 text-gray-700 font-medium">
              Repeat offence (higher fine)
            </label>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8 text-center">
          <button
            onClick={calculateFine}
            disabled={loading}
            className="bg-green-700 hover:bg-green-800 text-white
                       px-8 py-3 rounded-2xl font-semibold shadow-lg
                       transition-all disabled:bg-gray-400"
          >
            {loading ? 'Calculating...' : 'Calculate Fine →'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-300 text-red-700
                          px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 bg-gray-50 rounded-2xl shadow-inner p-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              💰 Fine Breakdown
            </h2>

            <div className="space-y-3 text-gray-700">

              <p>
                <span className="font-semibold">Violation:</span>{" "}
                {result.violation}
              </p>

              <p>
                <span className="font-semibold">Vehicle:</span>{" "}
                {result.vehicle_type}
              </p>

              <p>
                <span className="font-semibold">State:</span>{" "}
                {result.state}
              </p>

              <p>
                <span className="font-semibold">Offence Type:</span>{" "}
                {result.is_repeat ? "🔴 Repeat" : "🟢 First Time"}
              </p>

              <p className="text-lg">
                <span className="font-semibold">Base Fine:</span>{" "}
                ₹ {result.base_fine}
              </p>

              <p className="text-lg">
                <span className="font-semibold">Court Fee (~10%):</span>{" "}
                ₹ {result.court_fee}
              </p>

              <p className="text-3xl font-bold text-green-700 mt-4">
                Total Payable: ₹ {result.total}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                📜 {result.law_section} • {result.notes}
              </p>

              <p className="text-xs text-orange-500 mt-4">
                ⚠️ Amounts are indicative. Verify with official state transport authority.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}