import { env } from "../env.mjs";
import { logger } from "@/lib/logger";

interface MetaAppDetails {
  appId: string;
  name: string;
  company?: string;
  category?: string;
}

interface TenantMetaConfig {
  facebook_app_id: string;
  facebook_app_secret: string;
  whatsapp_business_account_id: string;
  access_token: string;
}

export class MetaConfigService {
  private configs = new Map<string, TenantMetaConfig>();
  private appDetailsCache = new Map<string, MetaAppDetails>();

  /**
   * Fetch app details directly from Meta's Graph API
   */
  async getAppDetailsFromMeta(accessToken: string): Promise<MetaAppDetails> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v22.0/app?access_token=${accessToken}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch app details from Meta');
      }

      const data = await response.json();
      
      const appDetails: MetaAppDetails = {
        appId: data.id,
        name: data.name,
        company: data.company,
        category: data.category,
      };

      // Cache the app details
      this.appDetailsCache.set(accessToken, appDetails);
      
      return appDetails;
    } catch (error) {
      logger.error('Error fetching app details from Meta', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Load configuration for a specific tenant/organization
   */
  async loadConfig(organizationId: string): Promise<TenantMetaConfig> {
    if (this.configs.has(organizationId)) {
      return this.configs.get(organizationId)!;
    }

    try {
      // Fetch from your backend API
      const config = await this.fetchTenantConfig(organizationId);
      this.configs.set(organizationId, config);
      return config;
    } catch (error) {
      logger.error('Error loading tenant config', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Fetch tenant configuration from your backend
   */
  private async fetchTenantConfig(organizationId: string): Promise<TenantMetaConfig> {
    try {
      const response = await fetch(`/api/config/meta/${organizationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenant config: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to environment variables for development
      logger.warn('Falling back to environment variables for Meta config');
      return {
        facebook_app_id: env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
        facebook_app_secret: process.env.FACEBOOK_APP_SECRET || '',
        whatsapp_business_account_id: '', // This should come from appService
        access_token: '', // This should come from appService
      };
    }
  }

  /**
   * Get App ID for a specific tenant/organization
   */
  async getAppId(organizationId: string, accessToken?: string): Promise<string> {
    try {
      // Try to get from tenant config first
      const config = await this.loadConfig(organizationId);
      
      if (config.facebook_app_id) {
        return config.facebook_app_id;
      }

      // If not available in config, fetch from Meta directly
      if (accessToken) {
        const appDetails = await this.getAppDetailsFromMeta(accessToken);
        
        // Update the config cache with the fetched app ID
        config.facebook_app_id = appDetails.appId;
        this.configs.set(organizationId, config);
        
        return appDetails.appId;
      }

      throw new Error('App ID not available in config and no access token provided');
    } catch (error) {
      logger.error('Error getting App ID', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get App ID from WhatsApp service configuration
   */
  async getAppIdFromService(appService: any): Promise<string> {
    try {
      // First try to get from the service configuration
      if (appService.facebook_app_id) {
        return appService.facebook_app_id;
      }

      // If not available, fetch from Meta using the access token
      if (appService.access_token) {
        const appDetails = await this.getAppDetailsFromMeta(appService.access_token);
        return appDetails.appId;
      }

      // Fallback to environment variable
      if (env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
        return env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      }

      throw new Error('Unable to determine App ID from service configuration');
    } catch (error) {
      logger.error('Error getting App ID from service', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get full Meta configuration for an app service
   */
  async getConfigForAppService(appService: any): Promise<{ appId: string; accessToken: string; wabaId: string } | null> {
    try {
      let appId = '';
      let accessToken = appService.access_token || '';
      let wabaId = appService.whatsapp_business_account_id || '';

      // First try to get from the service configuration
      if (appService.facebook_app_id) {
        appId = appService.facebook_app_id;
      } else if (env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
        appId = env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      } else if (accessToken) {
        // Fetch from Meta using the access token
        const appDetails = await this.getAppDetailsFromMeta(accessToken);
        appId = appDetails.appId;
      } else {
        throw new Error('Unable to determine App ID from service configuration');
      }

      return {
        appId,
        accessToken,
        wabaId
      };
    } catch (error) {
      logger.error('Error getting config for app service', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Clear cached configurations (useful for development/testing)
   */
  clearCache(): void {
    this.configs.clear();
    this.appDetailsCache.clear();
  }

  /**
   * Validate Meta configuration
   */
  async validateConfig(organizationId: string): Promise<boolean> {
    try {
      const config = await this.loadConfig(organizationId);
      
      // Check if all required fields are present
      const requiredFields = [
        'facebook_app_id',
        'whatsapp_business_account_id',
        'access_token'
      ];

      const missingFields = requiredFields.filter(field => !config[field as keyof TenantMetaConfig]);
      
      if (missingFields.length > 0) {
        logger.warn(`Missing Meta config fields for org ${organizationId}`, { missingFields });
        return false;
      }

      // Optionally validate by making a test API call
      if (config.access_token) {
        try {
          await this.getAppDetailsFromMeta(config.access_token);
          return true;
        } catch (error) {
          logger.warn('Meta config validation failed', { error: error instanceof Error ? error.message : String(error) });
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Error validating Meta config', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }
}

// Export singleton instance
export const metaConfigService = new MetaConfigService();
