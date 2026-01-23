'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Send, Bot, XCircle } from 'lucide-react';
import { ActionNodeData } from '@/types/chatbot-automation';
import { cn } from '@/lib/utils';

interface ActionNodeProps extends NodeProps<ActionNodeData> {}

function ActionNode({ data, selected }: ActionNodeProps) {
  const { actionType, message, assistantId } = data;

  const getConfig = () => {
    switch (actionType) {
      case 'send_message':
        return {
          icon: Send,
          title: 'Text',
          color: 'bg-purple-500',
          borderColor: '#a855f7',
        };
      case 'fallback_ai':
        return {
          icon: Bot,
          title: 'AI Assistant',
          color: 'bg-orange-500',
          borderColor: '#f97316',
        };
      case 'end':
        return {
          icon: XCircle,
          title: 'End Conversation',
          color: 'bg-red-500',
          borderColor: '#ef4444',
        };
      default:
        return {
          icon: Send,
          title: 'Action',
          color: 'bg-gray-500',
          borderColor: '#6b7280',
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
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: config.borderColor }}
      />

      {/* Header */}
      <div className={cn(
        'flex items-center justify-center gap-2 rounded-t-lg px-3 py-2 text-white',
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
          <div className="space-y-1">
            {assistantId ? (
              <p className="text-sm text-muted-foreground">
                Connected to assistant
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No assistant selected
              </p>
            )}
          </div>
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
