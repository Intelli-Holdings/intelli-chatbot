'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image, Video, FileText, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MediaType = 'image' | 'video' | 'document' | 'audio';

export interface MediaNodeData {
  type: 'media';
  label: string;
  mediaType: MediaType;
  mediaId?: string; // WhatsApp media ID after upload
  fileName?: string;
  caption?: string;
}

interface MediaNodeProps extends NodeProps<MediaNodeData> {}

const MEDIA_CONFIG: Record<MediaType, { icon: typeof Image; title: string; color: string; borderColor: string }> = {
  image: {
    icon: Image,
    title: 'Image',
    color: 'bg-pink-500',
    borderColor: '#ec4899',
  },
  video: {
    icon: Video,
    title: 'Video',
    color: 'bg-rose-500',
    borderColor: '#f43f5e',
  },
  document: {
    icon: FileText,
    title: 'Document',
    color: 'bg-amber-500',
    borderColor: '#f59e0b',
  },
  audio: {
    icon: Music,
    title: 'Audio',
    color: 'bg-cyan-500',
    borderColor: '#06b6d4',
  },
};

function MediaNode({ data, selected }: MediaNodeProps) {
  const { mediaType, fileName, caption } = data;
  const config = MEDIA_CONFIG[mediaType];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'min-w-[180px] max-w-[220px] rounded-lg border bg-card shadow-sm transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: config.borderColor }}
      />

      {/* Header */}
      <div className={cn(
        'flex items-center justify-center gap-2 rounded-t-lg px-3 py-2 text-white',
        config.color
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.title}</span>
      </div>

      {/* Content */}
      <div className="p-3 min-w-0">
        {fileName ? (
          <p className="text-xs text-muted-foreground truncate max-w-full" title={fileName}>
            {fileName}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No file uploaded
          </p>
        )}
        {caption && (
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-full" title={caption}>
            {caption}
          </p>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: config.borderColor }}
      />
    </div>
  );
}

export default memo(MediaNode);
