'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Timer, MessageSquare, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

export interface SequenceStep {
  id: string;
  delay: string;
  delaySeconds: number;
  messageType: 'text' | 'template';
  textMessage?: string;
  templateName?: string;
  templateId?: string;
  templateLanguage?: string;
  templateComponents?: Record<string, unknown>[];
}

export interface SequenceNodeData {
  type: 'sequence';
  label: string;
  steps: SequenceStep[];
}

interface SequenceNodeProps extends NodeProps<SequenceNodeData> {}

function formatDelay(delay: string): string {
  const match = delay.match(/^(\d+)(m|h)$/);
  if (!match) return delay;
  const [, num, unit] = match;
  if (unit === 'm') return `${num}m`;
  return `${num}h`;
}

function SequenceNode({ id, data, selected }: SequenceNodeProps) {
  const { steps } = data;
  const validationClass = useNodeValidationClass(id);
  const stepCount = steps?.length || 0;

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
        style={{ borderColor: '#10b981' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4" />
          <span className="text-sm font-medium">Sequence</span>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white text-xs">
          {stepCount} step{stepCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[48px]">
        {stepCount > 0 ? (
          <div className="space-y-1.5">
            {steps.slice(0, 3).map((step, i) => (
              <div key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                  {formatDelay(step.delay)}
                </span>
                {step.messageType === 'text' ? (
                  <MessageSquare className="h-3 w-3 shrink-0" />
                ) : (
                  <FileText className="h-3 w-3 shrink-0" />
                )}
                <span className="truncate">
                  {step.messageType === 'text'
                    ? (step.textMessage ? step.textMessage.substring(0, 30) + (step.textMessage.length > 30 ? '...' : '') : 'No message')
                    : (step.templateName || 'No template')}
                </span>
              </div>
            ))}
            {stepCount > 3 && (
              <p className="text-[10px] text-muted-foreground/60 italic">
                +{stepCount - 3} more step{stepCount - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            No steps configured
          </p>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: '#10b981' }}
      />
    </div>
  );
}

export default memo(SequenceNode);
