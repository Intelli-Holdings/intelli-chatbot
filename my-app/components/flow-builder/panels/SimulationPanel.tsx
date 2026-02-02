'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  RotateCcw,
  Play,
  Bot,
  User,
  Info,
  Image,
  Video,
  FileText,
  Music,
  Variable,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SimulationState, SimulationMessage } from '../simulation/flow-simulator';

interface SimulationPanelProps {
  state: SimulationState;
  availableTriggers: string[];
  onStart: (keyword: string) => void;
  onSendMessage: (message: string, optionId?: string) => void;
  onReset: () => void;
  onClose: () => void;
  onNodeClick?: (nodeId: string) => void;
}

export default function SimulationPanel({
  state,
  availableTriggers,
  onStart,
  onSendMessage,
  onReset,
  onClose,
  onNodeClick,
}: SimulationPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Focus input when waiting for input
  useEffect(() => {
    if (state.waitingForInput) {
      inputRef.current?.focus();
    }
  }, [state.waitingForInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!state.isRunning && !state.messages.length) {
      // Start simulation
      onStart(inputValue.trim());
    } else if (state.waitingForInput) {
      // Send message
      onSendMessage(inputValue.trim());
    }

    setInputValue('');
  };

  const handleOptionClick = (optionId: string, title: string) => {
    onSendMessage(title, optionId);
  };

  const handleTriggerClick = (keyword: string) => {
    onStart(keyword);
  };

  const getMediaIcon = (type?: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return FileText;
      case 'audio': return Music;
      default: return Image;
    }
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 bg-background border-l shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" />
          <span className="font-medium">Flow Preview</span>
          {state.isRunning && (
            <Badge variant="secondary" className="text-xs">
              Running
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onReset}
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {/* Start prompt */}
        {!state.messages.length && (
          <div className="space-y-4">
            <div className="text-center text-muted-foreground text-sm">
              <p>Test your flow by typing a trigger keyword</p>
            </div>

            {availableTriggers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Available triggers:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableTriggers.slice(0, 8).map((trigger, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleTriggerClick(trigger)}
                    >
                      {trigger}
                    </Button>
                  ))}
                </div>
                {availableTriggers.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{availableTriggers.length - 8} more
                  </p>
                )}
              </div>
            )}

            {availableTriggers.length === 0 && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  No triggers configured. Add keywords to a Trigger node.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4">
          {state.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onOptionClick={handleOptionClick}
              onNodeClick={onNodeClick}
              getMediaIcon={getMediaIcon}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Variables collected */}
        {Object.keys(state.variables).length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Variable className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Collected Data
              </span>
            </div>
            <div className="space-y-1">
              {Object.entries(state.variables).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground">{key}:</span>{' '}
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              !state.messages.length
                ? 'Type a trigger keyword...'
                : state.waitingForInput
                ? 'Type your response...'
                : 'Simulation ended'
            }
            disabled={state.messages.length > 0 && !state.waitingForInput}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              !inputValue.trim() ||
              (state.messages.length > 0 && !state.waitingForInput)
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: SimulationMessage;
  onOptionClick: (optionId: string, title: string) => void;
  onNodeClick?: (nodeId: string) => void;
  getMediaIcon: (type?: string) => typeof Image;
}

function MessageBubble({
  message,
  onOptionClick,
  onNodeClick,
  getMediaIcon,
}: MessageBubbleProps) {
  const isBot = message.type === 'bot';
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          {message.content}
        </div>
      </div>
    );
  }

  const MediaIcon = message.mediaType ? getMediaIcon(message.mediaType) : null;

  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isBot ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] space-y-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-3 py-2',
            isBot
              ? 'bg-muted text-foreground'
              : 'bg-primary text-primary-foreground'
          )}
          onClick={() => message.nodeId && onNodeClick?.(message.nodeId)}
          style={{ cursor: message.nodeId ? 'pointer' : 'default' }}
        >
          {/* Media indicator */}
          {MediaIcon && (
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MediaIcon className="h-4 w-4" />
              <span className="text-xs capitalize">{message.mediaType}</span>
            </div>
          )}

          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Options/Buttons */}
        {message.options && message.options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onOptionClick(option.id, option.title)}
              >
                {option.title}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
