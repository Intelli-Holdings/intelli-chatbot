"use client";

import { useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';

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

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  return data?.results || [];
};

const normalizeField = (field: any): CustomField => ({
  ...field,
  active: field.active ?? field.is_active ?? true,
});

const formatErrorMessage = (errorData: unknown, fallback: string) => {
  if (!errorData) return fallback;
  if (typeof errorData === 'string') return errorData;
  if (errorData instanceof Error) return errorData.message;
  if (typeof errorData === 'object') {
    const data = errorData as Record<string, any>;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.detail === 'string') return data.detail;
    const fieldMessages = Object.entries(data)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${key}: ${String(message)}`);
        }
        if (value && typeof value === 'object') {
          return Object.entries(value).map(([subKey, subValue]) => `${key}.${subKey}: ${String(subValue)}`);
        }
        return `${key}: ${String(value)}`;
      })
      .filter(Boolean);
    if (fieldMessages.length > 0) return fieldMessages.join(' | ');
  }
  return fallback;
};

const parseErrorResponse = async (response: Response, fallback: string) => {
  const text = await response.text();
  if (!text) return fallback;
  try {
    return formatErrorMessage(JSON.parse(text), fallback);
  } catch {
    return formatErrorMessage(text, fallback);
  }
};

const toApiPayload = <T extends Record<string, any>>(data: T) => {
  const payload = { ...data } as Record<string, any>;
  if ("active" in payload) {
    payload.is_active = payload.active;
    delete payload.active;
  }
  return payload;
};

export function useCustomFields(organizationId?: string): UseCustomFieldsReturn {
  const queryClient = useQueryClient();
  const queryKey = ['custom-fields', organizationId];

  const fetchCustomFields = useCallback(async (): Promise<CustomField[]> => {
    if (!organizationId) {
      return [];
    }

    const response = await fetch(`/api/contacts/custom-fields?organization=${organizationId}`);

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Failed to fetch custom fields'));
    }

    const data = await response.json();
    return normalizeList<CustomField>(data).map(normalizeField);
  }, [organizationId]);

  const query = useQuery(queryKey, fetchCustomFields, {
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000,
  });

  const createCustomField = useCallback(async (data: CreateCustomFieldData): Promise<CustomField> => {
    const response = await fetch('/api/contacts/custom-fields', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toApiPayload(data)),
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Failed to create custom field'));
    }

    const newField = normalizeField(await response.json());
    queryClient.setQueryData<CustomField[]>(queryKey, (old) => {
      const existing = old || [];
      return [...existing, newField];
    });

    return newField;
  }, [queryClient, queryKey]);

  const updateCustomField = useCallback(async (id: string, data: UpdateCustomFieldData): Promise<CustomField> => {
    const response = await fetch(`/api/contacts/custom-fields/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toApiPayload(data)),
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Failed to update custom field'));
    }

    const updatedField = normalizeField(await response.json());
    queryClient.setQueryData<CustomField[]>(queryKey, (old) => {
      const existing = old || [];
      return existing.map(field => field.id === id ? updatedField : field);
    });

    return updatedField;
  }, [queryClient, queryKey]);

  const deleteCustomField = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/contacts/custom-fields/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Failed to delete custom field'));
    }

    queryClient.setQueryData<CustomField[]>(queryKey, (old) => {
      const existing = old || [];
      return existing.filter(field => field.id !== id);
    });
  }, [queryClient, queryKey]);

  return {
    customFields: query.data || [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: async () => {
      await query.refetch();
    },
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
  const queryClient = useQueryClient();
  const queryKey = ['custom-field-values', contactId];

  const fetchValues = useCallback(async (): Promise<CustomFieldValue[]> => {
    if (!contactId) {
      return [];
    }

    const response = await fetch(`/api/contacts/custom-field-values?contact=${contactId}`);

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Failed to fetch custom field values'));
    }

    const data = await response.json();
    return normalizeList<CustomFieldValue>(data);
  }, [contactId]);

  const query = useQuery(queryKey, fetchValues, {
    enabled: Boolean(contactId),
    staleTime: 60 * 1000,
  });

  const createOrUpdateValue = useCallback(async (data: CreateCustomFieldValueData): Promise<CustomFieldValue> => {
    const response = await fetch('/api/contacts/custom-field-values', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response, 'Failed to save custom field value'));
    }

    const newValue = await response.json();

    queryClient.setQueryData<CustomFieldValue[]>(queryKey, (old) => {
      const existing = old || [];
      const existingIndex = existing.findIndex(value =>
        value.id === newValue.id || (value.custom_field === newValue.custom_field && value.contact === newValue.contact)
      );
      if (existingIndex >= 0) {
        const updated = [...existing];
        updated[existingIndex] = newValue;
        return updated;
      }
      return [...existing, newValue];
    });

    return newValue;
  }, [queryClient, queryKey]);

  return {
    values: query.data || [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: async () => {
      await query.refetch();
    },
    createOrUpdateValue,
  };
}
