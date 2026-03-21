'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image, Video, FileText, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

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
    color: 'bg-gradient-to-r from-pink-500 to-pink-400',
    borderColor: '#ec4899',
  },
  video: {
    icon: Video,
    title: 'Video',
    color: 'bg-gradient-to-r from-rose-500 to-rose-400',
    borderColor: '#f43f5e',
  },
  document: {
    icon: FileText,
    title: 'Document',
    color: 'bg-gradient-to-r from-amber-500 to-amber-400',
    borderColor: '#f59e0b',
  },
  audio: {
    icon: Music,
    title: 'Audio',
    color: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
    borderColor: '#06b6d4',
  },
};

function MediaNode({ id, data, selected }: MediaNodeProps) {
  const { mediaType, fileName, caption } = data;
  const config = MEDIA_CONFIG[mediaType];
  const Icon = config.icon;
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
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: config.borderColor }}
      />

      {/* Header */}
      <div className={cn(
        'flex items-center justify-center gap-2 rounded-t-xl px-3 py-2 text-white',
        config.color
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.title}</span>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[48px] min-w-0">
        {fileName ? (
          <p className="text-sm text-muted-foreground truncate max-w-full" title={fileName}>
            {fileName}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
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
