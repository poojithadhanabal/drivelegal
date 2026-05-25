import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API = 'https://drivelegal-backend.onrender.com/api'

export default function ChatWindow({ location }) {

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `👋 Hello! I am DriveLegal.

Ask me anything about:
• Traffic fines
• Challans
• Road safety rules
• Motor Vehicle Act`
    }
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef(null)

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages])

  const send = async () => {

    if (!input.trim() || loading) return

    const userMsg = input.trim()

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text: userMsg
      }
    ])

    setInput('')
    setLoading(true)

    try {

      const res = await axios.post(`${API}/chat`, {
        message: userMsg,
        location: location || 'India'
      })

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: res.data.answer,
          source: res.data.location
        }
      ])

    } catch {

      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: `⚠️ Could not reach server.

Please check:
• Backend is running
• API server is active
• Internet connection`
        }
      ])
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((m, i) => (

          <div
            key={i}
            className={`flex ${
              m.role === 'user'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >

            <div
              className={`
                max-w-[85%]
                px-5
                py-4
                rounded-2xl
                text-sm
                shadow-md
                whitespace-pre-wrap
                leading-7
                transition-all
                duration-200
                text-left

                ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }
              `}
            >

              {m.text}

              {m.source && (
                <p className="text-xs mt-3 opacity-60">
                  📍 {m.source}
                </p>
              )}

            </div>

          </div>

        ))}

        {/* Loading animation */}
        {loading && (

          <div className="flex justify-start">

            <div className="
              bg-white
              border
              border-gray-200
              px-4
              py-3
              rounded-2xl
              rounded-bl-sm
              shadow-sm
            ">

              <span className="flex gap-1">

                <span className="
                  w-2 h-2
                  bg-green-500
                  rounded-full
                  animate-bounce
                  [animation-delay:0ms]
                "/>

                <span className="
                  w-2 h-2
                  bg-green-500
                  rounded-full
                  animate-bounce
                  [animation-delay:150ms]
                "/>

                <span className="
                  w-2 h-2
                  bg-green-500
                  rounded-full
                  animate-bounce
                  [animation-delay:300ms]
                "/>

              </span>

            </div>

          </div>

        )}

        <div ref={bottomRef} />

      </div>

      {/* Input */}
      <div className="
        border-t
        border-gray-200
        bg-white
        p-3
      ">

        <div className="flex gap-2">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && send()
            }
            placeholder="Ask about traffic fines..."
            className="
              flex-1
              border
              border-gray-300
              rounded-xl
              px-4
              py-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
            "
          />

          <button
            onClick={send}
            disabled={loading}
            className="
              bg-green-700
              hover:bg-green-800
              disabled:bg-gray-400
              text-white
              px-5
              py-2
              rounded-xl
              text-sm
              font-semibold
              transition-colors
            "
          >
            {loading ? '...' : 'Send'}
          </button>

        </div>

      </div>

    </div>
  )
}