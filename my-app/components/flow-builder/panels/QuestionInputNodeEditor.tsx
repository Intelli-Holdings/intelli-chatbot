'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, MessageCircle, List, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuestionInputNodeData } from '../nodes/QuestionInputNode';
import { useCustomFields } from '@/hooks/use-custom-fields';
import useActiveOrganizationId from '@/hooks/use-organization-id';

const SYSTEM_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'custom_field', label: 'Custom Field' },
];

interface QuestionInputNodeEditorProps {
  data: QuestionInputNodeData;
  onUpdate: (data: Partial<QuestionInputNodeData>) => void;
}

export default function QuestionInputNodeEditor({ data, onUpdate }: QuestionInputNodeEditorProps) {
  const organizationId = useActiveOrganizationId();
  const { customFields, loading: loadingFields } = useCustomFields(organizationId || undefined);

  const [localData, setLocalData] = useState({
    question: data.question || '',
    variableName: data.variableName || '',
    inputType: data.inputType || 'free_text' as const,
    options: data.options || [],
    required: data.required ?? true,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [variableType, setVariableType] = useState<'system' | 'custom'>(() => {
    // Determine initial variable type based on current value
    const varName = data.variableName || '';
    if (varName.startsWith('custom:')) return 'custom';
    return 'system';
  });

  // Sync local state when data prop changes
  useEffect(() => {
    setLocalData({
      question: data.question || '',
      variableName: data.variableName || '',
      inputType: data.inputType || 'free_text',
      options: data.options || [],
      required: data.required ?? true,
    });
    setIsDirty(false);

    // Update variable type
    const varName = data.variableName || '';
    if (varName.startsWith('custom:')) {
      setVariableType('custom');
    } else {
      setVariableType('system');
    }
  }, [data.question, data.variableName, data.inputType, data.options, data.required]);

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

  const addOption = () => {
    handleChange({ options: [...localData.options, ''] });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...localData.options];
    newOptions[index] = value;
    handleChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = localData.options.filter((_, i) => i !== index);
    handleChange({ options: newOptions });
  };

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="space-y-2">
        <Label>Question</Label>
        <Textarea
          value={localData.question}
          onChange={(e) => handleChange({ question: e.target.value })}
          placeholder="What would you like to ask?"
          rows={3}
        />
      </div>

      {/* Save Answer To */}
      <div className="space-y-2">
        <Label>Save Answer To</Label>

        {/* Field Type Selection */}
        <Select
          value={variableType === 'custom' ? 'custom_field' : localData.variableName}
          onValueChange={(value) => {
            if (value === 'custom_field') {
              setVariableType('custom');
              handleChange({ variableName: 'custom:' });
            } else {
              setVariableType('system');
              handleChange({ variableName: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {SYSTEM_FIELDS.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom Field Selection */}
        {variableType === 'custom' && (
          <Select
            value={localData.variableName.replace('custom:', '')}
            onValueChange={(value) => handleChange({ variableName: `custom:${value}` })}
          >
            <SelectTrigger>
              {loadingFields ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select custom field" />
              )}
            </SelectTrigger>
            <SelectContent>
              {customFields.length === 0 ? (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No custom fields found
                </div>
              ) : (
                customFields.map((field) => (
                  <SelectItem key={field.id} value={field.key}>
                    {field.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}

        <p className="text-xs text-muted-foreground">
          Use <code className="bg-muted px-1 rounded">{`{{${localData.variableName?.replace('custom:', '') || 'variable'}}}`}</code> to reference this answer later.
        </p>
      </div>

      {/* Answer Type */}
      <div className="space-y-2">
        <Label>Answer Type</Label>
        <Select
          value={localData.inputType}
          onValueChange={(value: 'free_text' | 'multiple_choice') =>
            handleChange({
              inputType: value,
              options: value === 'multiple_choice' ? (localData.options.length > 0 ? localData.options : ['']) : []
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free_text">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Free Text</span>
              </div>
            </SelectItem>
            <SelectItem value="multiple_choice">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span>Multiple Choice</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {localData.inputType === 'free_text'
            ? 'User can type any response'
            : 'User selects from predefined options'}
        </p>
      </div>

      {/* Multiple Choice Options */}
      {localData.inputType === 'multiple_choice' && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="space-y-2">
            {localData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-5">
                  {index + 1}.
                </span>
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={() => removeOption(index)}
                  disabled={localData.options.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addOption}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      )}

      {/* Required Toggle */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <Label>Required</Label>
          <p className="text-xs text-muted-foreground">
            User must answer this question
          </p>
        </div>
        <Switch
          checked={localData.required}
          onCheckedChange={(checked) => handleChange({ required: checked })}
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
        <p className="font-medium">Tips:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Connect output to another Question for follow-up</li>
          <li>Or connect to any other node to continue the flow</li>
          <li>Multiple choice shows as quick reply buttons</li>
        </ul>
      </div>
    </div>
  );
}
