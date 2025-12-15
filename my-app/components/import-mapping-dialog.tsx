"use client";

import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCustomFields } from '@/hooks/use-custom-fields';
import { useImportMappings, type ImportMapping } from '@/hooks/use-import-mappings';

interface ImportMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  channel: 'whatsapp' | 'sms' | 'email';
  csvHeaders: string[];
  templateId?: string;
  onMappingCreated?: (mapping: ImportMapping) => void;
  existingMapping?: ImportMapping | null;
}

interface MappingBindings {
  [key: string]: string; // target field -> CSV header
}

const CORE_FIELDS = [
  { key: 'phone', label: 'Phone Number', required: true },
  { key: 'fullname', label: 'Full Name', required: false },
  { key: 'email', label: 'Email', required: false },
];

export default function ImportMappingDialog({
  open,
  onOpenChange,
  organizationId,
  channel,
  csvHeaders,
  templateId,
  onMappingCreated,
  existingMapping,
}: ImportMappingDialogProps) {
  const { customFields } = useCustomFields(organizationId);
  const { createMapping, updateMapping } = useImportMappings(organizationId, channel);

  const [mappingName, setMappingName] = useState('');
  const [mappingDescription, setMappingDescription] = useState('');
  const [bindings, setBindings] = useState<MappingBindings>({});

  useEffect(() => {
    if (existingMapping) {
      setMappingName(existingMapping.name);
      setMappingDescription(existingMapping.description || '');
      setBindings(existingMapping.bindings);
    } else {
      // Auto-suggest mappings based on header names
      const autoBindings: MappingBindings = {};

      csvHeaders.forEach(header => {
        const lowerHeader = header.toLowerCase();

        // Core fields
        if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) {
          autoBindings['phone'] = header;
        } else if (lowerHeader.includes('name') || lowerHeader.includes('fullname')) {
          autoBindings['fullname'] = header;
        } else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) {
          autoBindings['email'] = header;
        }

        // Custom fields
        customFields.forEach(field => {
          const fieldKeyLower = field.key.toLowerCase();
          const fieldNameLower = field.name.toLowerCase();

          if (lowerHeader.includes(fieldKeyLower) || lowerHeader.includes(fieldNameLower)) {
            autoBindings[`custom.${field.key}`] = header;
          }
        });
      });

      setBindings(autoBindings);
    }
  }, [existingMapping, csvHeaders, customFields]);

  const handleBindingChange = (targetField: string, csvHeader: string) => {
    setBindings(prev => {
      if (csvHeader === 'ignore') {
        const newBindings = { ...prev };
        delete newBindings[targetField];
        return newBindings;
      }
      return { ...prev, [targetField]: csvHeader };
    });
  };

  const validateMapping = (): boolean => {
    // Phone is required
    if (!bindings['phone']) {
      toast.error('Phone number mapping is required');
      return false;
    }

    // Check required custom fields
    const requiredCustomFields = customFields.filter(f => f.required && f.active);
    for (const field of requiredCustomFields) {
      if (!bindings[`custom.${field.key}`]) {
        toast.error(`Required custom field "${field.name}" must be mapped`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!mappingName.trim()) {
      toast.error('Mapping name is required');
      return;
    }

    if (!validateMapping()) {
      return;
    }

    try {
      const data = {
        organization: organizationId,
        name: mappingName,
        description: mappingDescription || undefined,
        channel,
        template_id: templateId,
        bindings,
      };

      let savedMapping: ImportMapping;

      if (existingMapping) {
        savedMapping = await updateMapping(existingMapping.id, data);
        toast.success('Import mapping updated successfully');
      } else {
        savedMapping = await createMapping(data);
        toast.success('Import mapping created successfully');
      }

      onMappingCreated?.(savedMapping);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving import mapping:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save import mapping');
    }
  };

  const allTargetFields = [
    ...CORE_FIELDS,
    ...customFields
      .filter(f => f.active)
      .map(f => ({
        key: `custom.${f.key}`,
        label: `${f.name} (custom)`,
        required: f.required,
      })),
  ];

  const isFieldMapped = (targetFieldKey: string) => {
    return bindings[targetFieldKey] !== undefined;
  };

  const getUnmappedHeaders = () => {
    const mappedHeaders = new Set(Object.values(bindings));
    return csvHeaders.filter(header => !mappedHeaders.has(header));
  };

  const unmappedHeaders = getUnmappedHeaders();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingMapping ? 'Edit Import Mapping' : 'Create Import Mapping'}
          </DialogTitle>
          <DialogDescription>
            Map CSV columns to contact fields. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mapping Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapping-name">
                Mapping Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mapping-name"
                placeholder="e.g., WhatsApp Campaign Default"
                value={mappingName}
                onChange={(e) => setMappingName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapping-description">Description</Label>
              <Textarea
                id="mapping-description"
                placeholder="Optional description for this mapping"
                value={mappingDescription}
                onChange={(e) => setMappingDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Mapping Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Field Mappings</Label>
              <div className="text-sm text-muted-foreground">
                {Object.keys(bindings).length} fields mapped
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select which CSV column maps to each contact field. You can leave non-required fields unmapped.
              </AlertDescription>
            </Alert>

            <div className="border rounded-lg divide-y">
              {allTargetFields.map((field) => (
                <div
                  key={field.key}
                  className={`p-4 flex items-center justify-between ${
                    field.required && !isFieldMapped(field.key) ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <code className="bg-muted px-1 py-0.5 rounded">{field.key}</code>
                    </div>
                  </div>

                  <div className="w-64">
                    <Select
                      value={bindings[field.key] || 'ignore'}
                      onValueChange={(value) => handleBindingChange(field.key, value)}
                    >
                      <SelectTrigger className={field.required && !bindings[field.key] ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ignore">
                          <span className="text-muted-foreground">-- Ignore --</span>
                        </SelectItem>
                        {csvHeaders.map(header => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unmapped Headers */}
          {unmappedHeaders.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="font-semibold mb-1">Unmapped columns:</div>
                <div className="flex flex-wrap gap-2">
                  {unmappedHeaders.map(header => (
                    <code key={header} className="bg-amber-100 px-2 py-1 rounded text-xs">
                      {header}
                    </code>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {existingMapping ? 'Update' : 'Create'} Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
