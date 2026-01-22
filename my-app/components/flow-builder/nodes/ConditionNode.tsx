'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

function ConditionNode({ data, selected }: ConditionNodeProps) {
  const { matchType, rules } = data;

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
        'min-w-[240px] max-w-[300px] rounded-lg border bg-card shadow-sm transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-yellow-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 rounded-t-lg bg-yellow-500 px-3 py-2 text-white">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="text-sm font-medium">Condition</span>
        </div>
        <Badge variant="secondary" className="bg-yellow-400/30 text-white text-xs">
          {matchType === 'all' ? 'All Match' : 'Any Match'}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
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
          <p className="text-sm text-muted-foreground italic">No conditions set</p>
        )}

        {/* Branch Labels */}
        <div className="flex justify-between pt-2 border-t mt-2">
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

      {/* True Handle (Left) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!h-3 !w-3 !border-2 !border-green-500 !bg-white !left-[25%]"
      />

      {/* False Handle (Right) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!h-3 !w-3 !border-2 !border-red-500 !bg-white !left-[75%]"
      />
    </div>
  );
}

export default memo(ConditionNode);
