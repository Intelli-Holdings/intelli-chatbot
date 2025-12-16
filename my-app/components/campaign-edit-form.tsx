"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Save, X } from 'lucide-react';
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
    // Template payload fields
    template_name: campaign.payload?.template_name || '',
    template_language: campaign.payload?.template_language || '',
    body_parameters: campaign.payload?.body_parameters || [],
    header_parameters: campaign.payload?.header_parameters || [],
    message_content: campaign.payload?.message_content || '',
  });

  const handleBodyParameterChange = (index: number, value: string) => {
    const newParams = [...formData.body_parameters];
    newParams[index] = {
      ...newParams[index],
      text: value,
    };
    setFormData({ ...formData, body_parameters: newParams });
  };

  const handleHeaderParameterChange = (index: number, value: string) => {
    const newParams = [...formData.header_parameters];
    newParams[index] = {
      ...newParams[index],
      text: value,
    };
    setFormData({ ...formData, header_parameters: newParams });
  };

  const canEditTemplate = () => {
    // Only allow template editing for draft and scheduled campaigns
    return campaign.status === 'draft' || campaign.status === 'scheduled';
  };

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
        organization: organizationId,
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

      // Include payload updates if campaign allows editing
      if (canEditTemplate()) {
        updateData.payload = {
          template_name: formData.template_name,
          template_language: formData.template_language,
          body_parameters: formData.body_parameters,
          header_parameters: formData.header_parameters,
          message_content: formData.message_content,
        };
      }

      await CampaignService.updateCampaign(
        campaign.id,
        organizationId,
        updateData
      );

      // Re-schedule or execute WhatsApp campaigns after updates
      if (campaign.channel === 'whatsapp') {
        const targetWhatsAppId = campaign.whatsapp_campaign_id || campaign.id;
        const executeNow = !formData.scheduled_at || formData.scheduled_at.trim() === '';

        try {
          await CampaignService.executeWhatsAppCampaign(
            targetWhatsAppId,
            organizationId,
            executeNow
          );
        } catch (execError) {
          console.error('Error scheduling/executing WhatsApp campaign after edit:', execError);
          toast.error(execError instanceof Error ? execError.message : 'Failed to schedule campaign');
        }
      }

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
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update campaign name, description, and schedule</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Template/Content Section */}
      {!canEditTemplate() && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Template content cannot be edited for campaigns with status: {campaign.status}.
            Only draft and scheduled campaigns can have their template content modified.
          </AlertDescription>
        </Alert>
      )}

      {canEditTemplate() && (
        <Card>
          <CardHeader>
            <CardTitle>Template Content</CardTitle>
            <CardDescription>
              Update template parameters and message content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Info */}
            {formData.template_name && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">Template: {formData.template_name}</p>
                {formData.template_language && (
                  <p className="text-xs text-muted-foreground">Language: {formData.template_language}</p>
                )}
              </div>
            )}

            {/* Header Parameters */}
            {formData.header_parameters && formData.header_parameters.length > 0 && (
              <div className="space-y-3">
                <Label>Header Parameters</Label>
                {formData.header_parameters.map((param, index) => (
                  <div key={index}>
                    <Label htmlFor={`header-param-${index}`} className="text-sm text-muted-foreground">
                      Parameter {index + 1} ({param.type})
                    </Label>
                    <Input
                      id={`header-param-${index}`}
                      value={param.text}
                      onChange={(e) => handleHeaderParameterChange(index, e.target.value)}
                      placeholder={`Enter ${param.type} value`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Body Parameters */}
            {formData.body_parameters && formData.body_parameters.length > 0 && (
              <div className="space-y-3">
                <Label>Body Parameters</Label>
                {formData.body_parameters.map((param, index) => (
                  <div key={index}>
                    <Label htmlFor={`body-param-${index}`} className="text-sm text-muted-foreground">
                      {param.parameter_name || `Parameter ${index + 1}`} ({param.type})
                    </Label>
                    <Input
                      id={`body-param-${index}`}
                      value={param.text}
                      onChange={(e) => handleBodyParameterChange(index, e.target.value)}
                      placeholder={`Enter ${param.parameter_name || 'parameter'} value`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Simple Message Content */}
            {formData.message_content && !formData.template_name && (
              <div>
                <Label htmlFor="message_content">Message Content</Label>
                <Textarea
                  id="message_content"
                  value={formData.message_content}
                  onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                  placeholder="Enter message content"
                  rows={5}
                />
              </div>
            )}

            {/* No template data */}
            {!formData.template_name && !formData.message_content && (
              <Alert>
                <AlertDescription>
                  No template or message content found for this campaign.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Updating...' : 'Update Campaign'}
        </Button>
      </div>
    </form>
  );
}
