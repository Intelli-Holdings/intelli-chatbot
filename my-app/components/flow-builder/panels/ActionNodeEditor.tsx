'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActionNodeData } from '@/types/chatbot-automation';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { toast } from 'sonner';

import { logger } from "@/lib/logger";
interface Assistant {
  id: number;
  name: string;
  assistant_id: string;
  organization: string;
}

interface ActionNodeEditorProps {
  data: ActionNodeData;
  onUpdate: (data: Partial<ActionNodeData>) => void;
}

export default function ActionNodeEditor({ data, onUpdate }: ActionNodeEditorProps) {
  const organizationId = useActiveOrganizationId();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [selectedAssistantId, setSelectedAssistantId] = useState(data.assistantId || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [hasAssistantChanges, setHasAssistantChanges] = useState(false);

  // Fetch assistants only for fallback_ai action type
  useEffect(() => {
    if (data.actionType !== 'fallback_ai') {
      setAssistants([]);
      return;
    }

    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();
    let isMounted = true;

    const fetchAssistants = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/assistants/${organizationId}`, {
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch assistants');
        }
        const result = await response.json();
        // Only update state if component is still mounted and action type hasn't changed
        if (isMounted) {
          setAssistants(Array.isArray(result) ? result : result.results || []);
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        logger.error('Error fetching assistants:', { error: error instanceof Error ? error.message : String(error) });
        if (isMounted) {
          setAssistants([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAssistants();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [organizationId, data.actionType]);

  // Reset local state when switching nodes
  useEffect(() => {
    setMessage(data.message || '');
    setHasChanges(false);
  }, [data.message]);

  useEffect(() => {
    setSelectedAssistantId(data.assistantId || '');
    setHasAssistantChanges(false);
  }, [data.assistantId]);

  const handleMessageChange = (value: string) => {
    setMessage(value);
    setHasChanges(true);
  };

  const handleSaveMessage = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    onUpdate({ message });
    setHasChanges(false);
    toast.success('Message saved');
  };

  // Render content based on action type
  if (data.actionType === 'send_message') {
    return (
      <div className="space-y-4">
        {/* Message Input */}
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Enter the message to send..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            This message will be sent when this node is reached in the flow.
          </p>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button onClick={handleSaveMessage} size="sm" className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Save Message
          </Button>
        )}

        {/* Info */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Use this node to send a text message to the user at this point in the conversation flow.
          </p>
        </div>
      </div>
    );
  }

  if (data.actionType === 'fallback_ai') {
    const handleSaveAssistant = () => {
      if (!selectedAssistantId) {
        toast.error('Please select an assistant');
        return;
      }
      onUpdate({ assistantId: selectedAssistantId });
      setHasAssistantChanges(false);
      toast.success('Assistant saved');
    };

    return (
      <div className="space-y-4">
        {/* Assistant Selection */}
        <div className="space-y-2">
          <Label>Select Assistant</Label>
          <Select
            value={selectedAssistantId}
            onValueChange={(value) => {
              setSelectedAssistantId(value);
              setHasAssistantChanges(value !== (data.assistantId || ''));
            }}
          >
            <SelectTrigger>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading assistants...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select an assistant" />
              )}
            </SelectTrigger>
            <SelectContent>
              {assistants.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No assistants found
                </div>
              ) : (
                assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.assistant_id}>
                    {assistant.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        {hasAssistantChanges && (
          <Button onClick={handleSaveAssistant} size="sm" className="w-full">
            <Check className="h-4 w-4 mr-2" />
            Save Assistant
          </Button>
        )}

        {/* Info */}
        <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            When this action is triggered, the conversation will be handed off to the selected AI assistant
            for intelligent, context-aware responses.
          </p>
        </div>

        {/* Tips */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
          <p className="font-medium">Tips:</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Create assistants in Assistants</li>
            <li>Each assistant can have different prompts and behaviors</li>
            <li>The AI will continue the conversation from this point</li>
          </ul>
        </div>
      </div>
    );
  }

  if (data.actionType === 'end') {
    return (
      <div className="space-y-4">
        {/* Info */}
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            This node ends the conversation flow. When reached, the chatbot will stop responding
            to the user in this flow context.
          </p>
        </div>

        {/* Tips */}
        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
          <p className="font-medium">Usage:</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Use this to gracefully end a conversation</li>
            <li>Connect after final messages or confirmations</li>
            <li>The user can start a new conversation with trigger keywords</li>
          </ul>
        </div>
      </div>
    );
  }

  return null;
}
