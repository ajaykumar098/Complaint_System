import { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiFileText, FiCamera, FiMapPin, FiMail, FiPhone } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'
import NeonButton from '../components/NeonButton'

const helpSections = [
  {
    id: 'submit',
    icon: FiFileText,
    title: 'How to Submit a Complaint',
    content: (
      <ol className="space-y-2 text-white/80">
        <li className="flex gap-2">
          <span className="font-bold text-neon-blue">1.</span>
          <span>Fill in your complaint description with clear details about what happened, where, and when.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-neon-blue">2.</span>
          <span>Capture or upload evidence (photos/videos) using the camera or file upload options.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-neon-blue">3.</span>
          <span>Confirm your location is detected (it will be embedded in captured photos).</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-neon-blue">4.</span>
          <span>Select the priority level (Low, Medium, or High) based on urgency.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-neon-blue">5.</span>
          <span>Submit your complaint and note the generated Complaint ID for tracking.</span>
        </li>
      </ol>
    ),
  },
  {
    id: 'camera',
    icon: FiCamera,
    title: 'Camera Permission Guide',
    content: (
      <div className="space-y-3 text-white/80">
        <p>Camera access is required to capture live evidence (photos/videos) directly from your device.</p>
        <p className="font-semibold text-white/90">If camera access is blocked:</p>
        <ol className="space-y-2 ml-4">
          <li>Click the camera or lock icon in your browser's address bar (left side).</li>
          <li>Select "Allow" or "Reset Permission" for camera access.</li>
          <li>Reload the page to apply the changes.</li>
          <li>Try capturing again when the camera modal opens.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'location',
    icon: FiMapPin,
    title: 'Location Permission Guide',
    content: (
      <div className="space-y-3 text-white/80">
        <p>Location access is required to embed GPS coordinates and address information in your evidence for verification.</p>
        <p className="font-semibold text-white/90">If location access is blocked:</p>
        <ol className="space-y-2 ml-4">
          <li>Click the location or lock icon in your browser's address bar (left side).</li>
          <li>Select "Allow" or "Reset Permission" for location access.</li>
          <li>Reload the page to apply the changes.</li>
          <li>When you open the camera, location will be fetched automatically.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'support',
    icon: FiMail,
    title: 'Support',
    content: ({ currentUser }) => (
      <div className="space-y-4">
        <p className="text-white/80">Need additional help? Our support team will contact you at:</p>
        <div className="flex flex-wrap gap-3">
          <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${currentUser?.email || 'support@complaintsystem.gov'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/20 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/30 transition-colors">
            <FiMail className="w-4 h-4" />
            {currentUser?.email || 'support@complaintsystem.gov'}
          </a>
          <a href={`tel:${currentUser?.mobile || '+91-1800-XXX-XXXX'}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-purple/20 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/30 transition-colors">
            <FiPhone className="w-4 h-4" />
            {currentUser?.mobile || '+91-1800-XXX-XXXX'}
          </a>
        </div>
      </div>
    ),
  },
]

export default function Help() {
  const { currentUser } = useAuth()
  const [expandedSection, setExpandedSection] = useState(null)

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <GlassCard>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Help & Support</h1>
          <p className="text-white/50 mt-1">Find answers to common questions and get help with using the complaint system.</p>
        </div>

        <div className="space-y-3">
          {helpSections.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.id

            return (
              <div
                key={section.id}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-blue/20">
                      <Icon className="w-5 h-5 text-neon-blue" />
                    </div>
                    <span className="font-semibold text-white">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <FiChevronUp className="w-5 h-5 text-white/60" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 text-sm border-t border-white/10 mt-2">
                    <div className="pt-4">{typeof section.content === 'function' ? section.content({ currentUser }) : section.content}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}
