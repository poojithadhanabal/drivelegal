import { useState } from 'react'

import ChatWindow from './components/ChatWindow'
import Calculator from './components/Calculator'
import Dashboard from './components/Dashboard'

// ✅ ONLY SUPPORTED STATES
const STATES = [
  'Central',
  'Tamil Nadu',
  'Delhi',
  'Karnataka',
  'Maharashtra',
  'UK',
]

export default function App() {
  const [activeTab, setActiveTab] = useState('chat')

  const [location, setLocation] = useState(
    localStorage.getItem('drivelegal_location') || 'Central'
  )

  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // ========================================
  // LOCATION CHANGE
  // ========================================
  const handleLocationChange = (val) => {
    setLocation(val)
    localStorage.setItem('drivelegal_location', val)
    localStorage.setItem(
      'drivelegal_cache_date',
      new Date().toLocaleDateString()
    )
  }

  // ========================================
  // SIDEBAR TABS
  // ========================================
  const tabs = [
    { id: 'chat',       label: 'Chat',      icon: '💬' },
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'dashboard',  label: 'Analytics',  icon: '📊' },
  ]

  return (
    <div className="dl-root">

      {/* ── SIDEBAR ── */}
      <aside className="dl-sidebar">

        {/* Brand */}
        <div className="dl-brand">
          <span className="dl-brand-icon">🚦</span>
          <div>
            <div className="dl-brand-name">DriveLegal</div>
            <div className="dl-brand-sub">AI Traffic Law</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dl-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`dl-nav-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="dl-nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Location box */}
        <div className="dl-location-box">
          <label className="dl-loc-label">📍 Your State</label>

          <select
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="dl-select"
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className={`dl-status-dot ${isOnline ? 'online' : 'offline'}`}>
            <span className="dl-status-pulse" />
            {isOnline ? 'Live data' : 'Offline mode'}
          </div>
        </div>

        {/* Footer stats */}
        <div className="dl-sidebar-footer">
          <div className="dl-footer-stat">
            <span className="dl-footer-num">4</span>
            <span className="dl-footer-lbl">States</span>
          </div>
          <div className="dl-footer-stat">
            <span className="dl-footer-num">48+</span>
            <span className="dl-footer-lbl">Violations</span>
          </div>
          <div className="dl-footer-stat">
            <span className="dl-footer-num">2</span>
            <span className="dl-footer-lbl">Countries</span>
          </div>
        </div>

      </aside>

      {/* ── MAIN ── */}
      <main className="dl-main">

        {/* Offline banner */}
        {!isOnline && (
          <div className="dl-offline-bar">
            ⚠️ Offline mode — showing cached data from{' '}
            {localStorage.getItem('drivelegal_cache_date') || 'last session'}
          </div>
        )}

        {/* Page content */}
        <div className="dl-page">

          {activeTab === 'chat' && (
            <ChatWindow
              location={location}
              setLocation={setLocation}
              setIsOnline={setIsOnline}
            />
          )}

          {activeTab === 'calculator' && (
            <Calculator
              location={location}
              setIsOnline={setIsOnline}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard />
          )}

        </div>
      </main>

    </div>
  )
}