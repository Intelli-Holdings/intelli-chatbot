'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare, ChevronRight, Image, Video, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuestionNodeData } from '@/types/chatbot-automation';
import { cn } from '@/lib/utils';

interface QuestionNodeProps extends NodeProps<QuestionNodeData> {}

// Layout constants (in pixels)
const HEADER_HEIGHT = 40;
const CONTENT_PADDING = 12;
const BODY_HEIGHT = 44; // Approximate for truncated text
const OPTIONS_GAP = 6;
const OPTION_HEIGHT = 28;

function QuestionNode({ data, selected }: QuestionNodeProps) {
  const { menu } = data;

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

  // Calculate handle position for each option
  const getHandleTop = (index: number) => {
    const baseTop = HEADER_HEIGHT + CONTENT_PADDING + BODY_HEIGHT + OPTIONS_GAP;
    return baseTop + (index * (OPTION_HEIGHT + OPTIONS_GAP)) + (OPTION_HEIGHT / 2);
  };

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
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-blue-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-lg bg-blue-500 px-3 py-2 text-white">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">Interactive Message</span>
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
            {menu.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1.5 text-xs"
              >
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span className="flex-1 truncate">{option.title}</span>
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

      {/* Option handles - at node level, positioned to align with each button */}
      {menu.options.map((option, index) => (
        <Handle
          key={`handle-${option.id}`}
          type="source"
          position={Position.Right}
          id={`option-${option.id}`}
          className="!w-3 !h-3 !border-2 !border-blue-500 !bg-white"
          style={{ top: getHandleTop(index) }}
        />
      ))}

      {/* Default output handle - shown when no options exist or when message type is text */}
      {(menu.messageType === 'text' || menu.options.length === 0) && (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-blue-500 !bg-white"
        />
      )}
    </div>
  );
}

export default memo(QuestionNode);
