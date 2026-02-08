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
        className="!h-3 !w-3 !border-2 !border-teal-500 !bg-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-teal-500 to-teal-400 px-3 py-2 text-white">
        <FileInput className="h-4 w-4" />
        <span className="text-sm font-medium">User Input Flow</span>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[48px] space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Flow name</p>
          <p className="text-sm font-medium truncate">
            {flowName || <span className="text-xs font-normal text-muted-foreground/60 italic">Untitled Flow</span>}
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
