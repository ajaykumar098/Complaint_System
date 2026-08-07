import { useState, useRef, useEffect } from 'react'
import { FiSend, FiShield } from 'react-icons/fi'
import NeonButton from './NeonButton'

export default function ChatThread({ 
  complaintId, 
  messages = [], 
  onSendMessage, 
  currentSender = 'CITIZEN',
  isAdmin = false,
  readOnly = false
}) {
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      await onSendMessage(newMessage.trim())
      setNewMessage('')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-white/70 mb-2">Updates</h3>
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-white/50 text-sm text-center py-4">No messages yet</p>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderType === currentSender
            return (
              <div
                key={msg.id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    isOwnMessage
                      ? isAdmin
                        ? 'bg-neon-purple/20 border border-neon-purple/30 text-white'
                        : 'bg-neon-blue/20 border border-neon-blue/30 text-white'
                      : 'bg-white/10 border border-white/20 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {msg.senderType === 'ADMIN' && <FiShield className="w-3 h-3 text-neon-purple" />}
                    <span className="text-xs text-white/60">{msg.senderType}</span>
                  </div>
                  <p>{msg.message}</p>
                  <p className="text-xs text-white/50 mt-1">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>
      {!readOnly && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/50 text-sm disabled:opacity-50"
          />
          <NeonButton onClick={handleSend} disabled={!newMessage.trim() || sending} className="!p-2">
            <FiSend className="w-4 h-4" />
          </NeonButton>
        </div>
      )}
    </div>
  )
}