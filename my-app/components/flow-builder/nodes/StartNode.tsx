'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Key, MessageSquare, MousePointer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StartNodeData } from '@/types/chatbot-automation';
import { cn } from '@/lib/utils';

interface StartNodeProps extends NodeProps<StartNodeData> {}

function StartNode({ data, selected }: StartNodeProps) {
  const { trigger } = data;

  const getTriggerIcon = () => {
    switch (trigger.type) {
      case 'keyword':
        return <Key className="h-3.5 w-3.5" />;
      case 'first_message':
        return <MessageSquare className="h-3.5 w-3.5" />;
      case 'button_click':
        return <MousePointer className="h-3.5 w-3.5" />;
      default:
        return <Zap className="h-3.5 w-3.5" />;
    }
  };

  const getTriggerLabel = () => {
    switch (trigger.type) {
      case 'keyword':
        return 'Keyword Trigger';
      case 'first_message':
        return 'First Message';
      case 'button_click':
        return 'Button Click';
      default:
        return 'Trigger';
    }
  };

  return (
    <div
      className={cn(
        'min-w-[240px] rounded-lg border bg-card shadow-sm transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-lg bg-green-500 px-3 py-2 text-white">
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium">Start</span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          {getTriggerIcon()}
          <span className="text-sm font-medium">{getTriggerLabel()}</span>
        </div>

        {trigger.type === 'keyword' && trigger.keywords && trigger.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trigger.keywords.slice(0, 5).map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {trigger.keywords.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{trigger.keywords.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {trigger.type === 'keyword' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Case {trigger.caseSensitive ? 'sensitive' : 'insensitive'}</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-green-500 !bg-white"
      />
    </div>
  );
}

export default memo(StartNode);
