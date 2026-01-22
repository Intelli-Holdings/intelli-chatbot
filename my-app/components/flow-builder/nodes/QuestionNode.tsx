'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare, List, LayoutGrid, ChevronRight, Image, Video, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuestionNodeData } from '@/types/chatbot-automation';
import { cn } from '@/lib/utils';

interface QuestionNodeProps extends NodeProps<QuestionNodeData> {}

function QuestionNode({ data, selected }: QuestionNodeProps) {
  const { menu } = data;

  const getTypeIcon = () => {
    switch (menu.messageType) {
      case 'interactive_buttons':
        return <LayoutGrid className="h-3.5 w-3.5" />;
      case 'interactive_list':
        return <List className="h-3.5 w-3.5" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  const getTypeBadge = () => {
    switch (menu.messageType) {
      case 'interactive_buttons':
        return 'Buttons';
      case 'interactive_list':
        return 'List';
      default:
        return 'Text';
    }
  };

  const getHeaderIcon = () => {
    if (!menu.header) return null;
    switch (menu.header.type) {
      case 'image':
        return <Image className="h-3 w-3" />;
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'document':
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Truncate body text
  const truncatedBody = menu.body.length > 80
    ? `${menu.body.substring(0, 80)}...`
    : menu.body;

  return (
    <div
      className={cn(
        'min-w-[280px] max-w-[320px] rounded-lg border bg-card shadow-sm transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-lg bg-blue-500 px-3 py-2 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{menu.name}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {menu.header && menu.header.type !== 'text' && (
            <Badge variant="secondary" className="bg-blue-400/30 text-white text-xs">
              {getHeaderIcon()}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-blue-400/30 text-white text-xs">
            {getTypeBadge()}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Body Preview */}
        <p className="text-sm text-muted-foreground leading-snug">
          {truncatedBody}
        </p>

        {/* Options */}
        {menu.options.length > 0 && (
          <div className="space-y-1.5">
            {menu.options.map((option, index) => (
              <div
                key={option.id}
                className="relative flex items-center gap-2 rounded bg-muted/50 px-2 py-1.5 text-xs"
              >
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="flex-1 truncate">{option.title}</span>

                {/* Option-specific output handle */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`option-${option.id}`}
                  className="!h-2.5 !w-2.5 !border-2 !border-blue-500 !bg-white !right-[-14px]"
                  style={{ top: `${80 + (index * 32) + 16}px` }}
                />
              </div>
            ))}
          </div>
        )}

        {menu.options.length === 0 && menu.messageType !== 'text' && (
          <div className="text-xs text-muted-foreground italic text-center py-2">
            No options added
          </div>
        )}
      </div>

      {/* Default output handle for text-only or fallback */}
      {menu.messageType === 'text' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !border-2 !border-blue-500 !bg-white"
        />
      )}
    </div>
  );
}

export default memo(QuestionNode);
