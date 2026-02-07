'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'exists' | 'not_exists';
  value?: string;
}

export interface ConditionNodeData {
  type: 'condition';
  label: string;
  matchType: 'all' | 'any'; // All conditions must match OR any condition matches
  rules: ConditionRule[];
}

interface ConditionNodeProps extends NodeProps<ConditionNodeData> {}

function ConditionNode({ id, data, selected }: ConditionNodeProps) {
  const { matchType, rules } = data;
  const validationClass = useNodeValidationClass(id);

  const getOperatorLabel = (op: ConditionRule['operator']) => {
    switch (op) {
      case 'equals': return '=';
      case 'not_equals': return '≠';
      case 'contains': return 'contains';
      case 'not_contains': return '!contains';
      case 'exists': return 'exists';
      case 'not_exists': return 'not exists';
      default: return op;
    }
  };

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
        className="!h-3 !w-3 !border-2 !border-amber-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-xl bg-gradient-to-r from-yellow-500 to-amber-400 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="text-sm font-medium">Condition</span>
        </div>
        <Badge variant="secondary" className="bg-yellow-400/30 text-white text-xs">
          {matchType === 'all' ? 'All Match' : 'Any Match'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[48px] space-y-2">
        {rules.length > 0 ? (
          <div className="space-y-1">
            {rules.slice(0, 3).map((rule, index) => (
              <div key={index} className="text-xs bg-muted/50 rounded px-2 py-1 flex items-center gap-1">
                <span className="font-medium text-foreground">{rule.field}</span>
                <span className="text-muted-foreground">{getOperatorLabel(rule.operator)}</span>
                {rule.value && <span className="text-foreground">"{rule.value}"</span>}
              </div>
            ))}
            {rules.length > 3 && (
              <p className="text-xs text-muted-foreground">+{rules.length - 3} more rules</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">No conditions set</p>
        )}

        {/* Branch Labels */}
        <div className="flex flex-col gap-1 pt-2 border-t mt-2">
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3 w-3" />
            <span>True</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-red-500">
            <X className="h-3 w-3" />
            <span>False</span>
          </div>
        </div>
      </div>

      {/* True Handle (Top) */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!h-3 !w-3 !border-2 !border-green-500 !bg-white !top-[35%]"
      />

      {/* False Handle (Bottom) */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!h-3 !w-3 !border-2 !border-red-500 !bg-white !top-[65%]"
      />
    </div>
  );
}

export default memo(ConditionNode);
