import { useState, useRef, useEffect } from 'react'
import { FiSend, FiShield, FiUser } from 'react-icons/fi'
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 flex items-center justify-between">
        <span>Official Communications</span>
        <span className="text-xs font-normal text-slate-400">{messages.length} message{messages.length === 1 ? '' : 's'}</span>
      </h3>
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 max-h-72 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No communication records on file.</p>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderType === currentSender
            const isOfficer = msg.senderType === 'ADMIN'
            return (
              <div
                key={msg.id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    isOwnMessage
                      ? isOfficer
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-sm'
                        : 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm'
                      : isOfficer
                        ? 'bg-slate-800/90 border border-indigo-500/20 text-slate-200 rounded-tl-sm'
                        : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isOfficer ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400">
                        <FiShield className="w-3 h-3" /> Admin Officer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400">
                        <FiUser className="w-3 h-3" /> Citizen
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed">{msg.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>
      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm disabled:opacity-50"
          />
          <NeonButton onClick={handleSend} disabled={!newMessage.trim() || sending} className="!px-3.5">
            <FiSend className="w-4 h-4" />
          </NeonButton>
        </div>
      )}
    </div>
  )
}
