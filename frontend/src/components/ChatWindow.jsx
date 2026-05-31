import { useEffect, useRef, useState } from 'react'

const API =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api'

const SUGGESTIONS = [
  'Helmet violation fine in Tamil Nadu',
  'Drunk driving penalty India',
  'Mobile phone while driving',
  'No insurance fine',
  'Overspeeding fine in Delhi',
]

// ✅ ONLY SUPPORTED STATES
const SUPPORTED_STATES = [
  'Tamil Nadu',
  'Delhi',
  'Karnataka',
  'Maharashtra',
  'UK',
  'Central',
]

export default function ChatWindow({
  location,
  setLocation,
  setIsOnline,
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I'm DriveLegal — your AI traffic law assistant.\n\nAsk me about fines, challans, or road safety rules.`,
      data: null,
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const [
    detectedLocation,
    setDetectedLocation,
  ] = useState('')

  const bottomRef = useRef(null)

  // =========================================
  // AUTO SCROLL
  // =========================================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // =========================================
  // LIVE LOCATION DETECTION
  // =========================================
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude
          const lon = position.coords.longitude

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          )
          const data = await response.json()

          const rawState = data.address.state

          const detectedState =
            SUPPORTED_STATES.includes(rawState)
              ? rawState
              : 'Central'

          setDetectedLocation(detectedState)
          setLocation?.(detectedState)
        } catch (err) {
          console.log('Location detection failed')
        }
      },
      () => {
        console.log('Location permission denied')
      }
    )
  }, [])

  // =========================================
  // SEND MESSAGE
  // =========================================
  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    setHistory((prev) =>
      [msg, ...prev.filter((h) => h !== msg)].slice(0, 5)
    )

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: msg, data: null },
    ])

    setInput('')
    setLoading(true)

    try {
      const finalLocation =
        location || detectedLocation || 'Central'

      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          location: finalLocation,
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.answer || 'No response found.',
          data: data.data || null,
        },
      ])

      setIsOnline?.(true)
    } catch {
      setIsOnline?.(false)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ Could not connect to the server.\n\nDriveLegal is in offline mode.',
          data: null,
        },
      ])
    }

    setLoading(false)
  }

  return (
    <div className="chat-root">

      {/* ── HEADER ── */}
      <div className="chat-header">
        <div>
          <h1 className="chat-title">Ask DriveLegal</h1>
          <p className="chat-subtitle">
            Powered by DriveLegal AI · Location:{' '}
            <strong style={{ color: 'var(--g-300)', fontWeight: 600 }}>
              {location || 'Detecting...'}
            </strong>
          </p>
          {detectedLocation && (
            <div
              style={{
                marginTop: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(34,184,110,0.08)',
                border: '1px solid rgba(34,184,110,0.2)',
                color: 'var(--g-300)',
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              📍 Live location: {detectedLocation}
            </div>
          )}
        </div>
        <div className="chat-header-badge">AI</div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg-row ${m.sender}`}>

            {m.sender === 'bot' && (
              <div className="chat-avatar">🚦</div>
            )}

            <div className={`chat-bubble ${m.sender}`}>
              {m.data ? (
                <div className="legal-card">

                  {/* Title + badge */}
                  <div className="legal-card-title">
                    <span className="legal-offence-badge">
                      {m.data.severity || 'Violation'}
                    </span>
                    {m.data.offence}
                  </div>

                  {/* Info grid */}
                  <div className="legal-grid">
                    <div className="legal-cell">
                      <span className="legal-cell-label">Section</span>
                      <span className="legal-cell-value">{m.data.section}</span>
                    </div>
                    <div className="legal-cell">
                      <span className="legal-cell-label">Fine (1st)</span>
                      <span className="legal-cell-value fine">
                        {typeof m.data.fine === 'object'
                          ? m.data.fine.first_offence
                          : m.data.fine}
                      </span>
                    </div>
                    <div className="legal-cell">
                      <span className="legal-cell-label">Risk Score</span>
                      <span className="legal-cell-value risk">{m.data.risk_score}</span>
                    </div>
                    <div className="legal-cell">
                      <span className="legal-cell-label">State</span>
                      <span className="legal-cell-value">{m.data.state}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {m.data.description && (
                    <div className="legal-desc">{m.data.description}</div>
                  )}

                  {/* AI Explanation */}
                  {m.text && (
                    <div className="ai-explanation-box">
                      <div className="ai-explanation-label">🤖 AI Explanation</div>
                      <p className="ai-explanation-text">{m.text}</p>
                    </div>
                  )}

                  {/* Source tag */}
                  {m.data.source && (
                    <div className="legal-tags-row">
                      <div className="legal-tag blue">
                        📚{' '}
                        {typeof m.data.source === 'object'
                          ? m.data.source.name
                          : m.data.source}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <span className="chat-text">{m.text}</span>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="chat-avatar user">U</div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="chat-msg-row bot">
            <div className="chat-avatar">🚦</div>
            <div className="chat-bubble bot">
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── SUGGESTIONS ── */}
      <div className="chat-suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="chat-chip" onClick={() => sendMessage(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* ── RECENT HISTORY ── */}
      {history.length > 0 && (
        <div className="chat-history">
          <span className="chat-history-label">Recent:</span>
          {history.map((h, i) => (
            <button
              key={i}
              className="chat-chip ghost"
              onClick={() => sendMessage(h)}
            >
              🕘 {h}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT ── */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Ask about any traffic fine, rule, or violation..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={loading}
        >
          {loading ? '…' : '↑'}
        </button>
      </div>
    </div>
  )
}