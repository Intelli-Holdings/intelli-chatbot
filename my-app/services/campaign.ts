interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  template?: {
    id: string;
    name: string;
  };
  audience: {
    total: number;
    uploaded: number;
    segments: string[];
  };
  schedule: {
    startDate: string;
    timezone: string;
    immediate: boolean;
  };
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
    replied: number;
    progress: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CreateCampaignData {
  name: string;
  description: string;
  templateId: string;
  audienceListIds: string[];
  schedule: {
    immediate: boolean;
    startDate?: string;
    timezone?: string;
  };
  appServiceId: string;
}

export class CampaignService {
  /**
   * Create a new broadcast campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create campaign: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Fetch campaigns for an app service
   */
  static async fetchCampaigns(appServiceId: string): Promise<Campaign[]> {
    try {
      if (!appServiceId) {
        return [];
      }

      const response = await fetch(`/api/campaigns?appServiceId=${appServiceId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch campaigns: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  /**
   * Get campaign details by ID
   */
  static async getCampaign(campaignId: string): Promise<Campaign> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch campaign: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  /**
   * Pause a campaign
   */
  static async pauseCampaign(campaignId: string): Promise<void> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/pause`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to pause campaign: ${errorData.error?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error pausing campaign:', error);
      throw error;
    }
  }

  /**
   * Resume a paused campaign
   */
  static async resumeCampaign(campaignId: string): Promise<void> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/resume`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to resume campaign: ${errorData.error?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error resuming campaign:', error);
      throw error;
    }
  }

  /**
   * Delete a campaign
   */
  static async deleteCampaign(campaignId: string): Promise<void> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete campaign: ${errorData.error?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(campaignId: string): Promise<Campaign['stats']> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/stats`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch campaign stats: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      throw error;
    }
  }

  /**
   * Launch a draft campaign
   */
  static async launchCampaign(campaignId: string): Promise<void> {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to launch campaign: ${errorData.error?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error launching campaign:', error);
      throw error;
    }
  }
}

export type { Campaign, CreateCampaignData };
