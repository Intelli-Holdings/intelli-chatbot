'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActionNodeData } from '@/types/chatbot-automation';

interface ActionNodeEditorProps {
  data: ActionNodeData;
  onUpdate: (data: Partial<ActionNodeData>) => void;
}

export default function ActionNodeEditor({ data, onUpdate }: ActionNodeEditorProps) {
  const handleTypeChange = (actionType: ActionNodeData['actionType']) => {
    const labels: Record<ActionNodeData['actionType'], string> = {
      send_message: 'Send Message',
      fallback_ai: 'Hand off to AI',
      end: 'End Conversation',
    };

    onUpdate({
      actionType,
      label: labels[actionType],
      message: actionType === 'send_message' ? data.message : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Type */}
      <div className="space-y-2">
        <Label>Action Type</Label>
        <Select value={data.actionType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="send_message">Send Message</SelectItem>
            <SelectItem value="fallback_ai">Hand off to AI</SelectItem>
            <SelectItem value="end">End Conversation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Message for send_message type */}
      {data.actionType === 'send_message' && (
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={data.message || ''}
            onChange={(e) => onUpdate({ message: e.target.value })}
            placeholder="Enter the message to send..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            This message will be sent when a user reaches this action.
          </p>
        </div>
      )}

      {/* Info for fallback_ai type */}
      {data.actionType === 'fallback_ai' && (
        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            When this action is triggered, the conversation will be handed off to your AI assistant
            for intelligent, context-aware responses.
          </p>
        </div>
      )}

      {/* Info for end type */}
      {data.actionType === 'end' && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            When this action is triggered, the chatbot conversation will end. The user can start
            a new conversation by sending another message that matches a trigger.
          </p>
        </div>
      )}
    </div>
  );
}
