import { useState } from 'react'
import { FiChevronDown, FiChevronUp, FiFileText, FiCamera, FiMapPin, FiMail, FiPhone, FiHelpCircle } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import GlassCard from '../components/GlassCard'

const helpSections = [
  {
    id: 'submit',
    icon: FiFileText,
    title: 'How to Submit an Official Grievance',
    content: (
      <ol className="space-y-2 text-slate-300 text-xs sm:text-sm">
        <li className="flex gap-2.5">
          <span className="font-bold text-blue-400">1.</span>
          <span>Detail the grievance clearly: specify date, location, landmark, and what occurred.</span>
        </li>
        <li className="flex gap-2.5">
          <span className="font-bold text-blue-400">2.</span>
          <span>Attach verified media evidence (photos or video footage) taken live or uploaded.</span>
        </li>
        <li className="flex gap-2.5">
          <span className="font-bold text-blue-400">3.</span>
          <span>Grant GPS permission so your evidence is cryptographically tagged with exact coordinates.</span>
        </li>
        <li className="flex gap-2.5">
          <span className="font-bold text-blue-400">4.</span>
          <span>Assign the appropriate urgency level (Low, Medium, or High).</span>
        </li>
        <li className="flex gap-2.5">
          <span className="font-bold text-blue-400">5.</span>
          <span>Submit and record the generated unique Complaint Tracking ID for future inquiries.</span>
        </li>
      </ol>
    ),
  },
  {
    id: 'camera',
    icon: FiCamera,
    title: 'Camera Permission & Evidence Guidelines',
    content: (
      <div className="space-y-3 text-slate-300 text-xs sm:text-sm">
        <p>Live camera capture ensures tamper-free photographic proof of the reported civic issue.</p>
        <p className="font-semibold text-slate-100">If camera access is blocked:</p>
        <ol className="space-y-1.5 ml-4 list-decimal text-slate-400">
          <li>Click the lock or camera icon in your browser address bar.</li>
          <li>Set Camera permission to &quot;Allow&quot;.</li>
          <li>Refresh the web page to apply permissions.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'location',
    icon: FiMapPin,
    title: 'GPS Geolocation & Verification Guide',
    content: (
      <div className="space-y-3 text-slate-300 text-xs sm:text-sm">
        <p>Location coordinates are stamped onto uploaded evidence to prevent fraudulent petitions and pinpoint exact municipal jurisdictions.</p>
        <p className="font-semibold text-slate-100">If location access is blocked:</p>
        <ol className="space-y-1.5 ml-4 list-decimal text-slate-400">
          <li>Click the lock icon next to the URL in your browser.</li>
          <li>Ensure Location is enabled.</li>
          <li>Reload and reopen the camera viewfinder to synchronize coordinates.</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'support',
    icon: FiMail,
    title: 'Direct Helpdesk & Contact',
    content: ({ currentUser }) => (
      <div className="space-y-3">
        <p className="text-slate-300 text-xs sm:text-sm">Need direct administrative assistance? Connect with our support desk:</p>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${currentUser?.email || 'support@civicresolve.gov'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/10 border border-blue-500/25 text-blue-400 hover:bg-blue-600/20 text-xs font-medium transition-colors"
          >
            <FiMail className="w-3.5 h-3.5" />
            <span>Email Official Desk</span>
          </a>
          <a
            href={`tel:${currentUser?.mobile || '+1-800-555-0199'}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-600/20 text-xs font-medium transition-colors"
          >
            <FiPhone className="w-3.5 h-3.5" />
            <span>Toll-Free Helpline</span>
          </a>
        </div>
      </div>
    ),
  },
]

export default function Help() {
  const { currentUser } = useAuth()
  const [expandedSection, setExpandedSection] = useState('submit')

  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <GlassCard className="border-slate-800">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FiHelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Citizen Help & Guidance</h1>
            <p className="text-slate-400 text-xs mt-0.5">Instructions and best practices for filing and resolving grievances</p>
          </div>
        </div>

        <div className="space-y-3">
          {helpSections.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSection === section.id

            return (
              <div
                key={section.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm text-slate-100">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <FiChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <FiChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-900 mt-1">
                    <div className="pt-3">
                      {typeof section.content === 'function' ? section.content({ currentUser }) : section.content}
                    </div>
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
