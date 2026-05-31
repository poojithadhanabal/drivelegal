import { useEffect, useRef, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const SUGGESTIONS = [
  'Helmet violation fine in Tamil Nadu',
  'Drunk driving penalty India',
  'Mobile phone while driving',
  'No insurance fine',
  'Overspeeding fine in Delhi',
]

export default function ChatWindow({ location, setIsOnline }) {

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        `Hello! I'm DriveLegal — your AI traffic law assistant.\n\nAsk me about fines, challans, or road safety rules for ${location || 'India'}.`,
      data: null,
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const bottomRef = useRef(null)

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    })

  }, [messages, loading])

  const sendMessage = async (text) => {

    const msg = (text || input).trim()

    if (!msg || loading) return

    setHistory(prev => [

      msg,

      ...prev.filter(h => h !== msg)

    ].slice(0, 5))

    setMessages(prev => [

      ...prev,

      {
        sender: 'user',
        text: msg,
        data: null,
      }
    ])

    setInput('')
    setLoading(true)

    try {

      const res = await fetch(`${API}/chat`, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          message: msg,

          location,
        }),
      })

      const data = await res.json()

      setMessages(prev => [

        ...prev,

        {
          sender: 'bot',

          text:
            data.answer ||
            'No response found.',

          data:
            data.data || null,
        }
      ])

      setIsOnline?.(true)

    } catch {

      setIsOnline?.(false)

      setMessages(prev => [

        ...prev,

        {
          sender: 'bot',

          text:
            '⚠️ Could not connect to the server.\n\nDriveLegal is in offline mode. Previously cached legal data is still accessible via the Calculator.',

          data: null,
        }
      ])
    }

    setLoading(false)
  }

  return (

    <div className="chat-root">

      {/* HEADER */}

      <div className="chat-header">

        <div>

          <h1 className="chat-title">
            Ask DriveLegal
          </h1>

          <p className="chat-subtitle">
            Powered by DriveLegal AI · Location: {location}
          </p>

        </div>

        <div className="chat-header-badge">
          AI
        </div>

      </div>

      {/* MESSAGES */}

      <div className="chat-messages">

        {messages.map((m, i) => (

          <div
            key={i}
            className={`chat-msg-row ${m.sender}`}
          >

            {m.sender === 'bot' && (

              <div className="chat-avatar">
                🚦
              </div>

            )}

            <div className={`chat-bubble ${m.sender}`}>

              {/* LEGAL CARD */}

              {m.data ? (

                <div className="legal-card">

                  <div className="legal-card-title">

                    <span className="legal-offence-badge">

                      {m.data.severity || 'Violation'}

                    </span>

                    {m.data.offence}

                  </div>

                  {/* GRID */}

                  <div className="legal-grid">

                    <div className="legal-cell">

                      <span className="legal-cell-label">
                        Section
                      </span>

                      <span className="legal-cell-value">
                        {m.data.section}
                      </span>

                    </div>

                    <div className="legal-cell">

                      <span className="legal-cell-label">
                        Fine (1st)
                      </span>

                      <span className="legal-cell-value fine">

                        {typeof m.data.fine === 'object'
                          ? m.data.fine.first_offence
                          : m.data.fine}

                      </span>

                    </div>

                    <div className="legal-cell">

                      <span className="legal-cell-label">
                        Risk Score
                      </span>

                      <span className="legal-cell-value risk">
                        {m.data.risk_score}
                      </span>

                    </div>

                    <div className="legal-cell">

                      <span className="legal-cell-label">
                        State
                      </span>

                      <span className="legal-cell-value">
                        {m.data.state}
                      </span>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  {m.data.description && (

                    <div className="legal-desc">

                      {m.data.description}

                    </div>

                  )}

                  {/* AI EXPLANATION */}

                  {m.text && (

                    <div
                      className="
                        mt-5
                        bg-[#20263d]
                        border
                        border-gray-700
                        rounded-2xl
                        p-5
                      "
                    >

                      <p
                        className="
                          text-gray-400
                          mb-3
                          text-sm
                          uppercase
                          tracking-wide
                        "
                      >
                        🤖 AI Explanation
                      </p>

                      <p
                        className="
                          text-gray-100
                          leading-8
                          whitespace-pre-wrap
                        "
                      >
                        {m.text}
                      </p>

                    </div>

                  )}

                  {/* TAGS */}

                  <div className="legal-tags-row">

                    {m.data.source && (

                      <div className="legal-tag blue">

                        📚 {

                          typeof m.data.source === 'object'

                            ? m.data.source.name

                            : m.data.source

                        }

                      </div>

                    )}

                    {m.data.safety_tip && (

                      <div className="legal-tag green">

                        ✅ {m.data.safety_tip}

                      </div>

                    )}

                  </div>

                </div>

              ) : (

                /* NORMAL CHAT BUBBLE */

                <span className="chat-text">

                  {m.text}

                </span>

              )}

            </div>

            {m.sender === 'user' && (

              <div className="chat-avatar user">
                U
              </div>

            )}

          </div>

        ))}

        {/* LOADING */}

        {loading && (

          <div className="chat-msg-row bot">

            <div className="chat-avatar">
              🚦
            </div>

            <div className="chat-bubble bot">

              <div className="chat-typing">
                <span />
                <span />
                <span />
              </div>

            </div>

          </div>

        )}

        <div ref={bottomRef} />

      </div>

      {/* SUGGESTIONS */}

      <div className="chat-suggestions">

        {SUGGESTIONS.map((s, i) => (

          <button
            key={i}
            className="chat-chip"
            onClick={() => sendMessage(s)}
          >

            {s}

          </button>

        ))}

      </div>

      {/* HISTORY */}

      {history.length > 0 && (

        <div className="chat-history">

          <span className="chat-history-label">
            Recent:
          </span>

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

      {/* INPUT */}

      <div className="chat-input-row">

        <input
          className="chat-input"

          placeholder="
            Ask about any traffic fine,
            rule, or violation...
          "

          value={input}

          onChange={e =>
            setInput(e.target.value)
          }

          onKeyDown={e =>
            e.key === 'Enter' && sendMessage()
          }
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