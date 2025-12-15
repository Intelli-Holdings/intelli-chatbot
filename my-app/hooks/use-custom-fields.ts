"use client";

import { useState, useEffect, useCallback } from 'react';

export type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'enum';

export interface CustomField {
  id: string;
  organization: string;
  name: string;
  key: string;
  field_type: CustomFieldType;
  required: boolean;
  active: boolean;
  default_value: string | number | boolean | null;
  help_text?: string;
  choices?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFieldData {
  organization: string;
  name: string;
  key?: string;
  field_type: CustomFieldType;
  required?: boolean;
  active?: boolean;
  default_value?: string | number | boolean | null;
  help_text?: string;
  choices?: string[];
}

export interface UpdateCustomFieldData {
  name?: string;
  key?: string;
  field_type?: CustomFieldType;
  required?: boolean;
  active?: boolean;
  default_value?: string | number | boolean | null;
  help_text?: string;
  choices?: string[];
}

interface UseCustomFieldsReturn {
  customFields: CustomField[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCustomField: (data: CreateCustomFieldData) => Promise<CustomField>;
  updateCustomField: (id: string, data: UpdateCustomFieldData) => Promise<CustomField>;
  deleteCustomField: (id: string) => Promise<void>;
}

export function useCustomFields(organizationId?: string): UseCustomFieldsReturn {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomFields = useCallback(async () => {
    if (!organizationId) {
      setCustomFields([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contacts/custom-fields?organization=${organizationId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch custom fields');
      }

      const data = await response.json();
      setCustomFields(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error fetching custom fields:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch custom fields');
      setCustomFields([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchCustomFields();
  }, [fetchCustomFields]);

  const createCustomField = useCallback(async (data: CreateCustomFieldData): Promise<CustomField> => {
    try {
      const response = await fetch('/api/contacts/custom-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create custom field');
      }

      const newField = await response.json();
      setCustomFields(prev => [...prev, newField]);
      return newField;
    } catch (err) {
      console.error('Error creating custom field:', err);
      throw err;
    }
  }, []);

  const updateCustomField = useCallback(async (id: string, data: UpdateCustomFieldData): Promise<CustomField> => {
    try {
      const response = await fetch(`/api/contacts/custom-fields/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update custom field');
      }

      const updatedField = await response.json();
      setCustomFields(prev => prev.map(field => field.id === id ? updatedField : field));
      return updatedField;
    } catch (err) {
      console.error('Error updating custom field:', err);
      throw err;
    }
  }, []);

  const deleteCustomField = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts/custom-fields/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete custom field');
      }

      setCustomFields(prev => prev.filter(field => field.id !== id));
    } catch (err) {
      console.error('Error deleting custom field:', err);
      throw err;
    }
  }, []);

  return {
    customFields,
    loading,
    error,
    refetch: fetchCustomFields,
    createCustomField,
    updateCustomField,
    deleteCustomField,
  };
}

// Hook for fetching custom field values for a specific contact
export interface CustomFieldValue {
  id: string;
  contact: string;
  custom_field: string;
  custom_field_name?: string;
  custom_field_key?: string;
  value: string | number | boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFieldValueData {
  contact: string;
  custom_field: string;
  value: string | number | boolean | null;
}

interface UseCustomFieldValuesReturn {
  values: CustomFieldValue[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createOrUpdateValue: (data: CreateCustomFieldValueData) => Promise<CustomFieldValue>;
}

export function useCustomFieldValues(contactId?: string): UseCustomFieldValuesReturn {
  const [values, setValues] = useState<CustomFieldValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValues = useCallback(async () => {
    if (!contactId) {
      setValues([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contacts/custom-field-values?contact=${contactId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch custom field values');
      }

      const data = await response.json();
      setValues(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error fetching custom field values:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch custom field values');
      setValues([]);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchValues();
  }, [fetchValues]);

  const createOrUpdateValue = useCallback(async (data: CreateCustomFieldValueData): Promise<CustomFieldValue> => {
    try {
      const response = await fetch('/api/contacts/custom-field-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save custom field value');
      }

      const newValue = await response.json();

      // Update local state
      setValues(prev => {
        const existingIndex = prev.findIndex(
          v => v.custom_field === data.custom_field && v.contact === data.contact
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newValue;
          return updated;
        }
        return [...prev, newValue];
      });

      return newValue;
    } catch (err) {
      console.error('Error saving custom field value:', err);
      throw err;
    }
  }, []);

  return {
    values,
    loading,
    error,
    refetch: fetchValues,
    createOrUpdateValue,
  };
}
