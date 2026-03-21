'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ExternalLink } from 'lucide-react';

export interface CTAButtonNodeData {
  type: 'cta_button';
  label: string;
  body: string;
  buttonText: string;
  url: string;
  header?: string;
  footer?: string;
}

function CTAButtonNode({ data, selected }: NodeProps<CTAButtonNodeData>) {
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      className={`
        rounded-xl shadow-md w-[280px] border border-white/20 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
        ${selected ? 'ring-2 ring-[#007fff] ring-offset-2 shadow-[0_0_20px_rgba(0,127,255,0.3)]' : ''}
        transition-all duration-200
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-400 rounded-t-xl">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">CTA Button</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[48px] space-y-2">
        {data.header && (
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {truncateText(data.header, 40)}
          </p>
        )}

        <p className={`text-sm ${data.body ? 'text-gray-600 dark:text-gray-400' : 'text-xs text-muted-foreground/60 italic'}`}>
          {truncateText(data.body, 80) || 'No message configured'}
        </p>

        {/* CTA Button Preview */}
        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs font-medium">
              {data.buttonText || 'Button Text'}
            </span>
          </div>
          {data.url && (
            <p className="text-[10px] text-center text-gray-500 mt-1 truncate">
              {truncateText(data.url, 30)}
            </p>
          )}
        </div>

        {data.footer && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {truncateText(data.footer, 50)}
          </p>
        )}
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </div>
  );
}

export default memo(CTAButtonNode);
