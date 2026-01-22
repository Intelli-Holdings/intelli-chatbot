'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Type, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TextNodeData {
  type: 'text';
  label: string;
  message: string;
  delaySeconds?: number;
}

interface TextNodeProps extends NodeProps<TextNodeData> {}

function TextNode({ data, selected }: TextNodeProps) {
  const { message, delaySeconds } = data;

  // Truncate message
  const truncatedMessage = message && message.length > 100
    ? `${message.substring(0, 100)}...`
    : message;

  return (
    <div
      className={cn(
        'min-w-[220px] max-w-[280px] rounded-lg border bg-card shadow-sm transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-indigo-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-lg bg-indigo-500 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          <span className="text-sm font-medium">Text Message</span>
        </div>
        {delaySeconds && delaySeconds > 0 && (
          <Badge variant="secondary" className="bg-indigo-400/30 text-white text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {delaySeconds}s
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {truncatedMessage ? (
          <p className="text-sm text-muted-foreground leading-snug whitespace-pre-wrap">
            {truncatedMessage}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No message configured
          </p>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-indigo-500 !bg-white"
      />
    </div>
  );
}

export default memo(TextNode);
