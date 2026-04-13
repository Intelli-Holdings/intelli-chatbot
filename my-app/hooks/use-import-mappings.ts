"use client";

import { useState, useEffect, useCallback } from 'react';
import { logger } from "@/lib/logger";

export interface ImportMapping {
  id: string;
  organization: string;
  name: string;
  description?: string;
  channel: 'whatsapp' | 'sms' | 'email';
  template_id?: string;
  bindings: Record<string, string>; // { "phone": "Phone", "custom.loyalty_id": "Loyalty" }
  created_at: string;
  updated_at: string;
}

export interface CreateImportMappingData {
  organization: string;
  name: string;
  description?: string;
  channel: 'whatsapp' | 'sms' | 'email';
  template_id?: string;
  bindings: Record<string, string>;
}

export interface UpdateImportMappingData {
  name?: string;
  description?: string;
  channel?: 'whatsapp' | 'sms' | 'email';
  template_id?: string;
  bindings?: Record<string, string>;
}

interface UseImportMappingsReturn {
  mappings: ImportMapping[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createMapping: (data: CreateImportMappingData) => Promise<ImportMapping>;
  updateMapping: (id: string, data: UpdateImportMappingData) => Promise<ImportMapping>;
  deleteMapping: (id: string) => Promise<void>;
}

export function useImportMappings(
  organizationId?: string,
  channel?: 'whatsapp' | 'sms' | 'email'
): UseImportMappingsReturn {
  const [mappings, setMappings] = useState<ImportMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMappings = useCallback(async () => {
    if (!organizationId) {
      setMappings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ organization: organizationId });
      if (channel) params.set('channel', channel);

      const response = await fetch(`/api/contacts/import-mappings?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch import mappings');
      }

      const data = await response.json();
      setMappings(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      logger.error('Error fetching import mappings', { error: err instanceof Error ? err.message : String(err) });
      setError(err instanceof Error ? err.message : 'Failed to fetch import mappings');
      setMappings([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, channel]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  const createMapping = useCallback(async (data: CreateImportMappingData): Promise<ImportMapping> => {
    try {
      const response = await fetch('/api/contacts/import-mappings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create import mapping');
      }

      const newMapping = await response.json();
      setMappings(prev => [...prev, newMapping]);
      return newMapping;
    } catch (err) {
      logger.error('Error creating import mapping', { error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  }, []);

  const updateMapping = useCallback(async (id: string, data: UpdateImportMappingData): Promise<ImportMapping> => {
    try {
      const response = await fetch(`/api/contacts/import-mappings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update import mapping');
      }

      const updatedMapping = await response.json();
      setMappings(prev => prev.map(mapping => mapping.id === id ? updatedMapping : mapping));
      return updatedMapping;
    } catch (err) {
      logger.error('Error updating import mapping', { error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  }, []);

  const deleteMapping = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/contacts/import-mappings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete import mapping');
      }

      setMappings(prev => prev.filter(mapping => mapping.id !== id));
    } catch (err) {
      logger.error('Error deleting import mapping', { error: err instanceof Error ? err.message : String(err) });
      throw err;
    }
  }, []);

  return {
    mappings,
    loading,
    error,
    refetch: fetchMappings,
    createMapping,
    updateMapping,
    deleteMapping,
  };
}
