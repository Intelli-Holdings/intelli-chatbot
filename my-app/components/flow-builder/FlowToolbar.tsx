'use client';

import { DragEvent } from 'react';
import {
  Zap,
  MessageSquare,
  Send,
  GitBranch,
  Bot,
  XCircle,
  LayoutDashboard,
  Image,
  Video,
  FileText,
  Music,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface FlowToolbarProps {
  onAutoLayout: () => void;
}

interface DraggableNodeItem {
  type: string;
  actionType?: 'send_message' | 'fallback_ai' | 'end';
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const nodeItems: DraggableNodeItem[] = [
  {
    type: 'start',
    label: 'Trigger',
    description: 'Entry point with keywords',
    icon: Zap,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    type: 'question',
    label: 'Interactive',
    description: 'Interactive message',
    icon: MessageSquare,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Send a text message',
    icon: Send,
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
  {
    type: 'user_input_flow',
    label: 'Input Flow',
    description: 'Collect user input',
    icon: HelpCircle,
    color: 'bg-teal-500 hover:bg-teal-600',
  },
  {
    type: 'media',
    mediaType: 'image',
    label: 'Image',
    description: 'Send image',
    icon: Image,
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    type: 'media',
    mediaType: 'video',
    label: 'Video',
    description: 'Send video',
    icon: Video,
    color: 'bg-rose-500 hover:bg-rose-600',
  },
  {
    type: 'media',
    mediaType: 'document',
    label: 'File',
    description: 'Send document',
    icon: FileText,
    color: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    type: 'media',
    mediaType: 'audio',
    label: 'Audio',
    description: 'Send audio',
    icon: Music,
    color: 'bg-cyan-500 hover:bg-cyan-600',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch on rules',
    icon: GitBranch,
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  {
    type: 'action',
    actionType: 'fallback_ai',
    label: 'AI',
    description: 'Hand off to AI',
    icon: Bot,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    type: 'action',
    actionType: 'end',
    label: 'End',
    description: 'End conversation',
    icon: XCircle,
    color: 'bg-red-500 hover:bg-red-600',
  },
];

export default function FlowToolbar({ onAutoLayout }: FlowToolbarProps) {
  const onDragStart = (event: DragEvent<HTMLDivElement>, item: DraggableNodeItem) => {
    const data = JSON.stringify({
      type: item.type,
      actionType: item.actionType,
      mediaType: item.mediaType,
    });
    event.dataTransfer.setData('application/reactflow', data);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-2 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
      <TooltipProvider delayDuration={200}>
        {/* Draggable Nodes */}
        {nodeItems.map((item, index) => {
          const Icon = item.icon;
          // Separators: before media nodes (index 4) and before condition (index 8)
          const showSeparator = index === 4 || index === 8;
          const uniqueKey = `${item.type}-${item.actionType || item.mediaType || item.label}`;

          return (
            <div key={uniqueKey} className="flex items-center">
              {showSeparator && <Separator orientation="vertical" className="h-8 mx-1" />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    draggable
                    onDragStart={(e) => onDragStart(e, item)}
                    className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 active:scale-95 ${item.color} text-white shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] mt-0.5 font-medium truncate max-w-[40px]">{item.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={5} collisionPadding={10} className="max-w-[200px] z-50">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">Drag to canvas</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* Auto Layout Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onAutoLayout}
              className="h-12 w-12"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} collisionPadding={10} className="z-50">
            <p className="font-medium">Auto Layout</p>
            <p className="text-xs text-muted-foreground">Arrange nodes automatically</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
