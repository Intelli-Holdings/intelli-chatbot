'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Type, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

export interface TextNodeData {
  type: 'text';
  label: string;
  message: string;
  delaySeconds?: number;
}

interface TextNodeProps extends NodeProps<TextNodeData> {}

function TextNode({ id, data, selected }: TextNodeProps) {
  const { message, delaySeconds } = data;
  const validationClass = useNodeValidationClass(id);

  // Truncate message
  const truncatedMessage = message && message.length > 100
    ? `${message.substring(0, 100)}...`
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
        className="!h-3 !w-3 !border-2 !border-indigo-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-xl bg-gradient-to-r from-indigo-500 to-indigo-400 px-3 py-2 text-white">
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
      <div className="p-3 min-h-[48px] flex items-start">
        {truncatedMessage ? (
          <p className="text-sm text-muted-foreground leading-snug whitespace-pre-wrap">
            {truncatedMessage}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            No message configured
          </p>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-indigo-500 !bg-white"
      />
    </div>
  );
}

export default memo(TextNode);
