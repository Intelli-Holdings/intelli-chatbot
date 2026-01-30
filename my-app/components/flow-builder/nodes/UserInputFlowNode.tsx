'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { FileInput } from 'lucide-react';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

export interface UserInputFlowNodeData {
  type: 'user_input_flow';
  label: string;
  flowName: string;
  description?: string;
}

interface UserInputFlowNodeProps extends NodeProps<UserInputFlowNodeData> {}

function UserInputFlowNode({ id, data, selected }: UserInputFlowNodeProps) {
  const { flowName, description } = data;
  const validationClass = useNodeValidationClass(id);

  return (
    <div
      className={cn(
        'min-w-[220px] max-w-[280px] rounded-lg border bg-card shadow-sm transition-all relative',
        selected && 'ring-2 ring-primary ring-offset-2',
        !selected && validationClass
      )}
    >
      <NodeValidationIndicator nodeId={id} />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-teal-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-lg bg-teal-500 px-3 py-2 text-white">
        <FileInput className="h-4 w-4" />
        <span className="text-sm font-medium">User Input Flow</span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Flow name</p>
          <p className="text-sm font-medium truncate">
            {flowName || 'Untitled Flow'}
          </p>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        )}
      </div>

      {/* Output Handle - First Question */}
      <Handle
        type="source"
        position={Position.Right}
        id="first-question"
        className="!h-3 !w-3 !border-2 !border-teal-500 !bg-white"
      />
    </div>
  );
}

export default memo(UserInputFlowNode);
