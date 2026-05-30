import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import Calculator from './components/Calculator'
import Dashboard from './components/Dashboard'

export default function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [location, setLocation] = useState(
    localStorage.getItem('drivelegal_location') || 'Tamil Nadu'
  )
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const STATES = [
    'National','Tamil Nadu','Delhi','Karnataka',
    'Maharashtra','Kerala','Telangana','Rajasthan','UK','UAE'
  ]

  const handleLocationChange = (val) => {
    setLocation(val)
    localStorage.setItem('drivelegal_location', val)
    localStorage.setItem('drivelegal_cache_date', new Date().toLocaleDateString())
  }

  const tabs = [
    { id: 'chat',       label: 'Chat',        icon: '💬' },
    { id: 'calculator', label: 'Calculator',  icon: '🧮' },
    { id: 'dashboard',  label: 'Analytics',   icon: '📊' },
  ]

  return (
    <div className="dl-root">

      {/* ── SIDEBAR ─────────────────────────── */}
      <aside className="dl-sidebar">
        <div className="dl-brand">
          <span className="dl-brand-icon">🚦</span>
          <div>
            <div className="dl-brand-name">DriveLegal</div>
            <div className="dl-brand-sub">AI Traffic Law</div>
          </div>
        </div>

        <nav className="dl-nav">
          {tabs.map(t => (
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

        <div className="dl-location-box">
          <label className="dl-loc-label">📍 Your State</label>
          <select
            value={location}
            onChange={e => handleLocationChange(e.target.value)}
            className="dl-select"
          >
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className={`dl-status-dot ${isOnline ? 'online' : 'offline'}`}>
            <span className="dl-status-pulse" />
            {isOnline ? 'Live data' : 'Offline mode'}
          </div>
        </div>

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
            <span className="dl-footer-num">3</span>
            <span className="dl-footer-lbl">Countries</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────── */}
      <main className="dl-main">

        {/* offline banner */}
        {!isOnline && (
          <div className="dl-offline-bar">
            ⚠️ Offline mode — showing cached data
            from {localStorage.getItem('drivelegal_cache_date') || 'last session'}
          </div>
        )}

        {/* page content */}
        <div className="dl-page">
          {activeTab === 'chat'       && <ChatWindow location={location} setIsOnline={setIsOnline} />}
          {activeTab === 'calculator' && <Calculator location={location} setIsOnline={setIsOnline} />}
          {activeTab === 'dashboard'  && <Dashboard />}
        </div>

      </main>
    </div>
  )
}
