'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StartNodeData, ChatbotTrigger } from '@/types/chatbot-automation';

interface StartNodeEditorProps {
  data: StartNodeData;
  onUpdate: (data: Partial<StartNodeData>) => void;
}

export default function StartNodeEditor({ data, onUpdate }: StartNodeEditorProps) {
  const [keywords, setKeywords] = useState(data.trigger.keywords?.join(', ') || '');

  const handleKeywordsChange = useCallback((value: string) => {
    setKeywords(value);

    const keywordArray = value
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);

    const newTrigger: ChatbotTrigger = {
      ...data.trigger,
      keywords: keywordArray,
    };

    const newLabel =
      newTrigger.type === 'keyword'
        ? `Keywords: ${keywordArray.join(', ') || 'None'}`
        : newTrigger.type === 'first_message'
        ? 'First Message'
        : 'Button Click';

    onUpdate({
      trigger: newTrigger,
      label: newLabel,
    });
  }, [data.trigger, onUpdate]);

  const handleTypeChange = (type: ChatbotTrigger['type']) => {
    const newTrigger: ChatbotTrigger = {
      ...data.trigger,
      type,
      keywords: type === 'keyword' ? data.trigger.keywords : undefined,
    };

    const newLabel =
      type === 'keyword'
        ? `Keywords: ${data.trigger.keywords?.join(', ') || 'None'}`
        : type === 'first_message'
        ? 'First Message'
        : 'Button Click';

    onUpdate({
      trigger: newTrigger,
      label: newLabel,
    });
  };

  const handleMatchTypeChange = (isExact: boolean) => {
    onUpdate({
      trigger: { ...data.trigger, caseSensitive: isExact },
    });
  };

  return (
    <div className="space-y-4">
      {/* Trigger Type */}
      <div className="space-y-2">
        <Label>Trigger Type</Label>
        <Select value={data.trigger.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="keyword">Keyword Match</SelectItem>
            <SelectItem value="first_message">First Message</SelectItem>
            <SelectItem value="button_click">Button Click</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.trigger.type === 'keyword' && (
        <>
          {/* Keywords Input */}
          <div className="space-y-2">
            <Label>
              Keywords <span className="text-destructive">*</span>
            </Label>
            <Input
              value={keywords}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              placeholder="hi, hello, start, help"
            />
            <p className="text-xs text-muted-foreground">
              Enter comma-separated keywords that will trigger this bot
            </p>
          </div>

          {/* Keywords Preview */}
          {keywords && (
            <div className="flex flex-wrap gap-1">
              {keywords.split(',').map((kw, i) => {
                const trimmed = kw.trim();
                if (!trimmed) return null;
                return (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {trimmed}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Matching Type Buttons */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Matching Type</Label>
            <div className="flex gap-2">
              <Button
                variant={data.trigger.caseSensitive ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleMatchTypeChange(true)}
              >
                Exact Match
              </Button>
              <Button
                variant={!data.trigger.caseSensitive ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleMatchTypeChange(false)}
              >
                Contains
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.trigger.caseSensitive
                ? 'Bot triggers only when user input exactly matches a keyword'
                : 'Bot triggers when user input contains any keyword'}
            </p>
          </div>
        </>
      )}

      {data.trigger.type === 'first_message' && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            This trigger activates when a user sends their first message in a new conversation.
            Perfect for welcome flows.
          </p>
        </div>
      )}

      {data.trigger.type === 'button_click' && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            This trigger activates when a user clicks a button from a previous menu option.
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm space-y-2">
        <p className="font-medium text-green-700 dark:text-green-300">Tips:</p>
        <ul className="text-xs text-green-600 dark:text-green-400 space-y-1 list-disc list-inside">
          <li>Use common greetings like &quot;hi&quot;, &quot;hello&quot;, &quot;start&quot;</li>
          <li>Add product-specific keywords for targeted flows</li>
          <li>Connect the output to a Menu or Text node</li>
        </ul>
      </div>
    </div>
  );
}
