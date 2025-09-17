import { DefaultTemplate } from "@/data/default-templates"
import { X, Phone, Video, MoreVertical, Search, CheckCheck } from "lucide-react"

interface WhatsAppChatPreviewProps {
  template: DefaultTemplate
  onClose: () => void
}

export function WhatsAppChatPreview({ template, onClose }: WhatsAppChatPreviewProps) {
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl">
      {/* WhatsApp Header */}
      <div className="bg-[#008069] text-white">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-base">Your Business</div>
              <div className="text-xs opacity-80">online</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div 
        className="min-h-[500px] max-h-[600px] overflow-y-auto"
        style={{ 
          background: '#e5ddd5',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-30 7c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zM10 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        <div className="p-4 space-y-3">
          {/* Date/Encryption Badge */}
          <div className="flex justify-center my-4">
            <div 
              className="text-xs px-3 py-1.5 rounded-md shadow-sm"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#54656f'
              }}
            >
              TODAY
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div 
              className="text-xs px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: '#fef8c7',
                color: '#54656f'
              }}
            >
              🔒 Messages are end-to-end encrypted
            </div>
          </div>
          
          {/* Business Message - Outgoing */}
          <div className="flex justify-end mb-2">
            <div 
              className="relative max-w-[75%]"
              style={{
                marginRight: '8px'
              }}
            >
              <div 
                className="rounded-lg shadow-sm"
                style={{ 
                  backgroundColor: '#d9fdd3',
                  borderTopLeftRadius: '7px',
                  borderTopRightRadius: '7px',
                  borderBottomLeftRadius: '7px',
                  borderBottomRightRadius: '0px'
                }}
              >
                <div className="px-3 pt-2 pb-1">
                  {template.preview?.header && (
                    <div className="font-semibold text-[#111b21] text-sm mb-1">
                      {template.preview?.header}
                    </div>
                  )}
                  
                  <div 
                    className="text-[#111b21] text-[14px] leading-[19px] whitespace-pre-wrap"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {template.preview?.body}
                  </div>
                  
                  {template.preview?.footer && (
                    <div className="text-xs text-[#667781] mt-2">
                      {template.preview?.footer}
                    </div>
                  )}
                  
                  {template.preview?.buttons && template.preview?.buttons.length > 0 && (
                    <div className="mt-3 -mx-3 px-3 border-t border-[#c7e7c3] pt-2 space-y-1">
                      {template.preview?.buttons.map((button, index) => (
                        <div 
                          key={index}
                          className="w-full py-2 text-center text-[#00a5f4] text-sm font-medium hover:bg-[#c7e7c3] rounded cursor-pointer transition-colors"
                        >
                          {button}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[11px] text-[#667781]">
                      {getCurrentTime()}
                    </span>
                    <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
              {/* Message tail for outgoing */}
              <div 
                className="absolute -right-2 top-0 w-3 h-3"
                style={{
                  background: '#d9fdd3',
                  clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                }}
              />
            </div>
          </div>
          
          {/* Customer Response - Incoming */}
          <div className="flex justify-start">
            <div 
              className="relative max-w-[75%]"
              style={{
                marginLeft: '8px'
              }}
            >
              <div 
                className="rounded-lg shadow-sm"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderTopLeftRadius: '7px',
                  borderTopRightRadius: '7px',
                  borderBottomRightRadius: '7px',
                  borderBottomLeftRadius: '0px'
                }}
              >
                <div className="px-3 pt-2 pb-1">
                  <div 
                    className="text-[#111b21] text-[14px] leading-[19px]"
                    style={{ wordBreak: 'break-word' }}
                  >
                    Thanks for the information! 👍
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[11px] text-[#667781]">
                      12:35 PM
                    </span>
                  </div>
                </div>
              </div>
              {/* Message tail for incoming */}
              <div 
                className="absolute -left-2 top-0 w-3 h-3"
                style={{
                  background: '#ffffff',
                  clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
                }}
              />
            </div>
          </div>

          {/* Another business message showing typing indicator */}
          <div className="flex justify-end mb-2">
            <div 
              className="relative max-w-[75%]"
              style={{
                marginRight: '8px'
              }}
            >
              <div 
                className="rounded-lg shadow-sm"
                style={{ 
                  backgroundColor: '#d9fdd3',
                  borderTopLeftRadius: '7px',
                  borderTopRightRadius: '7px',
                  borderBottomLeftRadius: '7px',
                  borderBottomRightRadius: '0px'
                }}
              >
                <div className="px-3 pt-2 pb-1">
                  <div 
                    className="text-[#111b21] text-[14px] leading-[19px]"
                    style={{ wordBreak: 'break-word' }}
                  >
                    Is there anything else I can help you with today?
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[11px] text-[#667781]">
                      12:36 PM
                    </span>
                    <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
              {/* Message tail */}
              <div 
                className="absolute -right-2 top-0 w-3 h-3"
                style={{
                  background: '#d9fdd3',
                  clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Info Bar */}
      <div className="bg-[#f0f2f5] border-t border-[#e9edef] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm text-[#111b21]">{template.name}</div>
            <div className="text-xs text-[#667781]">
              {template.category} Template • Preview Mode
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00a884] text-white">
              Template
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}