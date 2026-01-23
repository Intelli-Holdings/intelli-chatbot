'use client';

import { useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StartNodeData, ChatbotTrigger } from '@/types/chatbot-automation';
import { toast } from 'sonner';

interface StartNodeEditorProps {
  data: StartNodeData;
  onUpdate: (data: Partial<StartNodeData>) => void;
}

export default function StartNodeEditor({ data, onUpdate }: StartNodeEditorProps) {
  const [keywords, setKeywords] = useState(data.trigger.keywords?.join(', ') || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleKeywordsInput = (value: string) => {
    setKeywords(value);
    setHasChanges(true);
  };

  const handleSave = useCallback(() => {
    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k);

    if (keywordArray.length === 0) {
      toast.error('Please enter at least one keyword');
      return;
    }

    const newTrigger: ChatbotTrigger = {
      ...data.trigger,
      keywords: keywordArray,
    };

    const newLabel = `Keywords: ${keywordArray.join(', ')}`;

    onUpdate({
      trigger: newTrigger,
      label: newLabel,
    });

    setHasChanges(false);
    toast.success('Keywords saved');
  }, [keywords, data.trigger, onUpdate]);

  const handleMatchTypeChange = (isExact: boolean) => {
    onUpdate({
      trigger: { ...data.trigger, caseSensitive: isExact },
    });
  };

  return (
    <div className="space-y-4">
      {/* Keywords Input */}
      <div className="space-y-2">
        <Label>
          Keywords <span className="text-destructive">*</span>
        </Label>
        <Input
          value={keywords}
          onChange={(e) => handleKeywordsInput(e.target.value)}
          placeholder="hi, hello, start"
          className="placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">
          Enter comma-separated keywords that will trigger this flow
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

      {/* Save Button */}
      {keywords && hasChanges && (
        <Button onClick={handleSave} size="sm" className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Save Keywords
        </Button>
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
            ? 'Flow triggers only when user input exactly matches a keyword'
            : 'Flow triggers when user input contains any keyword'}
        </p>
      </div>

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
