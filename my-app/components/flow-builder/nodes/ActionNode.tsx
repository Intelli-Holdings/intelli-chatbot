'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Send, Bot, XCircle } from 'lucide-react';
import { ActionNodeData } from '@/types/chatbot-automation';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

interface ActionNodeProps extends NodeProps<ActionNodeData> {}

function ActionNode({ id, data, selected }: ActionNodeProps) {
  const { actionType, message, assistantId } = data;
  const validationClass = useNodeValidationClass(id);

  const getConfig = () => {
    switch (actionType) {
      case 'send_message':
        return {
          icon: Send,
          title: 'Text',
          color: 'bg-gradient-to-r from-purple-500 to-purple-400',
          borderColor: '#a855f7',
        };
      case 'fallback_ai':
        return {
          icon: Bot,
          title: 'AI Assistant',
          color: 'bg-gradient-to-r from-orange-500 to-amber-400',
          borderColor: '#f97316',
        };
      case 'end':
        return {
          icon: XCircle,
          title: 'End Conversation',
          color: 'bg-gradient-to-r from-red-500 to-rose-400',
          borderColor: '#ef4444',
        };
      default:
        return {
          icon: Send,
          title: 'Action',
          color: 'bg-gradient-to-r from-gray-500 to-gray-400',
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
        'w-[280px] rounded-xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md transition-all relative',
        selected && 'ring-2 ring-[#007fff] ring-offset-2 shadow-[0_0_20px_rgba(0,127,255,0.3)]',
        !selected && validationClass
      )}
    >
      <NodeValidationIndicator nodeId={id} />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: config.borderColor }}
      />

      {/* Header */}
      <div className={cn(
        'flex items-center justify-center gap-2 rounded-t-xl px-3 py-2 text-white',
        config.color
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.title}</span>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[48px] flex items-start">
        {actionType === 'send_message' && (
          truncatedMessage ? (
            <p className="text-sm text-muted-foreground leading-snug">
              {truncatedMessage}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">
              No message configured
            </p>
          )
        )}

        {actionType === 'fallback_ai' && (
          assistantId ? (
            <p className="text-sm text-muted-foreground">
              Connected to assistant
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/60 italic">
              No assistant selected
            </p>
          )
        )}

        {actionType === 'end' && (
          <p className="text-xs text-muted-foreground/60 italic">
            Ends the chatbot conversation
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(ActionNode);
