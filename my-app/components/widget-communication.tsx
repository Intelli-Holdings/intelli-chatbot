"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WEBSOCKET_BASE_URL = (process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://backend.intelliconcierge.com/ws").replace(/\/$/, "");

interface WidgetCommunicationProps {
  widgetKey: string;
  widgetName: string;
  avatarUrl: string;
  brandColor: string;
  greetingMessage: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function WidgetCommunication({
  widgetKey,
  widgetName,
  avatarUrl,
  brandColor,
  greetingMessage,
}: WidgetCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const connectionAttempts = useRef(0);
  const visitorIdRef = useRef(`preview_${Math.random().toString(36).slice(2, 10)}`);
  const pendingResponsesRef = useRef(0);

  const updateTyping = useCallback((delta: number) => {
    pendingResponsesRef.current = Math.max(0, pendingResponsesRef.current + delta);
    setIsTyping(pendingResponsesRef.current > 0);
  }, []);

  // Initialize with greeting message
  useEffect(() => {
    setMessages([{
      id: Date.now().toString(),
      text: greetingMessage,
      sender: "bot",
      timestamp: new Date(),
    }]);
  }, [greetingMessage]);

  useEffect(() => {
    pendingResponsesRef.current = 0;
    setIsTyping(false);
  }, [widgetKey]);

  // Connect to WebSocket
  useEffect(() => {
    if (!widgetKey || demoMode) return;

    const connectWebSocket = () => {
      try {
        console.log("[WidgetCommunication] Connecting to WebSocket...");
        const ws = new WebSocket(`${WEBSOCKET_BASE_URL}/chat/${widgetKey}/${visitorIdRef.current}/`);

        ws.onopen = () => {
          console.log("[WidgetCommunication] WebSocket connected");
          setIsConnected(true);
          connectionAttempts.current = 0;
        };

        ws.onmessage = (event) => {
          console.log("[WidgetCommunication] Message received:", event.data);
          try {
            const data = JSON.parse(event.data);
            const rawMessage = data.answer ?? data.message;
            let messageText: string | undefined;

            if (Array.isArray(rawMessage)) {
              messageText = rawMessage.find((item) => typeof item === "string");
            } else if (typeof rawMessage === "string") {
              messageText = rawMessage;
            }

            if (messageText) {
              const isBotMessage = data.sender_type !== "visitor";
              const newMessage: Message = {
                id: Date.now().toString(),
                text: messageText,
                sender: isBotMessage ? "bot" : "user",
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, newMessage]);
              if (isBotMessage) {
                updateTyping(-1);
              }
            }
          } catch (error) {
            console.error("[WidgetCommunication] Error parsing message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("[WidgetCommunication] WebSocket error:", error);
          connectionAttempts.current++;

          // Switch to demo mode after 2 failed attempts
          if (connectionAttempts.current >= 2) {
            console.log("[WidgetCommunication] Switching to demo mode");
            setDemoMode(true);
            setIsConnected(true);
            pendingResponsesRef.current = 0;
            setIsTyping(false);
          }
        };

        ws.onclose = () => {
          console.log("[WidgetCommunication] WebSocket disconnected");
          setIsConnected(false);

          // Don't reconnect if in demo mode
          if (!demoMode && connectionAttempts.current < 2) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log("[WidgetCommunication] Attempting to reconnect...");
              connectWebSocket();
            }, 2000);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("[WidgetCommunication] Error creating WebSocket:", error);
        setDemoMode(true);
        setIsConnected(true);
      }
    };

    connectWebSocket();

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [widgetKey, demoMode, updateTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (demoMode) {
      updateTyping(1);
      // Demo mode: simulate bot response
      setTimeout(() => {
        const demoResponses = [
          "Thanks for testing! This is demo mode since WebSocket couldn't connect.",
          "I'm a simulated response. Your actual widget will connect to your backend!",
          "This shows how the chat will look and feel. Deploy to see it live!",
          `You said: "${text}". In production, your AI assistant will respond here.`,
        ];
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];

        const botMessage: Message = {
          id: Date.now().toString(),
          text: randomResponse,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        updateTyping(-1);
      }, 1000);
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Real mode: send to backend
      try {
        updateTyping(1);
        wsRef.current.send(JSON.stringify({
          message: text,
          sender_type: "visitor",
          widget_key: widgetKey,
          visitor_id: visitorIdRef.current,
        }));
        console.log("[WidgetCommunication] Message sent:", text);
      } catch (error) {
        console.error("[WidgetCommunication] Error sending message:", error);
        updateTyping(-1);
      }
    }
  };

  return (
    <div className="relative w-full min-h-[700px] h-[800px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl shadow-inner overflow-hidden border border-slate-200">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      {/* Connection Status Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className={`px-4 py-2 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2 ${
          demoMode
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            : isConnected
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white animate-pulse'
        }`}>
          {demoMode ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Demo Mode
            </>
          ) : isConnected ? (
            <>
              <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
              Live Connected
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Connecting...
            </>
          )}
        </div>
      </div>

      {/* Interactive Widget */}
      <LiveWidgetPreview
        widgetName={widgetName}
        avatarUrl={avatarUrl}
        brandColor={brandColor}
        messages={messages}
        onSendMessage={sendMessage}
        isConnected={isConnected || demoMode}
        isTyping={isTyping}
        demoMode={demoMode}
      />
    </div>
  );
}

// Interactive Widget Preview Component
function LiveWidgetPreview({
  widgetName,
  avatarUrl,
  brandColor,
  messages,
  onSendMessage,
  isConnected,
  isTyping,
  demoMode,
}: {
  widgetName: string;
  avatarUrl: string;
  brandColor: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isConnected: boolean;
  isTyping: boolean;
  demoMode?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'contact'>('chat');
  const [inputText, setInputText] = useState("");
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() && isConnected) {
      onSendMessage(inputText);
      setInputText("");

      // Show typing indicator in demo mode
      if (demoMode) {
        setLocalIsTyping(true);
        setTimeout(() => setLocalIsTyping(false), 1500);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email) {
      return;
    }

    setFormSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', phone: '' });
    }, 3000);
  };

  const position = { bottom: '24px', right: '24px', top: 'auto', left: 'auto' };
  const CHAT_BUBBLE_SIZE = 64;

  return (
    <>
      {/* Mock website content */}
      <div className="absolute inset-0 flex items-center justify-center p-8 z-0">
        <div className="text-center space-y-4 max-w-lg">
          <div className="text-5xl font-bold bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">
            Your Website
          </div>
          <div className="text-base text-slate-400 font-medium">
            This is how your visitors will see the widget
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse delay-75"></div>
            <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse delay-150"></div>
          </div>
        </div>
      </div>

      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            ...position,
            width: `${CHAT_BUBBLE_SIZE}px`,
            height: `${CHAT_BUBBLE_SIZE}px`,
            backgroundColor: brandColor,
            boxShadow: `0 8px 24px ${brandColor}40, 0 4px 8px ${brandColor}20`,
          }}
          className="absolute hover:scale-110 transition-all duration-300 flex items-center justify-center z-20 rounded-full animate-bounce-slow"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            ...position,
            width: '400px',
            height: '600px',
          }}
          className="absolute shadow-2xl flex flex-col bg-white rounded-2xl overflow-hidden z-20 border border-slate-200 animate-slide-up"
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%)`,
            }}
            className="p-5 flex items-center justify-between text-white shadow-lg relative overflow-hidden"
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <img
                  src={avatarUrl || "/Avatar.png"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-3 border-white/30 shadow-lg"
                />
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                  isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}></div>
              </div>
              <div>
                <div className="font-bold text-base">{widgetName}</div>
                <div className="text-xs opacity-90 font-medium">
                  {isConnected ? '● Online now' : 'Connecting...'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-all duration-200 relative z-10 active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'border-b-2 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-slate-50'
              }`}
              style={{
                borderBottomColor: activeTab === 'chat' ? brandColor : 'transparent',
                color: activeTab === 'chat' ? brandColor : undefined
              }}
            >
              💬 Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-all ${
                activeTab === 'contact'
                  ? 'border-b-2'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-slate-50'
              }`}
              style={{
                borderBottomColor: activeTab === 'contact' ? brandColor : 'transparent',
                color: activeTab === 'contact' ? brandColor : undefined
              }}
            >
              📋 Contact
            </button>
          </div>

          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {message.sender === 'bot' && (
                  <img
                    src={avatarUrl || "/Avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm"
                  />
                )}
                <div
                  style={{
                    backgroundColor: message.sender === 'user' ? brandColor : '#F3F4F6',
                  }}
                  className={`px-4 py-2.5 rounded-2xl max-w-[75%] shadow-sm ${
                    message.sender === 'user'
                      ? 'text-white rounded-br-md'
                      : 'text-gray-800 rounded-bl-md'
                  }`}
                >
                  <div className="text-sm leading-relaxed">{message.text}</div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {(isTyping || localIsTyping) && (
              <div className="flex gap-2 items-center animate-fade-in">
                <img
                  src={avatarUrl || "/Avatar.png"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full shadow-sm"
                />
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm bg-slate-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!isConnected || !inputText.trim()}
                style={{ backgroundColor: isConnected && inputText.trim() ? brandColor : '#94a3b8' }}
                className="px-5 py-3 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:cursor-not-allowed active:scale-95 flex items-center justify-center min-w-[48px]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            {demoMode && (
              <div className="mt-2 text-xs text-center text-blue-600 font-medium">
                💡 Demo mode - Deploy to test full functionality.
              </div>
            )}
          </div>
            </>
          )}

          {/* Contact Panel */}
          {activeTab === 'contact' && (
            <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Thanks for reaching out!</h3>
                    <p className="text-sm text-gray-600">We&apos;ll get back to you soon.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleContactSubmit}
                    disabled={!contactForm.name || !contactForm.email}
                    style={{ backgroundColor: contactForm.name && contactForm.email ? brandColor : '#94a3b8' }}
                    className="w-full px-5 py-3 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .delay-75 {
          animation-delay: 75ms;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </>
  );
}
