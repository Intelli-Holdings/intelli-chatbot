'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { TextNodeData } from '../nodes/TextNode';

interface TextNodeEditorProps {
  data: TextNodeData;
  onUpdate: (data: Partial<TextNodeData>) => void;
}

export default function TextNodeEditor({ data, onUpdate }: TextNodeEditorProps) {
  const [localData, setLocalData] = useState({
    message: data.message || '',
    delaySeconds: data.delaySeconds || 0,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Sync local state when data prop changes (e.g., different node selected)
  useEffect(() => {
    setLocalData({
      message: data.message || '',
      delaySeconds: data.delaySeconds || 0,
    });
    setIsDirty(false);
  }, [data.message, data.delaySeconds]);

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
      {/* Message */}
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea
          value={localData.message}
          onChange={(e) => handleChange({ message: e.target.value })}
          placeholder="Enter the message to send..."
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          This message will be sent to the user.
        </p>
      </div>

      {/* Delay */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div>
            <Label>Delay Reply</Label>
            <p className="text-xs text-muted-foreground">
              Add a delay before sending this message
            </p>
          </div>
          <Switch
            checked={localData.delaySeconds > 0}
            onCheckedChange={(checked) => {
              handleChange({ delaySeconds: checked ? 2 : 0 });
            }}
          />
        </div>

        {localData.delaySeconds > 0 && (
          <div className="space-y-2">
            <Label>Delay Duration (seconds)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={localData.delaySeconds}
              onChange={(e) =>
                handleChange({ delaySeconds: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        )}
      </div>

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
        <p className="font-medium">Tips:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Use variables like {"{{name}}"} to personalize messages</li>
          <li>Keep messages concise and clear</li>
          <li>Add delays to simulate typing for a natural feel</li>
        </ul>
      </div>
    </div>
  );
}
