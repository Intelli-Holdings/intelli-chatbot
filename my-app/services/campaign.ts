interface Campaign {
  id: string;
  name: string;
  description: string;
  channel: 'whatsapp' | 'sms' | 'email';
  phone_number?: string;
  status: 'draft' | 'scheduled' | 'ready' | 'paused' | 'completed' | 'failed';
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
    total?: number;
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
  template_id?: string;  // For template-based campaigns
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
    body_params?: string[];  // Backend format for body parameters
    button_params?: string[];  // Backend format for button parameters
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
        console.error("Backend error response:", errorData)
        throw new Error(errorData.error || errorData.detail || errorData.message || "Failed to create campaign")
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating campaign:", error)
      throw error
    }
  }

  /**
   * Fetch campaigns with filters
   * Returns paginated response with count, next, previous, and results
   */
  static async fetchCampaigns(organizationId: string, filters?: {
    channel?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ campaigns: Campaign[]; count: number; next: string | null; previous: string | null }> {
    try {
      if (!organizationId) {
        return { campaigns: [], count: 0, next: null, previous: null };
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

      // Handle paginated response format
      if (data.results) {
        return {
          campaigns: data.results,
          count: data.count || data.results.length,
          next: data.next || null,
          previous: data.previous || null
        };
      }

      // Handle non-paginated array response
      if (Array.isArray(data)) {
        return {
          campaigns: data,
          count: data.length,
          next: null,
          previous: null
        };
      }

      // Fallback
      return { campaigns: [], count: 0, next: null, previous: null };
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
  }): Promise<{ campaigns: Campaign[], totalCount: number }> {
    try {
      if (!organizationId) {
        return { campaigns: [], totalCount: 0 };
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

      // Handle paginated response
      if (data.results && typeof data.count === 'number') {
        return {
          campaigns: data.results,
          totalCount: data.count
        };
      }

      // Handle non-paginated response
      const campaigns = Array.isArray(data) ? data : [];
      return {
        campaigns,
        totalCount: campaigns.length
      };
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
      await this.updateCampaign(campaignId, organizationId, { status: 'ready' } as any);
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
   * Supports three formats:
   * 1. Legacy format: Add recipients by tag_ids/contact_ids (no parameters)
   * 2. New format: Add recipients with template parameters per recipient
   * 3. Tag format with global params: Add by tag_ids with template_params that apply to all
   */
  static async addWhatsAppCampaignRecipients(
    campaignId: string,
    organizationId: string,
    recipients: {
      tag_ids?: number[];
      contact_ids?: number[];
      recipients?: Array<{
        phone: string;
        fullname?: string;
        email?: string;
        template_params?: {
          header_params?: string[];
          body_params?: string[];
          button_params?: string[];
        };
      }>;
      // Global template params (applied to all contacts from tags/contact_ids)
      template_params?: {
        header_params?: string[];
        body_params?: string[];
        button_params?: string[];
      };
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

      if (!recipients.tag_ids && !recipients.contact_ids && !recipients.recipients) {
        throw new Error('At least one of tag_ids, contact_ids, or recipients must be provided');
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

      // New format: recipients with template parameters
      if (recipients.recipients && recipients.recipients.length > 0) {
        payload.recipients = recipients.recipients;
      }

      // Global template params (for tag-based recipients)
      if (recipients.template_params) {
        payload.template_params = recipients.template_params;
      }

      const response = await fetch(`/api/campaigns/whatsapp/${campaignId}/add_recipients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }

        throw new Error(errorData.error || errorData.detail || errorData.message || `Failed to add recipients (${response.status})`);
      }

      const result = await response.json();
      return result;
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
    executeNow: boolean = true,
    scheduledAt?: string
  ): Promise<any> {
    try {
      const payload: Record<string, any> = {
        organization_id: organizationId,
        execute_now: executeNow,
      };

      if (scheduledAt) {
        payload.scheduled_at = scheduledAt;
      }

      const response = await fetch(`/api/campaigns/whatsapp/${campaignId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to execute campaign';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorData.message || errorMessage;
        } catch {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(`${errorMessage} (status ${response.status})`);
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
   * Preview messages for a WhatsApp campaign
   * Returns a sample of messages with template parameters substituted
   */
  static async previewWhatsAppCampaignMessages(
    campaignId: string,
    organizationId: string,
    limit: number = 5
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('organization', organizationId);
      params.append('limit', limit.toString());

      const response = await fetch(
        `/api/campaigns/whatsapp/${campaignId}/preview_messages/?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preview messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error previewing messages:', error);
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

  /**
   * Export CSV template for campaign parameters
   * Includes custom fields and template parameters
   */
  static async exportParamsTemplate(
    campaignId: string,
    organizationId: string,
    recipients?: {
      tag_ids?: number[];
      contact_ids?: number[];
    },
    includeCustomFields?: boolean
  ): Promise<Blob> {
    try {
      const payload: any = {
        organization_id: organizationId,
      };

      // Include tag_ids if provided
      if (recipients?.tag_ids && recipients.tag_ids.length > 0) {
        payload.tag_ids = recipients.tag_ids;
      }

      // Include contact_ids if provided
      if (recipients?.contact_ids && recipients.contact_ids.length > 0) {
        payload.contact_ids = recipients.contact_ids;
      }

      // Include custom fields flag
      if (includeCustomFields !== undefined) {
        payload.include_custom_fields = includeCustomFields;
      }

      const response = await fetch(`/api/campaigns/whatsapp/${campaignId}/export_params_template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to export params template');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting params template:', error);
      throw error;
    }
  }

  /**
   * Retry failed messages in a WhatsApp campaign
   * Resets failed message statuses to pending and re-triggers the campaign
   */
  static async retryFailedMessages(
    whatsappCampaignId: string,
    organizationId: string
  ): Promise<{
    message: string;
    task_id: string;
    retry_count: number;
  }> {
    try {
      const response = await fetch(
        `/api/campaigns/whatsapp/${whatsappCampaignId}/retry_messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organization_id: organizationId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.detail || 'Failed to retry messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error retrying failed messages:', error);
      throw error;
    }
  }

  /**
   * Import CSV template with campaign parameter values
   * New workflow: Creates contacts and recipients automatically
   *
   * CSV Format:
   * contact_id,phone,fullname,email,{{1}},{{2}},custom.loyalty_id,custom.city
   * ,+221774130289,Mahamadou Kaba,kaba@example.com,Value1,Value2,ABC123,Dakar
   * ,+1234567890,John Doe,john@example.com,Val1,Val2,XYZ789,New York
   *
   * Features:
   * - Creates new contacts if they don't exist (when create_if_not_exists=true)
   * - Adds existing contacts as recipients
   * - Updates parameters for all (including custom fields)
   * - Phone normalization (handles +, spaces, etc.)
   * - Transaction-safe (all or nothing)
   * - Import mapping support (when mapping_id is provided)
   *
   * Response:
   * {
   *   updated_recipients: number,
   *   new_recipients_created: number,
   *   new_contacts_created: number,
   *   errors: Array<{row: number, contact: string, error: string}>,
   *   total_pending: number,
   *   total_recipients: number
   * }
   */
  static async importParamsTemplate(
    campaignId: string,
    organizationId: string,
    file: File,
    createIfNotExists: boolean = true,
    mappingId?: string
  ): Promise<{
    updated_recipients: number;
    new_recipients_created: number;
    new_contacts_created: number;
    errors: Array<{ row: number; contact: string; error: string }>;
    total_pending: number;
    total_recipients: number;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organization_id', organizationId);
      formData.append('create_if_not_exists', createIfNotExists.toString());

      if (mappingId) {
        formData.append('mapping_id', mappingId);
      }

      const response = await fetch(`/api/campaigns/whatsapp/${campaignId}/import_params_template`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to import params template');
      }

      return await response.json();
    } catch (error) {
      console.error('Error importing params template:', error);
      throw error;
    }
  }
}

export type { Campaign, CreateCampaignData };
