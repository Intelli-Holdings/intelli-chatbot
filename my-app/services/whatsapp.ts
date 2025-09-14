interface AppService {
  id: number;
  phone_number: string;
  phone_number_id: string;
  whatsapp_business_account_id: string;
  created_at: string;
  access_token: string;
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
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
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

// Analytics interfaces
interface AnalyticsDataPoint {
  start: number;
  end: number;
  sent?: number;
  delivered?: number;
  conversation?: number;
  cost?: number;
  phone_number?: string;
  country?: string;
  conversation_type?: string;
  conversation_category?: string;
  conversation_direction?: string;
}

interface ConversationAnalyticsDataPoint {
  start: number;
  end: number;
  conversation: number;
  cost: number;
  phone_number?: string;
  country?: string;
  conversation_type?: 'REGULAR' | 'FREE_TIER' | 'FREE_ENTRY_POINT';
  conversation_category?: 'AUTHENTICATION' | 'MARKETING' | 'SERVICE' | 'UTILITY';
  conversation_direction?: 'BUSINESS_INITIATED' | 'USER_INITIATED' | 'UNKNOWN';
}

interface MessagingAnalyticsResponse {
  analytics: {
    phone_numbers: string[];
    country_codes: string[];
    granularity: string;
    data_points: AnalyticsDataPoint[];
  };
  id: string;
}

interface ConversationAnalyticsResponse {
  conversation_analytics: {
    data: Array<{
      data_points: ConversationAnalyticsDataPoint[];
    }>;
  };
  id: string;
}

interface PhoneNumberLimit {
  phone_number: string;
  name: string;
  country: string;
  business_initiated_conversations: number;
  limit: number;
  quality_rating?: string;
}

const META_API_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || 'v22.0';

// Language code mappings for WhatsApp templates
const LANGUAGE_CODES: Record<string, string[]> = {
  'en': ['en', 'en_US', 'en_GB'],
  'es': ['es', 'es_ES', 'es_MX', 'es_AR'],
  'pt': ['pt', 'pt_BR', 'pt_PT'],
  'fr': ['fr', 'fr_FR'],
  'de': ['de', 'de_DE'],
  'it': ['it', 'it_IT'],
  'ar': ['ar', 'ar_SA'],
  'hi': ['hi', 'hi_IN'],
  'zh': ['zh_CN', 'zh_TW', 'zh_HK'],
  'ja': ['ja', 'ja_JP'],
  'ko': ['ko', 'ko_KR'],
  'ru': ['ru', 'ru_RU']
};

export class WhatsAppService {
  /**
   * Validates that a media handle is properly formatted and not a placeholder
   */
  static validateMediaHandle(handle: string, mediaType: string): boolean {
    if (!handle || typeof handle !== 'string') {
      return false;
    }

    // Check for placeholder values
    if (handle === 'DYNAMIC_HANDLE_FROM_UPLOAD' || 
        handle.includes('...') || 
        handle.includes('sample') || 
        handle.includes('example')) {
      return false;
    }

    // Basic validation for Meta media handle format
    // Meta handles typically start with a number followed by a colon
    const handlePattern = /^\d+:[a-zA-Z0-9+/=]+$/;
    return handlePattern.test(handle);
  }

  /**
   * Get language variations to try for template sending
   */
  static getLanguageVariations(code: string): string[] {
    const variations: string[] = [code]; // Start with the original code
    
    // Add common variations
    if (code === 'en') {
      variations.push('en_US', 'en_GB');
    } else if (code === 'en_US') {
      variations.push('en', 'en_GB');
    } else if (code === 'en_GB') {
      variations.push('en', 'en_US');
    }
    
    // For other languages, add the base and common regional variants
    const baseCode = code.split('_')[0];
    if (baseCode !== code && !variations.includes(baseCode)) {
      variations.push(baseCode);
    }
    
    return variations;
  }

 
  static formatTemplateComponents(components: any[]): any[] {
    return components.map(component => {
      const formattedComponent: any = {
        type: component.type
      };

      // Handle HEADER component
      if (component.type === 'HEADER') {
        if (component.format) {
          formattedComponent.format = component.format;
        }
        
        if (component.format === 'TEXT' && component.text) {
          formattedComponent.text = component.text;
          
          // Add example if the text contains variables
          const variableMatches = component.text.match(/\{\{(\d+)\}\}/g);
          if (variableMatches) {
            formattedComponent.example = {
              header_text: variableMatches.map(() => '')
            };
          }
        } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)) {
          // For media headers, use the provided media handle from template data
          if (component.example?.header_handle?.[0]) {
            const mediaHandle = component.example.header_handle[0];
            
            // Validate that the handle is not a placeholder and has proper format
            if (!this.validateMediaHandle(mediaHandle, component.format)) {
              throw new Error(`Media header component (${component.format}) requires a valid media handle from upload API. Please upload media first.`);
            }
            
            formattedComponent.example = {
              header_handle: [mediaHandle] // Dynamic handle from upload API response
            };
          } else {
            // This should not happen in normal flow - media headers without handles
            // should trigger the customization dialog where users upload media
            throw new Error(`Media header component (${component.format}) requires a media handle. Please upload media first.`);
          }
        }
      }

      // Handle BODY component
      if (component.type === 'BODY' && component.text) {
        formattedComponent.text = component.text;
        
        // Extract variables and create proper example structure
        const variableMatches = component.text.match(/\{\{(\d+)\}\}/g);
        if (variableMatches && variableMatches.length > 0) {
          const exampleValues = variableMatches.map((_: any, index: number) => `value${index + 1}`);
          formattedComponent.example = {
            body_text: exampleValues  // Fixed: Use flat array, not nested [exampleValues]
          };
        }
      }

      // Handle FOOTER component
      if (component.type === 'FOOTER' && component.text) {
        formattedComponent.text = component.text;
      }

      // Handle BUTTONS component
      if (component.type === 'BUTTONS' && component.buttons) {
        formattedComponent.buttons = component.buttons.map((button: any) => {
          const formattedButton: any = {
            type: button.type,
            text: button.text
          };

          if (button.type === 'PHONE_NUMBER' && button.phone_number) {
            formattedButton.phone_number = button.phone_number;
          }

          if (button.type === 'URL') {
            if (button.url) {
              formattedButton.url = button.url;
              
              // Check for dynamic URL parameters
              const urlVariables = button.url.match(/\{\{(\d+)\}\}/g);
              if (urlVariables) {
                formattedButton.example = urlVariables.map(() => 'parameter');
              }
            }
          }

          if (button.type === 'QUICK_REPLY') {
            // Quick reply buttons don't need additional properties
          }

          // Handle OTP buttons for authentication templates
          if (button.type === 'OTP') {
            formattedButton.otp_type = button.otp_type || 'COPY_CODE';
            if (button.otp_type === 'ONE_TAP') {
              formattedButton.autofill_text = button.autofill_text || 'Autofill';
              formattedButton.package_name = button.package_name || 'com.example.app';
              formattedButton.signature_hash = button.signature_hash || 'K8a/AINcGX7';
            }
          }

          return formattedButton;
        });
      }

      return formattedComponent;
    });
  }

  /**
   * Fetch app services for an organization
   */
  static async fetchAppServices(organizationId: string): Promise<AppService[]> {
    try {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const apiUrl = `/api/channels/whatsapp/org/${organizationId}`;
      
   

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
      const services = Array.isArray(data) ? data : (data.appServices || data || []);
    
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
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/message_templates?limit=100`,
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
   * Create a new WhatsApp template with proper formatting
   */
  static async createTemplate(
    appService: AppService,
    templateData: any
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      // Format the template data properly
      const formattedData = {
        name: templateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        language: templateData.language || 'en_US',
        category: templateData.category || 'UTILITY',
        components: this.formatTemplateComponents(templateData.components || [])
      };

      console.log('Creating template with formatted data:', JSON.stringify(formattedData, null, 2));
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        }
      );

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Template creation failed:', responseData);
        const errorMessage = responseData.error?.message || 
                           responseData.error?.error_user_msg || 
                           'Failed to create template';
        throw new Error(errorMessage);
      }

      return responseData;
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
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const formattedData = {
        category: templateData.category,
        components: this.formatTemplateComponents(templateData.components || [])
      };
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${templateId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
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
   * Send a WhatsApp message using template with dynamic language support
   */
  static async sendMessage(
    appService: AppService,
    messageData: any
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      // Ensure language code is provided - use exact match with template
      if (!messageData.template?.language?.code) {
        // Default to en_US if no language code is provided
        messageData.template.language = { code: 'en_US' };
      }

      console.log('Sending message with template:', messageData.template.name, 'language:', messageData.template.language.code);
      console.log('Sending message:', JSON.stringify(messageData, null, 2));

      // Try sending with the original language code first
      let lastError: any;
      const languageVariations = this.getLanguageVariations(messageData.template.language.code);
      
      for (const languageCode of languageVariations) {
        try {
          // Update the language code for this attempt
          const attemptData = {
            ...messageData,
            template: {
              ...messageData.template,
              language: { code: languageCode }
            }
          };

          console.log(`Attempting to send with language code: ${languageCode}`);
          
          const response = await fetch(
            `https://graph.facebook.com/${META_API_VERSION}/${appService.phone_number_id}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${appService.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(attemptData),
            }
          );

          const responseData = await response.json();
          
          if (response.ok) {
            console.log(`Successfully sent with language code: ${languageCode}`);
            return responseData;
          } else {
            lastError = responseData;
            // If it's not a language/translation error, don't try other variations
            if (!responseData.error?.message?.includes('translation') && 
                !responseData.error?.message?.includes('Template name does not exist')) {
              break;
            }
            console.log(`Failed with language code ${languageCode}:`, responseData.error?.message);
          }
        } catch (error) {
          lastError = error;
          console.log(`Network error with language code ${languageCode}:`, error);
        }
      }

      // If we get here, all attempts failed
      console.error('All language variations failed. Last error:', lastError);
      if (lastError?.error?.message) {
        throw new Error(`Failed to send message: ${lastError.error.message}`);
      } else {
        throw new Error(`Failed to send message: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send a template message with proper parameter formatting
   */
  static async sendTemplateMessage(
    appService: AppService,
    to: string,
    templateName: string,
    languageCode: string,
    parameters?: any[]
  ): Promise<any> {
    const messageData: any = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode // Use the language code as provided
        }
      }
    };

    // Format parameters properly
    if (parameters && parameters.length > 0) {
      messageData.template.components = [{
        type: "body",
        parameters: parameters.map(param => ({
          type: "text",
          text: String(param)
        }))
      }];
    }

    return this.sendMessage(appService, messageData);
  }

  /**
   * Get messaging analytics for a WABA
   */
  static async getMessagingAnalytics(
    appService: AppService,
    startTimestamp: number,
    endTimestamp: number,
    granularity: 'HALF_HOUR' | 'DAY' | 'MONTH' = 'DAY'
  ): Promise<MessagingAnalyticsResponse> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}?fields=analytics.start(${startTimestamp}).end(${endTimestamp}).granularity(${granularity})`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch messaging analytics: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messaging analytics:', error);
      throw error;
    }
  }

  /**
   * Get conversation analytics for a WABA
   */
  static async getConversationAnalytics(
    appService: AppService,
    startTimestamp: number,
    endTimestamp: number,
    granularity: 'HALF_HOUR' | 'DAILY' | 'MONTHLY' = 'DAILY',
    metricTypes: string[] = ['COST', 'CONVERSATION'],
    dimensions: string[] = ['CONVERSATION_CATEGORY', 'CONVERSATION_TYPE', 'CONVERSATION_DIRECTION', 'PHONE']
  ): Promise<ConversationAnalyticsResponse> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const fieldsParam = `conversation_analytics.start(${startTimestamp}).end(${endTimestamp}).granularity(${granularity}).metric_types([${metricTypes.map(t => `"${t}"`).join(',')}]).dimensions([${dimensions.map(d => `"${d}"`).join(',')}])`;
      
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}?fields=${encodeURIComponent(fieldsParam)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch conversation analytics: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conversation analytics:', error);
      throw error;
    }
  }

  /**
   * Get phone number information and limits
   */
  static async getPhoneNumberLimits(
    appService: AppService
  ): Promise<PhoneNumberLimit[]> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/phone_numbers?fields=id,display_phone_number,verified_name,code_verification_status,name_status,quality_rating,country_code,phone_number`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch phone numbers: ${errorData.error?.message || response.statusText}`);
      }

      const phoneNumbersData = await response.json();
      
      return phoneNumbersData.data?.map((phone: any) => ({
        phone_number: phone.display_phone_number || phone.phone_number,
        name: phone.verified_name || 'Unknown',
        country: phone.country_code || this.getCountryFromPhoneNumber(phone.display_phone_number || phone.phone_number),
        business_initiated_conversations: 0,
        limit: 250
      })) || [];
    } catch (error) {
      console.error('Error fetching phone number limits:', error);
      throw error;
    }
  }

  /**
   * Helper function to extract country from phone number
   */
  private static getCountryFromPhoneNumber(phoneNumber: string): string {
    const countryCodeMap: { [key: string]: string } = {
      '+1': 'US',
      '+44': 'GB',
      '+33': 'FR',
      '+49': 'DE',
      '+39': 'IT',
      '+34': 'ES',
      '+221': 'SN',
      '+91': 'IN',
      '+55': 'BR',
      '+86': 'CN',
      '+81': 'JP',
      '+82': 'KR',
      '+61': 'AU',
      '+27': 'ZA',
      '+234': 'NG',
      '+254': 'KE',
      '+256': 'UG',
      '+20': 'EG',
    };

    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;

    for (const [code, country] of Object.entries(countryCodeMap)) {
      if (formattedNumber.startsWith(code)) {
        return country;
      }
    }
    
    return 'Unknown';
  }

  /**
   * Get detailed WABA information including account status
   */
  static async getWABAInfo(appService: AppService): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}?fields=id,name,account_review_status,business_verification_status,country,currency,message_template_namespace,timezone_id`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch WABA info: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching WABA info:', error);
      throw error;
    }
  }
}

export type { 
  AppService, 
  WhatsAppTemplate, 
  WhatsAppApiResponse, 
  TemplateComponent,
  AnalyticsDataPoint,
  ConversationAnalyticsDataPoint,
  MessagingAnalyticsResponse,
  ConversationAnalyticsResponse,
  PhoneNumberLimit
};