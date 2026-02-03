"use client";

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCustomFields, type CustomField, type CustomFieldType } from '@/hooks/use-custom-fields';
import useActiveOrganizationId from '@/hooks/use-organization-id';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

interface CustomFieldFormData {
  name: string;
  key: string;
  field_type: CustomFieldType;
  required: boolean;
  active: boolean;
  default_value: string;
  help_text: string;
  choices: string[];
}

const slugifyKey = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export default function CustomFieldsManager() {
  const organizationId = useActiveOrganizationId();
  const { customFields, loading, createCustomField, updateCustomField, deleteCustomField, refetch } = useCustomFields(organizationId || undefined);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<CustomField | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<CustomFieldFormData>({
    name: '',
    key: '',
    field_type: 'text',
    required: false,
    active: true,
    default_value: '',
    help_text: '',
    choices: [],
  });

  const [choicesInput, setChoicesInput] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      field_type: 'text',
      required: false,
      active: true,
      default_value: '',
      help_text: '',
      choices: [],
    });
    setChoicesInput('');
    setEditingField(null);
  };

  const handleOpenDialog = (field?: CustomField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        key: field.key,
        field_type: field.field_type,
        required: field.required,
        active: field.active,
        default_value: field.default_value?.toString() || '',
        help_text: field.help_text || '',
        choices: field.choices || [],
      });
      setChoicesInput(field.choices?.join(', ') || '');
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!organizationId) {
      toast.error('Organization not found');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Field name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const choices = formData.field_type === 'enum'
        ? choicesInput.split(',').map(c => c.trim()).filter(Boolean)
        : [];

      const normalizedKey = slugifyKey(formData.key || formData.name);
      if (!normalizedKey) {
        toast.error('Field key is required');
        return;
      }

      const duplicateKey = customFields.some(
        (field) => field.key === normalizedKey && field.id !== editingField?.id
      );
      if (duplicateKey) {
        toast.error('A custom field with this key already exists');
        return;
      }

      if (formData.field_type === 'enum' && choices.length === 0) {
        toast.error('Enum fields must have at least one choice');
        return;
      }

      const defaultValue = formData.default_value.trim();
      const data = {
        organization: organizationId,
        name: formData.name,
        key: normalizedKey,
        field_type: formData.field_type,
        required: formData.required,
        active: formData.active,
        default_value: defaultValue ? defaultValue : null,
        help_text: formData.help_text || undefined,
        choices: choices.length > 0 ? choices : undefined,
      };

      if (editingField) {
        await updateCustomField(editingField.id, data);
        toast.success('Custom field updated successfully');
      } else {
        await createCustomField(data);
        toast.success('Custom field created successfully');
      }

      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error('Error saving custom field:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save custom field');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (field: CustomField) => {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fieldToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCustomField(fieldToDelete.id);
      toast.success('Custom field deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete custom field');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  const copyPlaceholder = (key: string) => {
    const placeholder = `{{custom.${key}}}`;
    navigator.clipboard.writeText(placeholder);
    setCopiedPlaceholder(key);
    toast.success('Placeholder copied to clipboard');
    setTimeout(() => setCopiedPlaceholder(null), 2000);
  };

  const getFieldTypeColor = (type: CustomFieldType) => {
    const colors: Record<CustomFieldType, string> = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-purple-100 text-purple-800',
      boolean: 'bg-yellow-100 text-yellow-800',
      enum: 'bg-pink-100 text-pink-800',
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Manage custom fields for your contacts. Use placeholders like {'{'}{'{'} custom.field_key {'}'}{'}'}​ in templates.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Loading custom fields...
              </div>
            </div>
          ) : customFields.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No custom fields yet. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Placeholder</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{field.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{field.key}</code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getFieldTypeColor(field.field_type)}>
                        {field.field_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {'{'}{'{'} custom.{field.key} {'}'}{'}'}​
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPlaceholder(field.key)}
                        >
                          {copiedPlaceholder === field.key ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {field.required ? (
                        <Badge variant="destructive" className="text-xs">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {field.active ? (
                        <Badge variant="default" className="text-xs bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {field.default_value ? String(field.default_value) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(field)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(field)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Custom Field' : 'Create Custom Field'}</DialogTitle>
            <DialogDescription>
              Define a custom field for your contacts. The key will be used in templates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Field Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Loyalty ID"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">
                  Key (slug)
                </Label>
                <Input
                  id="key"
                  placeholder="e.g., loyalty_id (auto-generated if blank)"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="field_type">
                Field Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.field_type}
                onValueChange={(value: CustomFieldType) => setFormData({ ...formData, field_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="enum">Enum (dropdown)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.field_type === 'enum' && (
              <div className="space-y-2">
                <Label htmlFor="choices">
                  Choices (comma-separated) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="choices"
                  placeholder="e.g., gold, silver, bronze"
                  value={choicesInput}
                  onChange={(e) => setChoicesInput(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="default_value">Default Value</Label>
              <Input
                id="default_value"
                placeholder="Optional default value"
                value={formData.default_value}
                onChange={(e) => setFormData({ ...formData, default_value: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="help_text">Help Text</Label>
              <Textarea
                id="help_text"
                placeholder="Optional help text for this field"
                value={formData.help_text}
                onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => setFormData({ ...formData, required: !!checked })}
                />
                <Label htmlFor="required" className="cursor-pointer">Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                />
                <Label htmlFor="active" className="cursor-pointer">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingField ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                `${editingField ? 'Update' : 'Create'} Field`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the custom field &quot;{fieldToDelete?.name}&quot;?
              This action cannot be undone and will remove this field from all contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
