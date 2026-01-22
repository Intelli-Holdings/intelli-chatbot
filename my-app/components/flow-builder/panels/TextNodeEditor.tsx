'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TextNodeData } from '../nodes/TextNode';

interface TextNodeEditorProps {
  data: TextNodeData;
  onUpdate: (data: Partial<TextNodeData>) => void;
}

export default function TextNodeEditor({ data, onUpdate }: TextNodeEditorProps) {
  return (
    <div className="space-y-4">
      {/* Message */}
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea
          value={data.message || ''}
          onChange={(e) => onUpdate({ message: e.target.value })}
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
            checked={(data.delaySeconds || 0) > 0}
            onCheckedChange={(checked) =>
              onUpdate({ delaySeconds: checked ? 2 : 0 })
            }
          />
        </div>

        {(data.delaySeconds || 0) > 0 && (
          <div className="space-y-2">
            <Label>Delay Duration (seconds)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={data.delaySeconds || 2}
              onChange={(e) =>
                onUpdate({ delaySeconds: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        )}
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
