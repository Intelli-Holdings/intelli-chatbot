interface Campaign {
  id: string;
  name: string;
  description: string;
  channel: 'whatsapp' | 'sms' | 'email';
  phone_number?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  organization: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  whatsapp_campaign_id?: string;
  payload?: {
    template_name?: string;
    template_language?: string;
    header_parameters?: Array<{
      type: string;
      text: string;
    }>;
    body_parameters?: Array<{
      type: string;
      text: string;
      parameter_name?: string;
    }>;
    message_content?: string;
  };
  template?: {
    id: string;
    name: string;
  };
  audience?: {
    total: number;
    uploaded: number;
    segments: string[];
  };
  stats?: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
    replied: number;
    progress: number;
  };
}

interface CreateCampaignData {
  name: string;
  description: string;
  channel: 'whatsapp' | 'sms' | 'email';
  phone_number?: string;
  organization: string;
  scheduled_at?: string;
  payload: {
    template_name?: string;
    template_language?: string;
    header_parameters?: Array<{
      type: string;
      text: string;
    }>;
    body_parameters?: Array<{
      type: string;
      text: string;
      parameter_name?: string;
    }>;
    message_content?: string;
  };
  recipient_contacts?: string[];
  recipient_tags?: string[];
}

export class CampaignService {
  /**
   * Create a new broadcast campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString() : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create campaign")
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating campaign:", error)
      throw error
    }
  }

  /**
   * Fetch campaigns with filters
   */
  static async fetchCampaigns(organizationId: string, filters?: {
    channel?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<Campaign[]> {
    try {
      if (!organizationId) {
        return [];
      }

      const params = new URLSearchParams();
      params.append('organization', organizationId);

      if (filters?.channel) params.append('channel', filters.channel);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.pageSize) params.append('page_size', filters.pageSize.toString());

      const response = await fetch(`/api/campaigns?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch campaigns');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaign details by ID
   */
  static async getCampaign(campaignId: string, organizationId: string): Promise<Campaign> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}?organization=${organizationId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch campaign');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign summary
   */
  static async getCampaignSummary(campaignId: string, organizationId: string): Promise<any> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/summary?organization=${organizationId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch campaign summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching campaign summary:', error);
      throw error;
    }
  }

  /**
   * Fetch WhatsApp campaigns
   */
  static async fetchWhatsAppCampaigns(organizationId: string, filters?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<Campaign[]> {
    try {
      if (!organizationId) {
        return [];
      }

      const params = new URLSearchParams();
      params.append('organization', organizationId);

      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.pageSize) params.append('page_size', filters.pageSize.toString());

      const response = await fetch(`/api/campaigns/whatsapp?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch WhatsApp campaigns');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('Error fetching WhatsApp campaigns:', error);
      throw error;
    }
  }

  /**
   * Get WhatsApp campaign by ID
   */
  static async getWhatsAppCampaign(campaignId: string, organizationId: string): Promise<Campaign> {
    try {
      const response = await fetch(`/api/campaigns/whatsapp/${campaignId}?organization=${organizationId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch WhatsApp campaign');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching WhatsApp campaign:', error);
      throw error;
    }
  }

  /**
   * Update a campaign
   */
static async updateCampaign(
    campaignId: string,
    organizationId: string,
    data: Partial<CreateCampaignData>,
  ): Promise<Campaign> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}?organization=${organizationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString() : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update campaign")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating campaign:", error)
      throw error
    }
  }

  /**
   * Delete a campaign
   */
  static async deleteCampaign(campaignId: string, organizationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}?organization=${organizationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Pause a campaign (using PATCH to update status)
   */
  static async pauseCampaign(campaignId: string, organizationId: string): Promise<void> {
    try {
      await this.updateCampaign(campaignId, organizationId, { status: 'paused' } as any);
    } catch (error) {
      console.error('Error pausing campaign:', error);
      throw error;
    }
  }

  /**
   * Resume a paused campaign (using PATCH to update status)
   */
  static async resumeCampaign(campaignId: string, organizationId: string): Promise<void> {
    try {
      await this.updateCampaign(campaignId, organizationId, { status: 'active' } as any);
    } catch (error) {
      console.error('Error resuming campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign statistics (using summary endpoint)
   */
  static async getCampaignStats(campaignId: string, organizationId: string): Promise<any> {
    try {
      return await this.getCampaignSummary(campaignId, organizationId);
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      throw error;
    }
  }

  /**
   * Add recipients to WhatsApp campaign
   */
  static async addWhatsAppCampaignRecipients(
    campaignId: string,
    organizationId: string,
    recipients: {
      tag_ids?: number[];
      contact_ids?: number[];
    }
  ): Promise<any> {
    try {
      // Validate inputs
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      if (!recipients.tag_ids && !recipients.contact_ids) {
        throw new Error('At least one of tag_ids or contact_ids must be provided');
      }

      // Filter out undefined values and ensure proper arrays
      const payload: any = {
        organization_id: organizationId,
      };

      if (recipients.tag_ids && recipients.tag_ids.length > 0) {
        payload.tag_ids = recipients.tag_ids;
      }

      if (recipients.contact_ids && recipients.contact_ids.length > 0) {
        payload.contact_ids = recipients.contact_ids;
      }

      const response = await fetch(`/api/campaigns/whatsapp/${campaignId}/add_recipients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to add recipients (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding recipients:', error);
      throw error;
    }
  }

  /**
   * Execute WhatsApp campaign
   */
  static async executeWhatsAppCampaign(
    campaignId: string,
    organizationId: string,
    executeNow: boolean = true
  ): Promise<any> {
    try {
      const response = await fetch(`/api/campaigns/whatsapp/${campaignId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: organizationId,
          execute_now: executeNow,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute campaign');
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing campaign:', error);
      throw error;
    }
  }

  /**
   * Get WhatsApp campaign recipients with optional status filter
   */
  static async getWhatsAppCampaignRecipients(
    campaignId: string,
    organizationId: string,
    filters?: {
      status?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('organization', organizationId);

      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());

      const response = await fetch(
        `/api/campaigns/whatsapp/${campaignId}/recipients?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recipients');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recipients:', error);
      throw error;
    }
  }

  /**
   * Re-execute a WhatsApp campaign by creating a new campaign with the same settings
   * This duplicates the campaign and executes it immediately or schedules it
   */
  static async reExecuteWhatsAppCampaign(
    originalCampaign: Campaign,
    organizationId: string,
    phoneNumber: string,
    scheduleAt?: string
  ): Promise<any> {
    try {
      if (!originalCampaign) {
        throw new Error('Original campaign is required');
      }

      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      console.log('Creating duplicate campaign from:', originalCampaign.id);

      // Step 1: Create a new campaign with the same payload
      const newCampaignData: CreateCampaignData = {
        name: `${originalCampaign.name} (Re-run ${new Date().toLocaleString()})`,
        description: originalCampaign.description,
        channel: originalCampaign.channel,
        phone_number: phoneNumber,
        organization: organizationId,
        scheduled_at: scheduleAt,
        payload: originalCampaign.payload || {},
      };

      const newCampaign = await this.createCampaign(newCampaignData);
      console.log('New campaign created:', newCampaign.id);

      // Step 2: Get recipients from the original campaign
      if (!originalCampaign.whatsapp_campaign_id) {
        throw new Error('Original campaign has no WhatsApp campaign ID');
      }

      const recipientsData = await this.getWhatsAppCampaignRecipients(
        originalCampaign.whatsapp_campaign_id,
        organizationId,
        { page_size: 1000 }
      );

      const recipients = Array.isArray(recipientsData) ? recipientsData : recipientsData.results || [];
      console.log(`Found ${recipients.length} recipients from original campaign`);

      // Step 3: Extract unique contact IDs from recipients
      const contactIds = Array.from(new Set(recipients.map((r: any) => r.contact_id)))
        .filter((id): id is number => typeof id === 'number');

      if (contactIds.length === 0) {
        throw new Error('No recipients found in original campaign');
      }

      // Step 4: Add recipients to new campaign
      if (!newCampaign.whatsapp_campaign_id) {
        throw new Error('New campaign has no WhatsApp campaign ID');
      }

      await this.addWhatsAppCampaignRecipients(
        newCampaign.whatsapp_campaign_id,
        organizationId,
        { contact_ids: contactIds }
      );

      console.log(`Added ${contactIds.length} recipients to new campaign`);

      // Step 5: Execute the new campaign
      const executeNow = !scheduleAt;
      await this.executeWhatsAppCampaign(
        newCampaign.whatsapp_campaign_id,
        organizationId,
        executeNow
      );

      console.log('New campaign executed successfully');

      return {
        original_campaign_id: originalCampaign.id,
        new_campaign_id: newCampaign.id,
        new_whatsapp_campaign_id: newCampaign.whatsapp_campaign_id,
        recipients_count: contactIds.length,
        scheduled: !executeNow
      };
    } catch (error) {
      console.error('Error re-executing campaign:', error);
      throw error;
    }
  }
}

export type { Campaign, CreateCampaignData };
