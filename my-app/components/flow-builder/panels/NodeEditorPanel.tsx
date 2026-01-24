'use client';

import { X, Trash2, Zap, MessageSquare, Send, Type, GitBranch, Bot, XCircle, Image, Video, FileText, Music, FileInput, HelpCircle } from 'lucide-react';
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
import { MediaNodeData } from '../nodes/MediaNode';
import { UserInputFlowNodeData } from '../nodes/UserInputFlowNode';
import { QuestionInputNodeData } from '../nodes/QuestionInputNode';
import { ExtendedFlowNode, ExtendedFlowNodeData } from '../utils/node-factories';
import StartNodeEditor from './StartNodeEditor';
import QuestionNodeEditor from './QuestionNodeEditor';
import ActionNodeEditor from './ActionNodeEditor';
import TextNodeEditor from './TextNodeEditor';
import ConditionNodeEditor from './ConditionNodeEditor';
import MediaNodeEditor from './MediaNodeEditor';
import UserInputFlowNodeEditor from './UserInputFlowNodeEditor';
import QuestionInputNodeEditor from './QuestionInputNodeEditor';
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
      case 'user_input_flow':
        return {
          title: 'Configure User Input Flow',
          icon: FileInput,
          color: 'bg-teal-500',
        };
      case 'question_input':
        return {
          title: 'Configure Question',
          icon: HelpCircle,
          color: 'bg-cyan-500',
        };
      case 'action': {
        const actionData = selectedNode.data as ActionNodeData;
        if (actionData.actionType === 'fallback_ai') {
          return {
            title: 'Configure AI Assistant',
            icon: Bot,
            color: 'bg-orange-500',
          };
        }
        if (actionData.actionType === 'end') {
          return {
            title: 'Configure End',
            icon: XCircle,
            color: 'bg-red-500',
          };
        }
        return {
          title: 'Configure Text',
          icon: Send,
          color: 'bg-purple-500',
        };
      }
      case 'media': {
        const mediaData = selectedNode.data as MediaNodeData;
        const mediaConfig = {
          image: { title: 'Configure Image', icon: Image, color: 'bg-pink-500' },
          video: { title: 'Configure Video', icon: Video, color: 'bg-rose-500' },
          document: { title: 'Configure Document', icon: FileText, color: 'bg-amber-500' },
          audio: { title: 'Configure Audio', icon: Music, color: 'bg-cyan-500' },
        };
        return mediaConfig[mediaData.mediaType] || mediaConfig.image;
      }
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

        {selectedNode.data.type === 'user_input_flow' && (
          <UserInputFlowNodeEditor
            data={selectedNode.data as UserInputFlowNodeData}
            onUpdate={handleUpdate}
          />
        )}

        {selectedNode.data.type === 'question_input' && (
          <QuestionInputNodeEditor
            data={selectedNode.data as QuestionInputNodeData}
            onUpdate={handleUpdate}
          />
        )}

        {selectedNode.data.type === 'action' && (
          <ActionNodeEditor
            data={selectedNode.data as ActionNodeData}
            onUpdate={handleUpdate}
          />
        )}

        {selectedNode.data.type === 'media' && (
          <MediaNodeEditor
            data={selectedNode.data as MediaNodeData}
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
