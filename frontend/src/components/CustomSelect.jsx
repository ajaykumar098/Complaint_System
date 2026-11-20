import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown } from 'react-icons/fi'

export default function CustomSelect({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'Select an option'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width
      })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) updatePosition()
          setIsOpen(!isOpen)
        }}
        className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-200 text-sm hover:border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 flex items-center justify-between transition-all"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 max-h-60 overflow-y-auto py-1 backdrop-blur-md"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-3.5 py-2 text-sm text-left transition-colors flex items-center justify-between ${
                option.value === value
                  ? 'bg-blue-600/15 text-blue-400 font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
