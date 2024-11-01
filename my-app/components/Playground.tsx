import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RotateCw, Send } from 'lucide-react';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

const PlaygroundPage = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! What can I help you with?'
    }
  ]);
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Playground</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Compare
            </Button>
            <Button variant="ghost" size="sm">
              <Lightbulb className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-4">
          {/* Document Title Bar */}
          <div className="flex items-center justify-between p-2 mb-4 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-gray-300"></div>
              <span className="text-sm">Dawkins</span>
            </div>
            <Button variant="ghost" size="sm">
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Area */}
          <div className="h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === 'assistant'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-500 text-white ml-auto'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="what do you know?"
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                />
                <Button onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-center text-gray-400 mt-2">
                Powered By Intelli AI
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlaygroundPage;