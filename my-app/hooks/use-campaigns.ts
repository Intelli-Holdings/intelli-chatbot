"use client";

import { useState, useEffect, useCallback } from 'react';
import { CampaignService, type Campaign } from '@/services/campaign';

interface UseCampaignsReturn {
  campaigns: Campaign[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseCampaignsFilters {
  channel?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function useCampaigns(
  organizationId?: string,
  filters?: UseCampaignsFilters
): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stringify filters to avoid object reference issues
  const filtersJson = JSON.stringify(filters);

  const fetchCampaigns = useCallback(async () => {
    if (!organizationId) {
      setCampaigns([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedFilters = filtersJson ? JSON.parse(filtersJson) : undefined;
      const data = await CampaignService.fetchCampaigns(organizationId, parsedFilters);
      setCampaigns(data.campaigns || []);
      setTotalCount(typeof data.count === 'number' ? data.count : data.campaigns?.length || 0);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      setCampaigns([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [organizationId, filtersJson]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    totalCount,
    loading,
    error,
    refetch: fetchCampaigns,
  };
}

export function useWhatsAppCampaigns(
  organizationId?: string,
  filters?: { status?: string; page?: number; pageSize?: number }
): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stringify filters to avoid object reference issues
  const filtersJson = JSON.stringify(filters);

  const fetchCampaigns = useCallback(async () => {
    if (!organizationId) {
      setCampaigns([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedFilters = filtersJson ? JSON.parse(filtersJson) : undefined;
      const data = await CampaignService.fetchWhatsAppCampaigns(organizationId, parsedFilters);
      setCampaigns(Array.isArray(data) ? data : data.results || []);
      setTotalCount(
        typeof (data as any).count === 'number'
          ? (data as any).count
          : Array.isArray(data)
          ? data.length
          : data.results?.length || 0
      );
    } catch (err) {
      console.error('Error fetching WhatsApp campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch WhatsApp campaigns');
      setCampaigns([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [organizationId, filtersJson]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    totalCount,
    loading,
    error,
    refetch: fetchCampaigns,
  };
}
