'use client'

import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import { ArrowUp } from 'lucide-react';

interface ChatWidgetProps {
  widgetKey: string;
  backendUrl: string;
}

interface Message {
  type: 'user' | 'assistant' | 'business';
  content: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ widgetKey, backendUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve the session ID
    const storedSessionId = localStorage.getItem('chat_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('chat_session_id', newSessionId);
    }

    // Load messages from local storage
    const storedMessages = localStorage.getItem(`chat_messages_${sessionId}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [sessionId]);

  useEffect(() => {
    // Save messages to local storage whenever they change
    if (sessionId) {
      localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  useEffect(() => {
    const visitorId = localStorage.getItem('unique_visitor_id') || `visitor_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('unique_visitor_id', visitorId);

    const websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'wss:';
    const websocketUrl = `${websocketProtocol}//intelli-python-backend-lxui.onrender.com/ws/chat/${widgetKey}/${visitorId}/`;

    const connectWebSocket = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      socketRef.current = new WebSocket(websocketUrl);

      socketRef.current.onopen = () => console.log('WebSocket connection established');

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_takeover' || data.sender_type === 'business' || data.sender_type === 'assistant') {
          const newMessage: Message = { type: data.sender_type || 'assistant', content: data.answer };
          setMessages(prev => [...prev, newMessage]);
          setIsLoading(false);
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(connectWebSocket, 2000);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [widgetKey]);

  const sendMessage = (message: string) => {
    setIsLoading(true);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        message,
        sender_type: 'visitor',
        widget_key: widgetKey,
        visitor_id: localStorage.getItem('unique_visitor_id')
      }));
    } else {
      fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_key: widgetKey,
          visitor_id: localStorage.getItem('unique_visitor_id'),
          message
        })
      })
        .then(response => response.json())
        .then(data => {
          const newMessage: Message = { type: 'assistant', content: data.response };
          setMessages(prev => [...prev, newMessage]);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          const errorMessage: Message = { type: 'assistant', content: 'Sorry, there was an error processing your message.' };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
        });
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = { type: 'user', content: inputValue };
      setMessages(prev => [...prev, newMessage]);
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div id="chat-bubble" onClick={() => setIsOpen(!isOpen)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      {isOpen && (
        <div id="chat-container">
          <div id="chat-header">
            <span id="header-spacer"></span>
            <span id="chat-header-text">MEST Recruitment Assistant</span>
            <span id="close-chat" onClick={() => setIsOpen(false)}>&times;</span>
          </div>
          <div id="chat-box" ref={chatBoxRef}>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}-message`}>
                <div className={`message-bubble ${message.type}-bubble`}
                     dangerouslySetInnerHTML={{ __html: marked(message.content) }}>
                </div>
              </div>
            ))}
          </div>
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-bubble assistant-bubble typing-indicator m-2">
                <div className="typing-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}
          <div id="message-input-container">
            <input
              type="text"
              id="message-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Chat with the Assistant..."
            />
            <button onClick={handleSendMessage} className="send-button">
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

