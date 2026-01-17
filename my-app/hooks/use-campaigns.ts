"use client";

import { useQuery } from 'react-query';
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
  const queryKey = [
    'campaigns',
    organizationId,
    filters?.channel ?? null,
    filters?.status ?? null,
    filters?.page ?? null,
    filters?.pageSize ?? null,
  ];

  const fetchCampaigns = async () => {
    if (!organizationId) {
      return { campaigns: [], count: 0, next: null, previous: null };
    }

    return CampaignService.fetchCampaigns(organizationId, filters);
  };

  const query = useQuery(queryKey, fetchCampaigns, {
    enabled: Boolean(organizationId),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });

  return {
    campaigns: query.data?.campaigns || [],
    totalCount:
      typeof query.data?.count === 'number'
        ? query.data.count
        : query.data?.campaigns?.length || 0,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: async () => {
      if (!organizationId) return;
      await query.refetch();
    },
  };
}

export function useWhatsAppCampaigns(
  organizationId?: string,
  filters?: { status?: string; page?: number; pageSize?: number }
): UseCampaignsReturn {
  const queryKey = [
    'whatsapp-campaigns',
    organizationId,
    filters?.status ?? null,
    filters?.page ?? null,
    filters?.pageSize ?? null,
  ];

  const fetchCampaigns = async () => {
    if (!organizationId) {
      return { campaigns: [], totalCount: 0 };
    }

    return CampaignService.fetchWhatsAppCampaigns(organizationId, filters);
  };

  const query = useQuery(queryKey, fetchCampaigns, {
    enabled: Boolean(organizationId),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });

  return {
    campaigns: query.data?.campaigns || [],
    totalCount: query.data?.totalCount ?? query.data?.campaigns?.length ?? 0,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: async () => {
      if (!organizationId) return;
      await query.refetch();
    },
  };
}

interface CampaignStatusCounts {
  total: number;
  ready: number;
  scheduled: number;
  completed: number;
  draft: number;
}

const defaultStatusCounts: CampaignStatusCounts = {
  total: 0,
  ready: 0,
  scheduled: 0,
  completed: 0,
  draft: 0,
};

export function useCampaignStatusCounts(organizationId?: string, channel?: string) {
  const queryKey = ['campaign-status-counts', organizationId, channel ?? 'all'];

  const fetchStatusCounts = async (): Promise<CampaignStatusCounts> => {
    if (!organizationId) {
      return defaultStatusCounts;
    }

    const channelParam = channel || undefined;
    const [totalData, readyData, scheduledData, completedData, draftData] =
      await Promise.all([
        CampaignService.fetchCampaigns(organizationId, { channel: channelParam }),
        CampaignService.fetchCampaigns(organizationId, { status: 'ready', channel: channelParam }),
        CampaignService.fetchCampaigns(organizationId, { status: 'scheduled', channel: channelParam }),
        CampaignService.fetchCampaigns(organizationId, { status: 'completed', channel: channelParam }),
        CampaignService.fetchCampaigns(organizationId, { status: 'draft', channel: channelParam }),
      ]);

    return {
      total: totalData.count || totalData.campaigns?.length || 0,
      ready: readyData.count || readyData.campaigns?.length || 0,
      scheduled: scheduledData.count || scheduledData.campaigns?.length || 0,
      completed: completedData.count || completedData.campaigns?.length || 0,
      draft: draftData.count || draftData.campaigns?.length || 0,
    };
  };

  const query = useQuery(queryKey, fetchStatusCounts, {
    enabled: Boolean(organizationId),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });

  return {
    counts: query.data || defaultStatusCounts,
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: async () => {
      if (!organizationId) return;
      await query.refetch();
    },
  };
}
