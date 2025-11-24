"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CampaignService, type Campaign } from '@/services/campaign';
import useActiveOrganizationId from '@/hooks/use-organization-id';

interface CampaignEditFormProps {
  campaign: Campaign;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CampaignEditForm({ campaign, onSuccess, onCancel }: CampaignEditFormProps) {
  const organizationId = useActiveOrganizationId();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: campaign.name || '',
    description: campaign.description || '',
    scheduled_at: campaign.scheduled_at
      ? new Date(campaign.scheduled_at).toISOString().slice(0, 16)
      : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        organization: organizationId, // Include organization in the body
      };

      // Always include name and description
      updateData.name = formData.name.trim();
      updateData.description = formData.description.trim();

      // Handle scheduled_at
      if (formData.scheduled_at && formData.scheduled_at.trim() !== '') {
        updateData.scheduled_at = new Date(formData.scheduled_at).toISOString();
      } else {
        updateData.scheduled_at = null;
      }

      await CampaignService.updateCampaign(
        campaign.id,
        organizationId,
        updateData
      );

      toast.success('Campaign updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter campaign name"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter campaign description"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="scheduled_at">Scheduled Time</Label>
          <Input
            id="scheduled_at"
            type="datetime-local"
            value={formData.scheduled_at}
            onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Leave empty for immediate sending, or set a future date/time
          </p>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Campaign Information</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Channel: <span className="font-medium text-foreground">{campaign.channel?.toUpperCase()}</span></p>
            <p>Status: <span className="font-medium text-foreground">{campaign.status ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1) : 'Draft'}</span></p>
            {campaign.phone_number && (
              <p>Phone Number: <span className="font-medium text-foreground">{campaign.phone_number}</span></p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Only name, description, and schedule can be edited for existing campaigns.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Campaign'}
        </Button>
      </div>
    </form>
  );
}
