"use client";

import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useCustomFields, useCustomFieldValues, type CustomField } from '@/hooks/use-custom-fields';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import { logger } from "@/lib/logger";

interface ContactCustomFieldsProps {
  contactId: string;
}

export default function ContactCustomFields({ contactId }: ContactCustomFieldsProps) {
  const organizationId = useActiveOrganizationId();
  const { customFields, loading: fieldsLoading } = useCustomFields(organizationId || undefined);
  const { values, loading: valuesLoading, createOrUpdateValue } = useCustomFieldValues(contactId);

  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  const activeFields = customFields.filter(f => f.active);

  useEffect(() => {
    // Initialize edited values from fetched values
    const initialValues: Record<string, any> = {};
    values.forEach(value => {
      initialValues[value.custom_field] = value.value;
    });
    setEditedValues(initialValues);
  }, [values]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    // Reset to current values
    const currentValues: Record<string, any> = {};
    values.forEach(value => {
      currentValues[value.custom_field] = value.value;
    });
    setEditedValues(currentValues);
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      // Save all edited values
      const promises = activeFields.map(async (field) => {
        const value = editedValues[field.id];

        // Skip if value is empty and field is not required
        if ((value === undefined || value === null || value === '') && !field.required) {
          return;
        }

        // Validate required fields
        if (field.required && (value === undefined || value === null || value === '')) {
          throw new Error(`${field.name} is required`);
        }

        // Type conversion based on field type
        let typedValue: any = value;
        if (field.field_type === 'number') {
          typedValue = parseFloat(value);
          if (isNaN(typedValue)) {
            throw new Error(`${field.name} must be a valid number`);
          }
        } else if (field.field_type === 'boolean') {
          typedValue = Boolean(value);
        } else if (field.field_type === 'enum') {
          if (field.choices && !field.choices.includes(value)) {
            throw new Error(`${field.name} must be one of: ${field.choices.join(', ')}`);
          }
        }

        await createOrUpdateValue({
          contact: contactId,
          custom_field: field.id,
          value: typedValue,
        });
      });

      await Promise.all(promises);
      toast.success('Custom fields saved successfully');
      setEditMode(false);
    } catch (error) {
      logger.error("Error saving custom fields", { error: error instanceof Error ? error.message : String(error) });
      toast.error(error instanceof Error ? error.message : 'Failed to save custom fields');
    }
  };

  const handleValueChange = (fieldId: string, value: any) => {
    setEditedValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderFieldInput = (field: CustomField) => {
    const value = editedValues[field.id] ?? field.default_value ?? '';

    switch (field.field_type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={field.help_text || `Enter ${field.name.toLowerCase()}`}
            disabled={!editMode}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={field.help_text || `Enter ${field.name.toLowerCase()}`}
            disabled={!editMode}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            disabled={!editMode}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleValueChange(field.id, checked)}
              disabled={!editMode}
            />
            <Label className="text-sm text-muted-foreground">
              {field.help_text || 'Enable'}
            </Label>
          </div>
        );

      case 'enum':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleValueChange(field.id, val)}
            disabled={!editMode}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.choices?.map(choice => (
                <SelectItem key={choice} value={choice}>
                  {choice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            disabled={!editMode}
          />
        );
    }
  };

  const loading = fieldsLoading || valuesLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Loading custom fields...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeFields.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Custom Fields</CardTitle>
            <CardDescription>Additional contact information</CardDescription>
          </div>
          {!editMode ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeFields.map(field => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={`field-${field.id}`}>
                {field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderFieldInput(field)}
              {field.help_text && !editMode && (
                <p className="text-xs text-muted-foreground">{field.help_text}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
