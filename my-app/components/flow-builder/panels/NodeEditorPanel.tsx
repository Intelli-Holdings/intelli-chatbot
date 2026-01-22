'use client';

import { X, Trash2, Zap, MessageSquare, Send, Type, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChatbotMenu,
  StartNodeData,
  QuestionNodeData,
  ActionNodeData,
} from '@/types/chatbot-automation';
import { TextNodeData } from '../nodes/TextNode';
import { ConditionNodeData } from '../nodes/ConditionNode';
import { ExtendedFlowNode, ExtendedFlowNodeData } from '../utils/node-factories';
import StartNodeEditor from './StartNodeEditor';
import QuestionNodeEditor from './QuestionNodeEditor';
import ActionNodeEditor from './ActionNodeEditor';
import TextNodeEditor from './TextNodeEditor';
import ConditionNodeEditor from './ConditionNodeEditor';
import { cn } from '@/lib/utils';

interface NodeEditorPanelProps {
  selectedNode: ExtendedFlowNode | null;
  onUpdate: (nodeId: string, data: Partial<ExtendedFlowNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
  menus: ChatbotMenu[];
}

export default function NodeEditorPanel({
  selectedNode,
  onUpdate,
  onDelete,
  onClose,
  menus,
}: NodeEditorPanelProps) {
  if (!selectedNode) return null;

  const handleUpdate = (data: Partial<ExtendedFlowNodeData>) => {
    onUpdate(selectedNode.id, data);
  };

  const handleDelete = () => {
    onDelete(selectedNode.id);
  };

  const getNodeConfig = () => {
    switch (selectedNode.data.type) {
      case 'start':
        return {
          title: 'Configure Trigger',
          icon: Zap,
          color: 'bg-green-500',
        };
      case 'question':
        return {
          title: 'Configure Interactive Message',
          icon: MessageSquare,
          color: 'bg-blue-500',
        };
      case 'text':
        return {
          title: 'Configure Text Message',
          icon: Type,
          color: 'bg-indigo-500',
        };
      case 'condition':
        return {
          title: 'Configure Condition',
          icon: GitBranch,
          color: 'bg-yellow-500',
        };
      case 'action':
        return {
          title: 'Configure Action',
          icon: Send,
          color: 'bg-purple-500',
        };
      default:
        return {
          title: 'Configure Node',
          icon: MessageSquare,
          color: 'bg-gray-500',
        };
    }
  };

  const config = getNodeConfig();
  const Icon = config.icon;

  return (
    <div className="absolute top-0 right-0 h-full w-[380px] bg-background border-l shadow-lg z-20 flex flex-col animate-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 text-white', config.color)}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span className="font-medium">{config.title}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {selectedNode.data.type === 'start' && (
          <StartNodeEditor
            data={selectedNode.data as StartNodeData}
            onUpdate={handleUpdate}
          />
        )}

        {selectedNode.data.type === 'question' && (
          <QuestionNodeEditor
            data={selectedNode.data as QuestionNodeData}
            onUpdate={handleUpdate}
            menus={menus}
          />
        )}

        {selectedNode.data.type === 'text' && (
          <TextNodeEditor
            data={selectedNode.data as TextNodeData}
            onUpdate={handleUpdate}
          />
        )}

        {selectedNode.data.type === 'condition' && (
          <ConditionNodeEditor
            data={selectedNode.data as ConditionNodeData}
            onUpdate={handleUpdate}
          />
        )}

        {selectedNode.data.type === 'action' && (
          <ActionNodeEditor
            data={selectedNode.data as ActionNodeData}
            onUpdate={handleUpdate}
          />
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Node
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Node</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this node? This will also remove any connections
                to and from this node.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
