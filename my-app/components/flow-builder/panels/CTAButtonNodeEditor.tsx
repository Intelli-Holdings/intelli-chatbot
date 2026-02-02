'use client';

import { useState, useEffect } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CTAButtonNodeData } from '../nodes/CTAButtonNode';
import { toast } from 'sonner';

interface CTAButtonNodeEditorProps {
  data: CTAButtonNodeData;
  onUpdate: (data: Partial<CTAButtonNodeData>) => void;
}

const LIMITS = {
  header: 60,
  body: 1024,
  footer: 60,
  buttonText: 20,
};

export default function CTAButtonNodeEditor({
  data,
  onUpdate,
}: CTAButtonNodeEditorProps) {
  const [localData, setLocalData] = useState<CTAButtonNodeData>(data);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset local state when data changes (e.g., switching nodes)
  useEffect(() => {
    setLocalData(data);
    setHasChanges(false);
  }, [data]);

  const updateLocalData = (updates: Partial<CTAButtonNodeData>) => {
    setLocalData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Validate required fields
    if (!localData.body.trim()) {
      toast.error('Please enter a message body');
      return;
    }
    if (!localData.buttonText.trim()) {
      toast.error('Please enter button text');
      return;
    }
    if (!localData.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Validate URL format
    try {
      new URL(localData.url);
    } catch {
      toast.error('Please enter a valid URL (including https://)');
      return;
    }

    onUpdate(localData);
    setHasChanges(false);
    toast.success('Changes saved');
  };

  return (
    <div className="space-y-4">
      {/* Header (optional) */}
      <div className="space-y-2">
        <Label>Header (optional)</Label>
        <Input
          value={localData.header || ''}
          onChange={(e) => updateLocalData({ header: e.target.value || undefined })}
          placeholder="Header text"
          maxLength={LIMITS.header}
        />
        <p className="text-xs text-muted-foreground text-right">
          {(localData.header || '').length}/{LIMITS.header}
        </p>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label>
          Message Body <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={localData.body}
          onChange={(e) => updateLocalData({ body: e.target.value })}
          placeholder="Enter your message..."
          rows={3}
          maxLength={LIMITS.body}
        />
        <p className="text-xs text-muted-foreground text-right">
          {localData.body.length}/{LIMITS.body}
        </p>
      </div>

      {/* Footer (optional) */}
      <div className="space-y-2">
        <Label>Footer (optional)</Label>
        <Input
          value={localData.footer || ''}
          onChange={(e) => updateLocalData({ footer: e.target.value || undefined })}
          placeholder="Footer text"
          maxLength={LIMITS.footer}
        />
      </div>

      {/* Button Text */}
      <div className="space-y-2 pt-2 border-t">
        <Label>
          Button Text <span className="text-destructive">*</span>
        </Label>
        <Input
          value={localData.buttonText}
          onChange={(e) => updateLocalData({ buttonText: e.target.value })}
          placeholder="e.g., Visit Website"
          maxLength={LIMITS.buttonText}
        />
        <p className="text-xs text-muted-foreground text-right">
          {localData.buttonText.length}/{LIMITS.buttonText}
        </p>
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label>
          URL <span className="text-destructive">*</span>
        </Label>
        <Input
          value={localData.url}
          onChange={(e) => updateLocalData({ url: e.target.value })}
          placeholder="https://example.com"
          type="url"
        />
        <p className="text-xs text-muted-foreground">
          Must include https:// or http://
        </p>
      </div>

      {/* Preview */}
      <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
        <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-2">
          Button Preview
        </p>
        <div className="flex items-center justify-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
          <ExternalLink className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">
            {localData.buttonText || 'Button Text'}
          </span>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <Button onClick={handleSave} size="sm" className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          CTA buttons open a URL when tapped. The user will be redirected to the link in their browser.
        </p>
      </div>
    </div>
  );
}
