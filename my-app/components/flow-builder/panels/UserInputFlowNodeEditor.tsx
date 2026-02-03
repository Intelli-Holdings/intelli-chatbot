'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserInputFlowNodeData } from '../nodes/UserInputFlowNode';

interface UserInputFlowNodeEditorProps {
  data: UserInputFlowNodeData;
  onUpdate: (data: Partial<UserInputFlowNodeData>) => void;
}

export default function UserInputFlowNodeEditor({ data, onUpdate }: UserInputFlowNodeEditorProps) {
  const [localData, setLocalData] = useState({
    flowName: data.flowName || '',
    description: data.description || '',
  });
  const [isDirty, setIsDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Sync local state when data prop changes
  useEffect(() => {
    setLocalData({
      flowName: data.flowName || '',
      description: data.description || '',
    });
    setIsDirty(false);
  }, [data.flowName, data.description]);

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
