"use client"

import { useState } from 'react'

interface WidgetPreviewProps {
  widget: {
    widget_name: string
    avatar_url: string
    brand_color: string
    greeting_message: string
    help_text: string
    button_text: string
    widget_position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    widget_size: 'small' | 'medium' | 'large'
    header_color: string
    visitor_message_color: string
    business_message_color: string
    font_family: string
    font_size: number
    border_radius: number
    chat_window_width: number
    chat_window_height: number
    enable_sound: boolean
    show_powered_by: boolean
    animation_style: string
  }
  isOpen?: boolean
  onToggleOpen?: () => void
}

const WidgetPreview = ({ widget, isOpen = true, onToggleOpen }: WidgetPreviewProps) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'contact'>('chat')

  // Backend uses fixed 60x60px chat bubble, widget_size only affects chat window
  const CHAT_BUBBLE_SIZE = 60

  const sizeMap = {
    small: { windowScale: 0.85 },
    medium: { windowScale: 1 },
    large: { windowScale: 1.15 }
  }

  const positionMap = {
    'bottom-right': { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
    'bottom-left': { bottom: '20px', left: '20px', top: 'auto', right: 'auto' },
    'top-right': { top: '20px', right: '20px', bottom: 'auto', left: 'auto' },
    'top-left': { top: '20px', left: '20px', bottom: 'auto', right: 'auto' }
  }

  const animationStyles = {
    'fade': 'animate-fadeIn',
    'slide': 'animate-slideIn',
    'bounce': 'animate-bounceIn',
    'none': ''
  }

  const size = sizeMap[widget.widget_size]
  const position = positionMap[widget.widget_position]
  const windowWidth = Math.min(widget.chat_window_width * size.windowScale, 500)
  const windowHeight = Math.min(widget.chat_window_height * size.windowScale, 700)
  const animationClass = animationStyles[widget.animation_style as keyof typeof animationStyles] || ''

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div className="relative w-full min-h-[700px] h-[800px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border overflow-hidden">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulseBorder {
          0%, 100% {
            box-shadow: 0 0 0 0px ${hexToRgba(widget.brand_color, 0.7)};
          }
          50% {
            box-shadow: 0 0 0 8px ${hexToRgba(widget.brand_color, 0)};
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .chat-bubble-pulse {
          animation: pulseBorder 2s infinite;
        }
      `}</style>

      {/* Preview Label */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm z-10">
        Live Preview
      </div>

      {/* Widget State Toggle */}
      {onToggleOpen && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg z-10 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Widget State:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Closed</span>
            <button
              type="button"
              onClick={onToggleOpen}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isOpen ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isOpen ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-xs text-gray-500">Open</span>
          </div>
        </div>
      )}

      {/* Mock website content */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-gray-300 dark:text-gray-600">Your Website</div>
          <div className="text-sm text-gray-400 dark:text-gray-500">Widget will appear in {widget.widget_position}</div>
        </div>
      </div>

      {/* Widget Button - Fixed 60x60px */}
      {!isOpen && (
        <button
          style={{
            ...position,
            width: `${CHAT_BUBBLE_SIZE}px`,
            height: `${CHAT_BUBBLE_SIZE}px`,
            backgroundColor: widget.brand_color,
            borderRadius: '50%'
          }}
          className="absolute shadow-lg hover:scale-105 hover:rotate-6 transition-all duration-300 flex items-center justify-center z-20 chat-bubble-pulse"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Widget Window */}
      {isOpen && (
        <div
          style={{
            ...position,
            width: `${windowWidth}px`,
            height: `${windowHeight}px`,
            borderRadius: `${widget.border_radius}px`,
            fontFamily: widget.font_family,
            fontSize: `${widget.font_size}px`
          }}
          className={`absolute shadow-2xl flex flex-col bg-white dark:bg-gray-800 overflow-hidden z-20 ${animationClass}`}
        >
          {/* Header */}
          <div
            style={{ backgroundColor: widget.header_color }}
            className="p-4 flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={widget.avatar_url || "/placeholder.svg"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white/20"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="font-semibold">{widget.widget_name}</div>
                <div className="text-xs opacity-90">Online</div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="hover:bg-white/10 p-1.5 rounded transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveTab('chat')
              }}
              className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'border-b-2 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                borderBottomColor: activeTab === 'chat' ? widget.brand_color : 'transparent',
                color: activeTab === 'chat' ? widget.brand_color : undefined
              }}
            >
              💬 Chat
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveTab('contact')
              }}
              className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'border-b-2'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                borderBottomColor: activeTab === 'contact' ? widget.brand_color : 'transparent',
                color: activeTab === 'contact' ? widget.brand_color : undefined
              }}
            >
              📋 Contact
            </button>
          </div>

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {/* Business Message */}
                <div className="flex gap-2 animate-fadeIn">
                  <img
                    src={widget.avatar_url || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div
                    style={{
                      backgroundColor: widget.business_message_color,
                      borderRadius: `${widget.border_radius * 0.8}px`
                    }}
                    className="px-3 py-2 max-w-[80%] text-gray-800 dark:text-gray-200 shadow-sm"
                  >
                    {widget.greeting_message}
                  </div>
                </div>

                {/* Visitor Message */}
                <div className="flex justify-end animate-fadeIn">
                  <div
                    style={{
                      backgroundColor: widget.visitor_message_color,
                      borderRadius: `${widget.border_radius * 0.8}px`
                    }}
                    className="px-3 py-2 max-w-[80%] text-white shadow-sm"
                  >
                    Hello! I have a question.
                  </div>
                </div>

                {/* Business Response */}
                <div className="flex gap-2 animate-fadeIn">
                  <img
                    src={widget.avatar_url || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div
                    style={{
                      backgroundColor: widget.business_message_color,
                      borderRadius: `${widget.border_radius * 0.8}px`
                    }}
                    className="px-3 py-2 max-w-[80%] text-gray-800 dark:text-gray-200 shadow-sm"
                  >
                    I'd be happy to help! What would you like to know?
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex gap-2">
                  <img
                    src={widget.avatar_url || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-full flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ borderRadius: `${widget.border_radius * 0.6}px` }}
                    disabled
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    style={{ backgroundColor: widget.brand_color, borderRadius: `${widget.border_radius * 0.6}px` }}
                    className="px-4 py-2 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                {widget.show_powered_by && (
                  <div className="text-center mt-2 text-xs text-gray-400">
                    Powered by <span className="font-semibold">IntelliConcierge</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Contact Panel */}
          {activeTab === 'contact' && (
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    style={{ borderRadius: `${widget.border_radius * 0.6}px` }}
                    placeholder="Your name"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    style={{ borderRadius: `${widget.border_radius * 0.6}px` }}
                    placeholder="your@email.com"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    style={{ borderRadius: `${widget.border_radius * 0.6}px` }}
                    placeholder="+1 (555) 000-0000"
                    disabled
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  style={{ backgroundColor: widget.brand_color, borderRadius: `${widget.border_radius * 0.6}px` }}
                  className="w-full px-4 py-2 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm mt-2"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text Tooltip (when closed) */}
      {!isOpen && widget.help_text && (
        <div
          style={{
            ...position,
            [position.bottom ? 'bottom' : 'top']: position.bottom ? `${CHAT_BUBBLE_SIZE + 30}px` : `${CHAT_BUBBLE_SIZE + 30}px`,
            right: position.right,
            left: position.left
          }}
          className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg z-10 animate-fadeIn"
        >
          {widget.help_text}
          <div
            style={{
              position: 'absolute',
              [position.bottom ? 'top' : 'bottom']: '100%',
              right: '12px',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              [position.bottom ? 'borderTop' : 'borderBottom']: '6px solid rgb(31, 41, 55)'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default WidgetPreview
