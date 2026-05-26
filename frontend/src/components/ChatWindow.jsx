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

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const sendMessage = async () => {

    if (!input.trim()) return

    const userMessage = {
      sender: 'user',
      text: input,
    }

    setMessages((prev) => [...prev, userMessage])

    const currentInput = input

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

      const botMessage = {
        sender: 'bot',
        text: data.answer,
      }

      setMessages((prev) => [...prev, botMessage])

    } catch (error) {

      setMessages((prev) => [
        ...prev,
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

      <div className="border-b border-white/10 backdrop-blur-md bg-[#0f1220]/80 sticky top-0 z-50">

        <div className="max-w-6xl mx-auto px-6 py-6">

          <div className="flex flex-col items-center">

            <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
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
                  focus:border-pink-500
                  transition
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

        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {messages.map((m, idx) => (

            <div
              key={idx}
              className={`flex ${
                m.sender === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >

              <div
                className={`

                  w-full
                  max-w-3xl
                  px-7
                  py-6
                  rounded-3xl
                  shadow-2xl
                  break-words
                  transition-all

                  ${
                    m.sender === 'user'

                      ? `
                        bg-gradient-to-r
                        from-pink-600
                        to-pink-500
                        text-white
                      `

                      : `
                        bg-[#1b2138]
                        border
                        border-gray-700
                        border-l-4
                        border-l-pink-500
                        text-gray-100
                        backdrop-blur-md
                      `
                  }

                `}
              >

                <div className="text-left text-[18px] leading-8">

                  {m.text.split('\n').map((line, index) => (

                    <p
                      key={index}
                      className={line.trim() === '' ? 'h-4' : 'mb-1'}
                    >
                      {line}
                    </p>

                  ))}

                </div>

              </div>

            </div>

          ))}

          {/* LOADING */}

          {loading && (

            <div className="flex justify-start">

              <div
                className="
                  bg-[#1b2138]
                  border
                  border-gray-700
                  border-l-4
                  border-l-pink-500
                  px-6
                  py-5
                  rounded-3xl
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

      <div className="border-t border-white/10 bg-[#0f1220]/90 backdrop-blur-md">

        <div className="max-w-5xl mx-auto p-4">

          {/* QUICK SUGGESTIONS */}

          <div className="flex flex-wrap gap-3 mb-4">

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