import { FiCpu } from 'react-icons/fi'
import GlassCard from '../components/GlassCard'
import ChatInterface from '../components/ChatInterface'

export default function AIAssistant() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <GlassCard className="border-slate-800">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FiCpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Grievance Assistant</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Interact with Gemini AI to inquire about pending petition status, draft descriptions, or obtain policy advice.
            </p>
          </div>
        </div>
        <ChatInterface isWidget={false} />
      </GlassCard>
    </div>
  )
}
