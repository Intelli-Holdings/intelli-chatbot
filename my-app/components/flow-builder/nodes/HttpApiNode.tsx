'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type BodyType = 'json' | 'form' | 'none';
export type AuthType = 'none' | 'basic' | 'bearer' | 'api_key';

export interface HttpHeader {
  key: string;
  value: string;
}

export interface HttpAuth {
  type: AuthType;
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

export interface HttpApiNodeData {
  type: 'http_api';
  label: string;
  method: HttpMethod;
  url: string;
  headers: HttpHeader[];
  body: string;
  bodyType: BodyType;
  responseVariable: string;
  timeout: number;
  auth?: HttpAuth;
}

interface HttpApiNodeProps extends NodeProps<HttpApiNodeData> {}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'bg-green-600',
  POST: 'bg-blue-600',
  PUT: 'bg-yellow-600',
  DELETE: 'bg-red-600',
  PATCH: 'bg-purple-600',
};

function HttpApiNode({ id, data, selected }: HttpApiNodeProps) {
  const { method, url, responseVariable } = data;
  const validationClass = useNodeValidationClass(id);

  // Truncate URL for display
  const displayUrl = url
    ? url.length > 30
      ? `${url.substring(0, 30)}...`
      : url
    : 'No URL configured';

  return (
    <div
      className={cn(
        'min-w-[200px] max-w-[280px] rounded-lg border bg-card shadow-sm transition-all relative',
        selected && 'ring-2 ring-primary ring-offset-2',
        !selected && validationClass
      )}
    >
      <NodeValidationIndicator nodeId={id} />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: '#8b5cf6' }}
      />

      {/* Header */}
      <div className="flex items-center justify-center gap-2 rounded-t-lg px-3 py-2 text-white bg-violet-500">
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">HTTP API</span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Method Badge and URL */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-bold text-white',
            METHOD_COLORS[method]
          )}>
            {method}
          </span>
          <p className="text-xs text-muted-foreground truncate flex-1" title={url}>
            {displayUrl}
          </p>
        </div>

        {/* Response Variable */}
        {responseVariable && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">→</span> {responseVariable}
          </p>
        )}
      </div>

      {/* Success Output Handle - Top Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="success"
        className="!h-3 !w-3 !border-2 !bg-green-500"
        style={{ borderColor: '#22c55e', top: '40%' }}
        title="Success"
      />

      {/* Error Output Handle - Bottom Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="error"
        className="!h-3 !w-3 !border-2 !bg-red-500"
        style={{ borderColor: '#ef4444', top: '70%' }}
        title="Error"
      />

      {/* Handle Labels */}
      <div className="absolute right-[-4px] top-[38%] translate-x-full flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      </div>
      <div className="absolute right-[-4px] top-[68%] translate-x-full flex items-center gap-1">
        <XCircle className="h-3 w-3 text-red-500" />
      </div>
    </div>
  );
}

export default memo(HttpApiNode);
