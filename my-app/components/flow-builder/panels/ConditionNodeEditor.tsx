'use client';

import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConditionNodeData, ConditionRule } from '../nodes/ConditionNode';
import {
  generateId,
  CUSTOM_FIELD_PREFIX,
  isCustomField,
  getCustomFieldKey,
  createCustomFieldName,
} from '@/types/chatbot-automation';
import { useCustomFields } from '@/hooks/use-custom-fields';
import useActiveOrganizationId from '@/hooks/use-organization-id';

interface ConditionNodeEditorProps {
  data: ConditionNodeData;
  onUpdate: (data: Partial<ConditionNodeData>) => void;
}

const SYSTEM_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'name', label: 'Name' },
  { value: 'custom_field', label: 'Custom Field' },
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'exists', label: 'Exists (has value)' },
  { value: 'not_exists', label: 'Does Not Exist' },
];

export default function ConditionNodeEditor({
  data,
  onUpdate,
}: ConditionNodeEditorProps) {
  const organizationId = useActiveOrganizationId();
  const { customFields, loading: loadingFields } = useCustomFields(organizationId || undefined);

  const addRule = () => {
    const newRule: ConditionRule = {
      field: 'email',
      operator: 'exists',
    };
    onUpdate({ rules: [...data.rules, newRule] });
  };

  const updateRule = (index: number, updates: Partial<ConditionRule>) => {
    const newRules = [...data.rules];
    newRules[index] = { ...newRules[index], ...updates };
    onUpdate({ rules: newRules });
  };

  const deleteRule = (index: number) => {
    onUpdate({ rules: data.rules.filter((_, i) => i !== index) });
  };

  const needsValue = (operator: ConditionRule['operator']) => {
    return !['exists', 'not_exists'].includes(operator);
  };

  return (
    <div className="space-y-4">
      {/* Match Type */}
      <div className="space-y-2">
        <Label>Match Type</Label>
        <div className="flex gap-2">
          <Button
            variant={data.matchType === 'all' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => onUpdate({ matchType: 'all' })}
          >
            All Match
          </Button>
          <Button
            variant={data.matchType === 'any' ? 'default' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => onUpdate({ matchType: 'any' })}
          >
            Any Match
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {data.matchType === 'all'
            ? 'All conditions must be true'
            : 'At least one condition must be true'}
        </p>
      </div>

      {/* Rules */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label>Conditions</Label>
          <Button variant="outline" size="sm" onClick={addRule}>
            <Plus className="h-3 w-3 mr-1" />
            Add Rule
          </Button>
        </div>

        <div className="space-y-2">
          {data.rules.map((rule, index) => (
            <div
              key={index}
              className="p-3 bg-muted/50 rounded-lg space-y-2"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  {/* Field */}
                  <Select
                    value={isCustomField(rule.field) ? 'custom_field' : rule.field}
                    onValueChange={(value) => {
                      if (value === 'custom_field') {
                        updateRule(index, { field: CUSTOM_FIELD_PREFIX });
                      } else {
                        updateRule(index, { field: value });
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
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
                  {isCustomField(rule.field) && (
                    <div className="space-y-1">
                      <Select
                        value={getCustomFieldKey(rule.field) || undefined}
                        onValueChange={(value) => {
                          if (value) {
                            updateRule(index, { field: createCustomFieldName(value) });
                          }
                        }}
                      >
                        <SelectTrigger className="h-8">
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
                      {rule.field === CUSTOM_FIELD_PREFIX && (
                        <p className="text-xs text-destructive">
                          Please select a custom field
                        </p>
                      )}
                    </div>
                  )}

                  {/* Operator */}
                  <Select
                    value={rule.operator}
                    onValueChange={(value: ConditionRule['operator']) =>
                      updateRule(index, { operator: value })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Value */}
                  {needsValue(rule.operator) && (
                    <Input
                      value={rule.value || ''}
                      onChange={(e) =>
                        updateRule(index, { value: e.target.value })
                      }
                      placeholder="Value"
                      className="h-8"
                    />
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => deleteRule(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {data.rules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conditions added. Add a rule to define when this branch should be taken.
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Connect the <span className="font-medium text-green-600">True</span> output to the path
          when conditions pass, and the <span className="font-medium text-red-500">False</span> output
          for when they don&apos;t.
        </p>
      </div>
    </div>
  );
}
