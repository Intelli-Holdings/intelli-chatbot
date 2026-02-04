'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Webhook, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { UserInputFlowNodeData, WebhookConfig } from '../nodes/UserInputFlowNode';

interface UserInputFlowNodeEditorProps {
  data: UserInputFlowNodeData;
  onUpdate: (data: Partial<UserInputFlowNodeData>) => void;
}

const defaultWebhook: WebhookConfig = {
  enabled: false,
  url: '',
  method: 'POST',
  headers: {},
  includeMetadata: true,
};

export default function UserInputFlowNodeEditor({ data, onUpdate }: UserInputFlowNodeEditorProps) {
  const [localData, setLocalData] = useState({
    flowName: data.flowName || '',
    description: data.description || '',
    webhook: data.webhook || defaultWebhook,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [webhookOpen, setWebhookOpen] = useState(data.webhook?.enabled || false);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // Sync local state when data prop changes
  useEffect(() => {
    setLocalData({
      flowName: data.flowName || '',
      description: data.description || '',
      webhook: data.webhook || defaultWebhook,
    });
    setIsDirty(false);
  }, [data.flowName, data.description, data.webhook]);

  const handleChange = useCallback((updates: Partial<typeof localData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    setShowSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    onUpdate(localData);
    setIsDirty(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }, [localData, onUpdate]);

  return (
    <div className="space-y-4">
      {/* Flow Name */}
      <div className="space-y-2">
        <Label>Flow Name</Label>
        <Input
          value={localData.flowName}
          onChange={(e) => handleChange({ flowName: e.target.value })}
          placeholder="e.g., Customer Registration"
        />
        <p className="text-xs text-muted-foreground">
          Give this input flow a descriptive name.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Textarea
          value={localData.description}
          onChange={(e) => handleChange({ description: e.target.value })}
          placeholder="Describe what this flow collects..."
          rows={3}
        />
      </div>

      {/* Webhook Configuration */}
      <Collapsible open={webhookOpen} onOpenChange={setWebhookOpen} className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Webhook</span>
              {localData.webhook.enabled && localData.webhook.url && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            {webhookOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3 space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Send data to webhook</Label>
              <p className="text-xs text-muted-foreground">
                Send collected answers to an external URL
              </p>
            </div>
            <Switch
              checked={localData.webhook.enabled}
              onCheckedChange={(enabled) =>
                handleChange({
                  webhook: { ...localData.webhook, enabled },
                })
              }
            />
          </div>

          {localData.webhook.enabled && (
            <>
              {/* Webhook URL */}
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={localData.webhook.url}
                  onChange={(e) =>
                    handleChange({
                      webhook: { ...localData.webhook, url: e.target.value },
                    })
                  }
                  placeholder="https://your-api.com/webhook"
                  type="url"
                />
              </div>

              {/* HTTP Method */}
              <div className="space-y-2">
                <Label>HTTP Method</Label>
                <Select
                  value={localData.webhook.method}
                  onValueChange={(method: 'POST' | 'PUT' | 'PATCH') =>
                    handleChange({
                      webhook: { ...localData.webhook, method },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include Metadata */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include metadata</Label>
                  <p className="text-xs text-muted-foreground">
                    Add timestamp, flow name, phone number
                  </p>
                </div>
                <Switch
                  checked={localData.webhook.includeMetadata ?? true}
                  onCheckedChange={(includeMetadata) =>
                    handleChange({
                      webhook: { ...localData.webhook, includeMetadata },
                    })
                  }
                />
              </div>

              {/* Custom Headers */}
              <div className="space-y-2">
                <Label>Custom Headers (Optional)</Label>
                <div className="space-y-2">
                  {Object.entries(localData.webhook.headers || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input value={key} disabled className="flex-1 bg-muted" />
                      <Input value={value} disabled className="flex-1 bg-muted" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          const newHeaders = { ...localData.webhook.headers };
                          delete newHeaders[key];
                          handleChange({
                            webhook: { ...localData.webhook, headers: newHeaders },
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      value={newHeaderKey}
                      onChange={(e) => setNewHeaderKey(e.target.value)}
                      placeholder="Header name"
                      className="flex-1"
                    />
                    <Input
                      value={newHeaderValue}
                      onChange={(e) => setNewHeaderValue(e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!newHeaderKey || !newHeaderValue}
                      onClick={() => {
                        if (newHeaderKey && newHeaderValue) {
                          handleChange({
                            webhook: {
                              ...localData.webhook,
                              headers: {
                                ...localData.webhook.headers,
                                [newHeaderKey]: newHeaderValue,
                              },
                            },
                          });
                          setNewHeaderKey('');
                          setNewHeaderValue('');
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add authorization or custom headers for your webhook
                </p>
              </div>

              {/* Payload Preview */}
              <div className="space-y-2">
                <Label>Payload Preview</Label>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
{`{
  ${localData.webhook.includeMetadata ? `"metadata": {
    "flow_name": "${localData.flowName || 'Untitled'}",
    "timestamp": "2024-01-01T12:00:00Z",
    "phone_number": "+1234567890"
  },
  ` : ''}"answers": {
    "question_1": "User's answer",
    "question_2": "Another answer"
  }
}`}
                </pre>
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Save Button */}
      <div className="pt-2 border-t">
        <Button
          onClick={handleSave}
          className="w-full"
          variant={isDirty ? "default" : "secondary"}
        >
          {showSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : isDirty ? (
            'Save Changes'
          ) : (
            'Saved'
          )}
        </Button>
      </div>

      {/* Tips */}
      <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
        <p className="font-medium">How to use:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Connect the output to a Question node</li>
          <li>Chain multiple Question nodes together</li>
          <li>Each question saves the answer to a variable</li>
          <li>Use variables in later messages with {`{{variable_name}}`}</li>
        </ul>
      </div>
    </div>
  );
}
