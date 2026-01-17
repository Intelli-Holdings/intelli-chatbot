"use client";

import { useState, useEffect, useCallback } from 'react';
import { CampaignService } from '@/services/campaign';

interface Recipient {
  id: string;
  contact_id: number;
  status: string;
  contact_name?: string;
  contact_phone?: string;
  message_content?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  failed_at?: string;
  error_message?: string;
}

interface UseCampaignRecipientsReturn {
  recipients: Recipient[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addRecipients: (recipients: { tag_ids?: number[]; contact_ids?: number[] }) => Promise<void>;
  executeCampaign: (executeNow?: boolean) => Promise<void>;
}

export function useCampaignRecipients(
  campaignId?: string,
  organizationId?: string,
  statusFilter?: string
): UseCampaignRecipientsReturn {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipients = useCallback(async () => {
    if (!campaignId || !organizationId) {
      setRecipients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await CampaignService.getWhatsAppCampaignRecipients(
        campaignId,
        organizationId,
        { status: statusFilter }
      );
      setRecipients(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Error fetching recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recipients');
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId, organizationId, statusFilter]);

  const addRecipients = useCallback(async (recipients: { tag_ids?: number[]; contact_ids?: number[] }) => {
    if (!campaignId || !organizationId) {
      throw new Error('Campaign ID and Organization ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      await CampaignService.addWhatsAppCampaignRecipients(
        campaignId,
        organizationId,
        recipients
      );
      await fetchRecipients(); // Refresh the list
    } catch (err) {
      console.error('Error adding recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to add recipients');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaignId, organizationId, fetchRecipients]);

  const executeCampaign = useCallback(async (executeNow: boolean = true) => {
    if (!campaignId || !organizationId) {
      throw new Error('Campaign ID and Organization ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      await CampaignService.executeWhatsAppCampaign(
        campaignId,
        organizationId,
        executeNow
      );
    } catch (err) {
      console.error('Error executing campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute campaign');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaignId, organizationId]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  return {
    recipients,
    loading,
    error,
    refetch: fetchRecipients,
    addRecipients,
    executeCampaign,
  };
}
