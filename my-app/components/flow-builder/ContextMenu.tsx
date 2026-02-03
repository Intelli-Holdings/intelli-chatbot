'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  Zap,
  MessageSquare,
  Type,
  GitBranch,
  Send,
  Bot,
  XCircle,
  Copy,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContextMenuPosition {
  x: number;
  y: number;
  flowPosition: { x: number; y: number };
}

interface ContextMenuItem {
  label: string;
  icon: React.ElementType;
  action: string;
  color?: string;
  separator?: boolean;
}

const addNodeItems: ContextMenuItem[] = [
  { label: 'Trigger', icon: Zap, action: 'add-start', color: 'text-green-500' },
  { label: 'Interactive Message', icon: MessageSquare, action: 'add-question', color: 'text-blue-500' },
  { label: 'Text Message', icon: Type, action: 'add-text', color: 'text-indigo-500' },
  { label: 'Condition', icon: GitBranch, action: 'add-condition', color: 'text-yellow-500' },
  { label: 'Send Message', icon: Send, action: 'add-action-message', color: 'text-purple-500', separator: true },
  { label: 'AI Handoff', icon: Bot, action: 'add-action-ai', color: 'text-orange-500' },
  { label: 'End Chat', icon: XCircle, action: 'add-action-end', color: 'text-red-500' },
];

const nodeActionItems: ContextMenuItem[] = [
  { label: 'Clone', icon: Copy, action: 'clone' },
  { label: 'Delete', icon: Trash2, action: 'delete', color: 'text-red-500' },
];

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  nodeId?: string | null;
  onAction: (action: string, position: ContextMenuPosition) => void;
  onClose: () => void;
}

export default function ContextMenu({
  position,
  nodeId,
  onAction,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!position) return null;

  const items = nodeId ? nodeActionItems : addNodeItems;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] bg-popover border rounded-lg shadow-lg py-1 animate-in fade-in-0 zoom-in-95"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {!nodeId && (
        <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b mb-1">
          Add Component
        </div>
      )}
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={item.action}>
            {item.separator && index > 0 && <div className="border-t my-1" />}
            <button
              onClick={() => {
                onAction(item.action, position);
                onClose();
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors',
                item.color
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
