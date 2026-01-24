'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { HelpCircle, MessageCircle, List, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface QuestionInputNodeData {
  type: 'question_input';
  label: string;
  question: string;
  variableName: string;
  inputType: 'free_text' | 'multiple_choice';
  options?: string[];
  required?: boolean;
}

interface QuestionInputNodeProps extends NodeProps<QuestionInputNodeData> {}

function QuestionInputNode({ data, selected }: QuestionInputNodeProps) {
  const { question, inputType, options, variableName } = data;

  const truncatedQuestion = question && question.length > 60
    ? `${question.substring(0, 60)}...`
    : question;

  return (
    <div
      className={cn(
        'min-w-[240px] max-w-[300px] rounded-lg border bg-card shadow-sm transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-cyan-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-lg bg-cyan-500 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Question</span>
        </div>
        <Badge variant="secondary" className="bg-cyan-400/30 text-white text-xs">
          {inputType === 'free_text' ? (
            <><MessageCircle className="h-3 w-3 mr-1" /> Text</>
          ) : (
            <><List className="h-3 w-3 mr-1" /> Choice</>
          )}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Question Text */}
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            {truncatedQuestion || <span className="italic text-muted-foreground">No question set</span>}
          </p>
        </div>

        {/* Options for multiple choice */}
        {inputType === 'multiple_choice' && options && options.length > 0 && (
          <div className="space-y-1 pl-6">
            {options.slice(0, 3).map((option, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <div className="w-3 h-3 rounded border border-muted-foreground/30" />
                <span className="truncate">{option || `Option ${index + 1}`}</span>
              </div>
            ))}
            {options.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{options.length - 3} more options
              </p>
            )}
          </div>
        )}

        {/* Variable name */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Saves to: <code className="bg-muted px-1 rounded">{`{{${variableName}}}`}</code>
          </p>
        </div>
      </div>

      {/* Output Handle - Next Question */}
      <Handle
        type="source"
        position={Position.Right}
        id="next"
        className="!h-3 !w-3 !border-2 !border-cyan-500 !bg-white"
      />
    </div>
  );
}

export default memo(QuestionInputNode);
