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
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  ExternalLink,
  BarChart3,
  Globe,
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
  onValidate: () => void;
  onSimulate: () => void;
  onAnalytics: () => void;
  errorCount: number;
  warningCount: number;
  isSimulating: boolean;
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
    color: 'bg-green-500/80 hover:bg-green-500/90',
  },
  {
    type: 'question',
    label: 'Interactive',
    description: 'Interactive message',
    icon: MessageSquare,
    color: 'bg-blue-500/80 hover:bg-blue-500/90',
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Send a text message',
    icon: Send,
    color: 'bg-indigo-500/80 hover:bg-indigo-500/90',
  },
  {
    type: 'cta_button',
    label: 'CTA',
    description: 'Button with URL link',
    icon: ExternalLink,
    color: 'bg-orange-500/80 hover:bg-orange-500/90',
  },
  {
    type: 'user_input_flow',
    label: 'Input Flow',
    description: 'Collect user input',
    icon: HelpCircle,
    color: 'bg-teal-500/80 hover:bg-teal-500/90',
  },
  {
    type: 'media',
    mediaType: 'image',
    label: 'Image',
    description: 'Send image',
    icon: Image,
    color: 'bg-pink-500/80 hover:bg-pink-500/90',
  },
  {
    type: 'media',
    mediaType: 'video',
    label: 'Video',
    description: 'Send video',
    icon: Video,
    color: 'bg-rose-500/80 hover:bg-rose-500/90',
  },
  {
    type: 'media',
    mediaType: 'document',
    label: 'File',
    description: 'Send document',
    icon: FileText,
    color: 'bg-amber-500/80 hover:bg-amber-500/90',
  },
  {
    type: 'media',
    mediaType: 'audio',
    label: 'Audio',
    description: 'Send audio',
    icon: Music,
    color: 'bg-cyan-500/80 hover:bg-cyan-500/90',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch on rules',
    icon: GitBranch,
    color: 'bg-yellow-500/80 hover:bg-yellow-500/90',
  },
  {
    type: 'http_api',
    label: 'API',
    description: 'Call external APIs',
    icon: Globe,
    color: 'bg-violet-500/80 hover:bg-violet-500/90',
  },
  {
    type: 'action',
    actionType: 'fallback_ai',
    label: 'AI',
    description: 'Hand off to AI',
    icon: Bot,
    color: 'bg-orange-500/80 hover:bg-orange-500/90',
  },
  {
    type: 'action',
    actionType: 'end',
    label: 'End',
    description: 'End conversation',
    icon: XCircle,
    color: 'bg-red-500/80 hover:bg-red-500/90',
  },
];

export default function FlowToolbar({ onAutoLayout, onValidate, onSimulate, onAnalytics, errorCount, warningCount, isSimulating }: FlowToolbarProps) {
  const hasIssues = errorCount > 0 || warningCount > 0;
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
                    className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 active:scale-95 backdrop-blur-sm text-white shadow-sm ${item.color}`}
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

        {/* Validate Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={hasIssues ? (errorCount > 0 ? 'destructive' : 'outline') : 'outline'}
              size="icon"
              onClick={onValidate}
              className={`h-12 w-12 relative ${!hasIssues ? '' : errorCount > 0 ? '' : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'}`}
            >
              {errorCount > 0 ? (
                <AlertCircle className="h-5 w-5" />
              ) : warningCount > 0 ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {hasIssues && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${errorCount > 0 ? 'bg-red-500' : 'bg-yellow-500'}`}>
                  {errorCount + warningCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} collisionPadding={10} className="z-50">
            <p className="font-medium">Validate Flow</p>
            <p className="text-xs text-muted-foreground">
              {errorCount > 0
                ? `${errorCount} error${errorCount !== 1 ? 's' : ''}`
                : warningCount > 0
                ? `${warningCount} warning${warningCount !== 1 ? 's' : ''}`
                : 'Check flow for issues'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Simulate/Preview Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isSimulating ? 'default' : 'outline'}
              size="icon"
              onClick={onSimulate}
              className="h-12 w-12"
            >
              <Play className={`h-5 w-5 ${isSimulating ? 'text-primary-foreground' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} collisionPadding={10} className="z-50">
            <p className="font-medium">Preview Flow</p>
            <p className="text-xs text-muted-foreground">
              {isSimulating ? 'Close preview' : 'Test your flow interactively'}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Analytics Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onAnalytics}
              className="h-12 w-12"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5} collisionPadding={10} className="z-50">
            <p className="font-medium">Analytics</p>
            <p className="text-xs text-muted-foreground">View flow performance & metrics</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
