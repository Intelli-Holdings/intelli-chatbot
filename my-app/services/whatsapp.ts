interface AppService {
  id: number;
  phone_number: string;
  phone_number_id: string;
  whatsapp_business_account_id: string;
  created_at: string;
  access_token: string; // Required for Meta Graph API calls
  organizationId?: string;
  name?: string;
  status?: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  components: TemplateComponent[];
  parameters?: any[];
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: any;
  buttons?: any[];
}

interface WhatsAppApiResponse<T> {
  data: T;
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
  };
}


const META_API_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || 'v22.0';

export class WhatsAppService {
  /**
   * Fetch app services for an organization
   */
  static async fetchAppServices(organizationId: string): Promise<AppService[]> {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      // Use the local API route which handles the backend call
      const apiUrl = `/api/channels/whatsapp/org/${organizationId}`;
      
      console.log('Fetching app services from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch app services: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Handle both array response and object with appServices property
      const services = Array.isArray(data) ? data : (data.appServices || data || []);
      
      console.log('Fetched app services:', services);
      return services;
    } catch (error) {
      console.error('Error fetching app services:', error);
      throw error;
    }
  }



  /**
   * Fetch WhatsApp templates from Meta API
   */
  static async fetchTemplates(appService: AppService): Promise<WhatsAppTemplate[]> {
    try {
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch templates: ${errorData.error?.message || response.statusText}`);
      }

      const data: WhatsAppApiResponse<WhatsAppTemplate[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      throw error;
    }
  }

  /**
   * Create a new WhatsApp template
   */
  static async createTemplate(
    appService: AppService,
    templateData: any
  ): Promise<any> {
    try {
      // Ensure access token is provided
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create template: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating WhatsApp template:', error);
      throw error;
    }
  }

  /**
   * Update an existing WhatsApp template
   */
  static async updateTemplate(
    templateId: string,
    appService: AppService,
    templateData: any
  ): Promise<any> {
    try {
      // Ensure access token is provided
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${templateId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update template: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating WhatsApp template:', error);
      throw error;
    }
  }

  /**
   * Delete a WhatsApp template
   */
  static async deleteTemplate(
    appService: AppService,
    templateName: string
  ): Promise<any> {
    try {
      // Ensure access token is provided
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/message_templates?name=${templateName}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete template: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting WhatsApp template:', error);
      throw error;
    }
  }

  /**
   * Send a WhatsApp message using template
   */
  static async sendMessage(
    appService: AppService,
    messageData: any
  ): Promise<any> {
    try {
      // Ensure access token is provided
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send message: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send a template message
   */
  
  static async sendTemplateMessage(
    appService: AppService,
    to: string,
    templateName: string,
    languageCode: string,
    parameters?: any[]
  ): Promise<any> {
    const messageData = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: parameters && parameters.length > 0 ? [{
          type: "body",
          parameters: parameters
        }] : undefined
      }
    };

    return this.sendMessage(appService, messageData);
  }
}

export type { AppService, WhatsAppTemplate, WhatsAppApiResponse, TemplateComponent };
