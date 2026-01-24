'use client';

import { useEffect, useRef } from 'react';
import {
  Zap,
  MessageSquare,
  Send,
  GitBranch,
  Bot,
  XCircle,
  Image,
  Video,
  FileText,
  Music,
  FileInput,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConnectionMenuPosition {
  x: number;
  y: number;
  flowPosition: { x: number; y: number };
  sourceNodeId: string;
  sourceHandleId: string | null;
}

interface NodeMenuItem {
  type: string;
  actionType?: 'send_message' | 'fallback_ai' | 'end';
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'flow' | 'message' | 'media' | 'logic' | 'action';
}

const menuItems: NodeMenuItem[] = [
  // Flow
  {
    type: 'start',
    label: 'Trigger',
    description: 'Entry point with keywords',
    icon: Zap,
    color: 'bg-green-500',
    category: 'flow',
  },
  {
    type: 'user_input_flow',
    label: 'User Input Flow',
    description: 'Collect user information',
    icon: FileInput,
    color: 'bg-teal-500',
    category: 'flow',
  },
  {
    type: 'question_input',
    label: 'Question',
    description: 'Ask a single question',
    icon: HelpCircle,
    color: 'bg-cyan-500',
    category: 'flow',
  },
  // Messages
  {
    type: 'question',
    label: 'Interactive Message',
    description: 'Message with buttons/list',
    icon: MessageSquare,
    color: 'bg-blue-500',
    category: 'message',
  },
  {
    type: 'text',
    label: 'Text Message',
    description: 'Simple text message',
    icon: Send,
    color: 'bg-indigo-500',
    category: 'message',
  },
  // Media
  {
    type: 'media',
    mediaType: 'image',
    label: 'Image',
    description: 'Send an image',
    icon: Image,
    color: 'bg-pink-500',
    category: 'media',
  },
  {
    type: 'media',
    mediaType: 'video',
    label: 'Video',
    description: 'Send a video',
    icon: Video,
    color: 'bg-rose-500',
    category: 'media',
  },
  {
    type: 'media',
    mediaType: 'document',
    label: 'Document',
    description: 'Send a document',
    icon: FileText,
    color: 'bg-amber-500',
    category: 'media',
  },
  {
    type: 'media',
    mediaType: 'audio',
    label: 'Audio',
    description: 'Send audio',
    icon: Music,
    color: 'bg-cyan-600',
    category: 'media',
  },
  // Logic
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on rules',
    icon: GitBranch,
    color: 'bg-yellow-500',
    category: 'logic',
  },
  // Actions
  {
    type: 'action',
    actionType: 'fallback_ai',
    label: 'AI Assistant',
    description: 'Hand off to AI',
    icon: Bot,
    color: 'bg-orange-500',
    category: 'action',
  },
  {
    type: 'action',
    actionType: 'end',
    label: 'End',
    description: 'End conversation',
    icon: XCircle,
    color: 'bg-red-500',
    category: 'action',
  },
];

const categories = [
  { key: 'flow', label: 'Flow' },
  { key: 'message', label: 'Messages' },
  { key: 'media', label: 'Media' },
  { key: 'logic', label: 'Logic' },
  { key: 'action', label: 'Actions' },
];

interface ConnectionMenuProps {
  position: ConnectionMenuPosition | null;
  onSelect: (item: NodeMenuItem, position: ConnectionMenuPosition) => void;
  onClose: () => void;
}

export default function ConnectionMenu({ position, onSelect, onClose }: ConnectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (position) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [position, onClose]);

  if (!position) return null;

  // Adjust position to keep menu in viewport
  const menuWidth = 280;
  const menuHeight = 400;
  const padding = 16;

  let left = position.x;
  let top = position.y;

  if (typeof window !== 'undefined') {
    if (left + menuWidth + padding > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (top + menuHeight + padding > window.innerHeight) {
      top = window.innerHeight - menuHeight - padding;
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-[280px] max-h-[400px] overflow-y-auto bg-background border rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 duration-150"
      style={{ left, top }}
    >
      <div className="sticky top-0 bg-background border-b px-3 py-2">
        <p className="text-sm font-medium">Add Node</p>
        <p className="text-xs text-muted-foreground">Select a node to connect</p>
      </div>

      <div className="p-2">
        {categories.map((category) => {
          const items = menuItems.filter((item) => item.category === category.key);
          if (items.length === 0) return null;

          return (
            <div key={category.key} className="mb-2">
              <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                {category.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const itemKey = `${item.type}-${item.actionType || item.mediaType || ''}`;

                  return (
                    <button
                      key={itemKey}
                      onClick={() => onSelect(item, position)}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted transition-colors text-left"
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-md text-white',
                          item.color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
