import { useEffect, useRef, useState } from 'react'

const API = 'http://localhost:8000/api'

export default function ChatWindow() {

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        '👋 Hello! I am DriveLegal. Ask me anything about:\n\n• Traffic fines\n• Challans\n• Road safety rules\n• Motor Vehicle Act',
    },
  ])

  const [input, setInput] = useState('')
  const [location, setLocation] = useState('Tamil Nadu')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const messagesEndRef = useRef(null)

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })

  }, [messages])

  const sendMessage = async () => {

    if (!input.trim()) return

    const currentInput = input
    setHistory((prev) => {
      const updated = [
        currentInput,
        ...prev.filter(
          (item) => item !== currentInput
        )
      ]
      return updated.slice(0,5)
    })

    setMessages([
      {
        sender: 'user',
        text: currentInput,
      },
    ])

    setInput('')
    setLoading(true)

    try {

      const response = await fetch(`${API}/chat`, {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          message: currentInput,
          location: location,
        }),

      })

      const data = await response.json()

      setMessages([

        {
          sender: 'user',
          text: currentInput,
        },

        {
          sender: 'bot',
          data: data.data || null,
          text: data.answer || 'No response found.',
        },

      ])

    } catch (error) {

      setMessages([

        {
          sender: 'bot',
          text: '❌ Failed to connect to backend.',
        },

      ])
    }

    setLoading(false)
  }

  return (

    <div className="min-h-screen bg-[#0f1220] text-white flex flex-col">

      {/* HEADER */}

      <div className="border-b border-white/10 bg-[#0f1220]">

        <div className="max-w-6xl mx-auto px-6 py-8">

          <div className="flex flex-col items-center">

            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              🚦 DriveLegal
            </h1>

            <p className="text-xl text-gray-300 mb-5">
              AI Traffic Law Assistant
            </p>

            <div className="flex items-center gap-3 flex-wrap justify-center">

              <span className="text-lg text-gray-300">
                📍 Your location:
              </span>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="
                  bg-[#1b2138]
                  border
                  border-gray-700
                  rounded-xl
                  px-4
                  py-2
                  text-white
                  outline-none
                "
              >
                <option>Tamil Nadu</option>
                <option>Delhi</option>
                <option>Karnataka</option>
                <option>Maharashtra</option>
              </select>

            </div>

          </div>

        </div>

      </div>

      {/* CHAT AREA */}

      <div className="flex-1 overflow-y-auto px-4 py-8">

        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

          {messages.map((m, idx) => (

            <div
              key={idx}
              className={`flex w-full ${
                m.sender === 'user'
                  ? 'justify-end'
                  : 'justify-center'
              }`}
            >

              {/* USER MESSAGE */}

              {m.sender === 'user' ? (

                <div
                  className="
                    bg-gradient-to-r
                    from-pink-600
                    to-pink-500
                    text-white
                    px-6
                    py-4
                    rounded-2xl
                    max-w-xl
                    text-lg
                    shadow-xl
                  "
                >
                  {m.text}
                </div>

              ) : m.data ? (

                /* LEGAL CARD */

                <div
                  className="
                    bg-[#1b2138]
                    border
                    border-gray-700
                    border-l-4
                    border-l-pink-500
                    rounded-3xl
                    p-8
                    w-full
                    max-w-5xl
                    shadow-2xl
                  "
                >

                  <h2
                    className="
                      text-3xl
                      font-bold
                      text-pink-400
                      mb-6
                    "
                  >
                    🚦 {m.data?.offence}
                  </h2>

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-2
                      gap-6
                    "
                  >

                    <div className="bg-[#242c49] p-5 rounded-2xl">

                      <p className="text-gray-400 mb-2">
                        📘 Section
                      </p>

                      <p className="text-2xl font-bold">
                        {m.data?.section}
                      </p>

                    </div>

                    <div className="bg-[#242c49] p-5 rounded-2xl">

                      <p className="text-gray-400 mb-2">
                        💰 Fine
                      </p>

                      <p className="text-3xl font-bold mt-2">

                        {typeof m.data?.fine === 'object'
                          ? m.data?.fine?.first_offence
                          : m.data?.fine}

                      </p>

                    </div>

                    <div className="bg-[#242c49] p-5 rounded-2xl">

                      <p className="text-gray-400 mb-2">
                        ⚠️ Severity
                        <div className="bg-[#242c49] p-5 rounded-2xl">

                          <p className="text-gray-400 mb-2">
                            🚨 AI Risk Score
                          </p>

                          <p className="text-xl font-bold text-red-400">
                            {m.data?.risk_score}
                          </p>

                        </div>
                      </p>

                      <p className="text-xl font-bold uppercase">
                        {m.data?.severity}
                      </p>

                    </div>

                    <div className="bg-[#242c49] p-5 rounded-2xl">

                      <p className="text-gray-400 mb-2">
                        📍 State
                      </p>

                      <p className="text-xl font-bold">
                        {m.data?.state}
                      </p>

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div
                    className="
                      bg-[#242c49]
                      p-5
                      rounded-2xl
                      mt-5
                    "
                  >

                    <p
                      className="
                        text-gray-400
                        mb-3
                        text-lg
                      "
                    >
                      📝 Description
                    </p>

                    <p
                      className="
                        text-lg
                        leading-8
                        text-gray-100
                      "
                    >
                      {m.data?.description}
                      <div
                        className="
                          bg-blue-500/10
                          border
                          border-blue-500
                          p-5
                          rounded-2xl
                          mt-5
                        "
                      >

                        <p className="text-blue-300 font-bold mb-2">
                          📚 Verified Source
                        </p>

                        <p className="text-gray-200">
                          {m.data?.source}
                        </p>

                      </div>
                    </p>

                  </div>

                  {/* SAFETY TIP */}

                  <div
                    className="
                      bg-green-500/10
                      border
                      border-green-500
                      p-5
                      rounded-2xl
                      mt-5
                    "
                  >

                    <p className="text-green-300 font-bold mb-2">
                      ✅ Safety Tip
                    </p>

                    <p className="text-gray-200">
                      {m.data?.safety_tip}
                    </p>

                  </div>

                  {/* LEGAL ADVICE */}

                  <div
                    className="
                      bg-yellow-500/10
                      border
                      border-yellow-500
                      p-5
                      rounded-2xl
                      mt-5
                    "
                  >

                    <p className="text-yellow-300 font-bold mb-2">
                      ⚖️ Legal Advice
                    </p>

                    <p className="text-gray-200">
                      {m.data?.legal_advice}
                    </p>

                  </div>

                </div>

              ) : (

                /* NORMAL BOT MESSAGE */

                <div
                  className="
                    bg-red-500/10
                    border
                    border-red-500
                    rounded-2xl
                    px-6
                    py-5
                    max-w-4xl
                    whitespace-pre-wrap
                    text-red-300
                    leading-8
                    text-lg
                  "
                >
                  {m.text}
                </div>

              )}

            </div>

          ))}

          {/* LOADING */}

          {loading && (

            <div className="flex justify-center">

              <div
                className="
                  bg-[#1b2138]
                  border
                  border-gray-700
                  border-l-4
                  border-l-pink-500
                  px-6
                  py-5
                  rounded-2xl
                  text-gray-300
                  animate-pulse
                "
              >
                ⏳ Checking verified legal database...
              </div>

            </div>

          )}

          <div ref={messagesEndRef} />

        </div>

      </div>

      {/* INPUT AREA */}

      <div className="border-t border-white/10 bg-[#0f1220]">

        <div className="max-w-5xl mx-auto p-4">

          {/* QUICK SUGGESTIONS */}

          <div className="flex flex-wrap gap-3 mb-4 justify-center">

            {[
              'helmet violation',
              'drink and drive',
              'mobile while driving',
              'no insurance',
            ].map((suggestion, idx) => (

              <button
                key={idx}
                onClick={() => setInput(suggestion)}
                className="
                  bg-[#1b2138]
                  border
                  border-gray-700
                  hover:border-pink-500
                  hover:bg-[#242c49]
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  transition
                "
              >
                💡 {suggestion}
              </button>

            ))}

          </div>
          {/* RECENT SEARCHES */}

          {history.length > 0 && (

            <div className="mb-4">

              <p className="text-gray-400 mb-3 text-sm">
                🕘 Recent Searches
              </p>

              <div className="flex flex-wrap gap-3">

                {history.map((item, idx) => (

                  <button
                    key={idx}
                    onClick={() => setInput(item)}
                    className="
                      bg-[#242c49]
                      border
                      border-gray-700
                      hover:border-pink-500
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      transition
                    "
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>
        
          )}

          {/* INPUT */}

          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Ask about traffic fines..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {

                if (e.key === 'Enter') {
                  sendMessage()
                }

              }}
              className="
                flex-1
                bg-[#1b2138]
                text-white
                px-5
                py-4
                rounded-2xl
                border
                border-gray-700
                outline-none
                focus:border-pink-500
                text-[17px]
              "
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="
                bg-gradient-to-r
                from-pink-600
                to-pink-500
                hover:opacity-90
                px-7
                py-4
                rounded-2xl
                font-semibold
                transition
                disabled:opacity-50
              "
            >
              {loading ? '...' : 'Send'}
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}