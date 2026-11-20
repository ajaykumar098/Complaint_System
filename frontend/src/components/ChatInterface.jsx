import { useState, useEffect, useRef } from 'react'
import { FiSend, FiCpu, FiX, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import NeonButton from './NeonButton'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'

const examplePrompts = [
  "What is my complaint status?",
  "Show my latest complaint",
  "How many complaints have I submitted?",
  "Can I edit my complaint?",
]

export default function ChatInterface({ isWidget = false, onClose = null }) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        content: "Hello! I am your CivicResolve AI assistant. I can help check the status of your complaints, summarize your history, or assist with documentation. How can I assist you today?",
      },
    ])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsTyping(true)

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id?.toString() || '',
          message: userMessage,
        }),
      })

      if (!res.ok) throw new Error('Failed to get AI response')
      const data = await res.json()
      setMessages([...newMessages, { role: 'ai', content: data.reply }])
    } catch (err) {
      console.error('AI chat error:', err)
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, I couldn\'t process that request right now. Please try again.' }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: 'ai',
        content: "Hello! I am your CivicResolve AI assistant. How can I assist you today?",
      },
    ])
  }

  const handleExamplePrompt = (prompt) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const formatMessage = (content) => {
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
  }

  return (
    <div className={`flex flex-col p-4 md:p-5 ${isWidget ? 'h-full' : 'h-[calc(100vh-200px)]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FiCpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Civic Assistant</h2>
            <p className="text-[11px] text-slate-400">Powered by Gemini AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClearChat}
            title="Clear Chat"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 mb-3 pr-1 text-sm">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <FiCpu className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[82%] px-4 py-2.5 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 shadow-sm'
              }`}
            >
              <p
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FiCpu className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/70 px-4 py-2.5 rounded-2xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompts */}
      {messages.length <= 1 && !isTyping && (
        <div className="mb-3">
          <p className="text-[11px] font-medium text-slate-400 mb-1.5">Suggested Questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExamplePrompt(prompt)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a question..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors"
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
