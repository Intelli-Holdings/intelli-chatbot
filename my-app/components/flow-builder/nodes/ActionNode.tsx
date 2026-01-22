'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Send, Bot, XCircle } from 'lucide-react';
import { ActionNodeData } from '@/types/chatbot-automation';
import { cn } from '@/lib/utils';

interface ActionNodeProps extends NodeProps<ActionNodeData> {}

function ActionNode({ data, selected }: ActionNodeProps) {
  const { actionType, message } = data;

  const getConfig = () => {
    switch (actionType) {
      case 'send_message':
        return {
          icon: Send,
          title: 'Send Message',
          color: 'bg-purple-500',
          borderColor: 'border-purple-500',
        };
      case 'fallback_ai':
        return {
          icon: Bot,
          title: 'Hand off to AI',
          color: 'bg-orange-500',
          borderColor: 'border-orange-500',
        };
      case 'end':
        return {
          icon: XCircle,
          title: 'End Conversation',
          color: 'bg-red-500',
          borderColor: 'border-red-500',
        };
      default:
        return {
          icon: Send,
          title: 'Action',
          color: 'bg-gray-500',
          borderColor: 'border-gray-500',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  // Truncate message
  const truncatedMessage = message && message.length > 60
    ? `${message.substring(0, 60)}...`
    : message;

  return (
    <div
      className={cn(
        'min-w-[200px] max-w-[260px] rounded-lg border bg-card shadow-sm transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          '!h-3 !w-3 !border-2 !bg-white',
          `!${config.borderColor}`
        )}
        style={{ borderColor: config.color.replace('bg-', '').includes('purple') ? '#a855f7' : config.color.replace('bg-', '').includes('orange') ? '#f97316' : '#ef4444' }}
      />

      {/* Header */}
      <div className={cn(
        'flex items-center gap-2 rounded-t-lg px-3 py-2 text-white',
        config.color
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.title}</span>
      </div>

      {/* Content */}
      <div className="p-3">
        {actionType === 'send_message' && (
          <div className="space-y-1">
            {truncatedMessage ? (
              <p className="text-sm text-muted-foreground leading-snug">
                {truncatedMessage}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No message configured
              </p>
            )}
          </div>
        )}

        {actionType === 'fallback_ai' && (
          <p className="text-sm text-muted-foreground">
            Connects user to AI assistant for intelligent responses
          </p>
        )}

        {actionType === 'end' && (
          <p className="text-sm text-muted-foreground">
            Ends the chatbot conversation
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(ActionNode);
