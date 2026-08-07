import { useState, useEffect, useRef } from 'react'
import { FiSend, FiCpu, FiX, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from './GlassCard'
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

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        content: "Hi! I'm your AI assistant. I can help you check complaint status, view your history, or answer questions about specific complaints. How can I help you today?",
      },
    ])
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)

    // Show typing indicator
    setIsTyping(true)

    // Call backend AI endpoint
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id?.toString() || '',
          message: userMessage,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await res.json()
      setMessages([...newMessages, { role: 'ai', content: data.reply }])
    } catch (err) {
      console.error('AI chat error:', err)
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, I couldn\'t process that. Please try again.' }])
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
        content: "Hi! I'm your AI assistant. I can help you check complaint status, view your history, or answer questions about specific complaints. How can I help you today?",
      },
    ])
  }

  const handleExamplePrompt = (prompt) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const formatMessage = (content) => {
    // Convert markdown-style bold to HTML
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
  }

  return (
    <div className={`flex flex-col ${isWidget ? 'h-full' : 'h-[calc(100vh-200px)]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center">
            <FiCpu className="w-4 h-4 text-neon-blue" />
          </div>
          <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        </div>
        <div className="flex gap-2">
          <NeonButton
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            className="!p-2"
          >
            <FiTrash2 className="w-4 h-4" />
          </NeonButton>
          {onClose && (
            <NeonButton
              variant="outline"
              size="sm"
              onClick={onClose}
              className="!p-2"
            >
              <FiX className="w-4 h-4" />
            </NeonButton>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <FiCpu className="w-4 h-4 text-neon-blue" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-neon-blue/20 border border-neon-blue/30 text-white'
                  : 'bg-white/5 border border-white/10 text-white/90'
              }`}
            >
              <p
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <FiCpu className="w-4 h-4 text-neon-blue" />
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompts (only show for fresh chat) */}
      {messages.length <= 1 && !isTyping && (
        <div className="mb-4">
          <p className="text-xs text-white/50 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExamplePrompt(prompt)}
                className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your complaints..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-colors"
        />
        <NeonButton onClick={handleSendMessage} disabled={!input.trim() || isTyping} className="!p-2.5">
          <FiSend className="w-4 h-4" />
        </NeonButton>
      </div>
    </div>
  )
}
