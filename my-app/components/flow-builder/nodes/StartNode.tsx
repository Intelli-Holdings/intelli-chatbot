'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, Key, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StartNodeData } from '@/types/chatbot-automation';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

interface StartNodeProps extends NodeProps<StartNodeData> {}

function StartNode({ id, data, selected }: StartNodeProps) {
  const { trigger } = data;
  const validationClass = useNodeValidationClass(id);

  return (
    <div
      className={cn(
        'w-[280px] rounded-xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md transition-all relative',
        selected && 'ring-2 ring-[#007fff] ring-offset-2 shadow-[0_0_20px_rgba(0,127,255,0.3)]',
        !selected && validationClass
      )}
    >
      <NodeValidationIndicator nodeId={id} />
      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-green-500 to-emerald-400 px-3 py-2 text-white">
        <Zap className="h-4 w-4" />
        <span className="text-sm font-medium">Start Flow</span>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[48px] space-y-2">
        <div className="flex items-center gap-2">
          <Key className="h-3.5 w-3.5" />
          <span className="text-sm font-medium">Keyword Trigger</span>
        </div>

        {trigger.keywords && trigger.keywords.length > 0 && (
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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{trigger.caseSensitive ? 'Exact match' : 'Contains'}</span>
        </div>

        {/* Tag Assignment */}
        {data.tagSlug && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              {data.tagName || data.tagSlug}
            </Badge>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-green-500 !bg-white"
      />
    </div>
  );
}

export default memo(StartNode);
