interface AppService {
  id: string;
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  organizationId: string;
  name: string;
  status: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  components: any[];
  parameters?: any[];
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


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const META_API_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || 'v22.0';

export class WhatsAppService {
  /**
   * Fetch app services for an organization
   */
  static async fetchAppServices(organizationId: string): Promise<AppService[]> {
    try {
      const response = await fetch(`${BASE_URL}/appservice/org/${organizationId}/appservices/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch app services: ${response.statusText}`);
      }

      const data = await response.json();
      return data.appServices || data || [];
    } catch (error) {
      console.error('Error fetching app services:', error);
      throw error;
    }
  }

  /**
   * Fetch WhatsApp templates from Meta API
   */
  static async fetchTemplates(wabaId: string, accessToken: string): Promise<WhatsAppTemplate[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
    wabaId: string, 
    accessToken: string, 
    templateData: any
  ): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
    accessToken: string,
    templateData: any
  ): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${templateId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
    wabaId: string,
    templateName: string,
    accessToken: string
  ): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/message_templates?name=${templateName}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
    phoneNumberId: string,
    accessToken: string,
    messageData: any
  ): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
}

export type { AppService, WhatsAppTemplate, WhatsAppApiResponse };
