import GlassCard from '../components/GlassCard'
import ChatInterface from '../components/ChatInterface'

export default function AIAssistant() {
  return (
    <div className="max-w-4xl mx-auto">
      <GlassCard>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="text-white/50 mt-1">
            Ask questions about your complaints, check status, or get help with common queries.
          </p>
        </div>
        <ChatInterface isWidget={false} />
      </GlassCard>
    </div>
  )
}
