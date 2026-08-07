import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare, FiX } from 'react-icons/fi'
import ChatInterface from './ChatInterface'
import GlassCard from './GlassCard'

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/30 hover:shadow-neon-blue/50 transition-all z-40 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0 : 1 }}
      >
        <FiMessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[380px] h-[80vh] sm:h-[520px] z-50"
          >
            <GlassCard className="h-full">
              <ChatInterface isWidget={true} onClose={() => setIsOpen(false)} />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
