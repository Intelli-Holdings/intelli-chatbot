"use client";

import { useState, useEffect, useCallback } from 'react';
import { CampaignService, type Campaign } from '@/services/campaign';

interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCampaigns(appServiceId?: string): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!appServiceId) {
      setCampaigns([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await CampaignService.fetchCampaigns(appServiceId);
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [appServiceId]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
  };
}
