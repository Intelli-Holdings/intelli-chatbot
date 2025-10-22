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
  last_updated?: string;
  quality_score?: {
    score: string;
    date: number;
  };
  rejected_reason?: string;
  created_at?: string;
  message_send_ttl_seconds?: number;
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS' | 'CAROUSEL';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
  text?: string;
  example?: any;
  buttons?: any[];
  cards?: any[];
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
     quality_rating?: string;
     limit: number;
     business_initiated_conversations?: number;
     country?: string;
   }

const META_API_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || 'v23.0';

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

    // More flexible validation for different handle formats
    if (handle.length < 5) {
      return false;
    }

    const handlePattern = /^[a-zA-Z0-9:_\-+/=]+$/;
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

  /**
   * Format template components for Meta API
   * CRITICAL: This method must preserve the exact format from template-creator.ts
   * DO NOT modify examples, button types, or array structures
   */
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

        // Handle LOCATION header - no example or parameters needed at creation time
        if (component.format === 'LOCATION') {
          // Location headers are created with just type and format
          // The actual location data is provided when sending the message
          return formattedComponent;
        }

        if (component.format === 'TEXT' && component.text) {
          formattedComponent.text = component.text;

          // CRITICAL: Preserve existing example if provided
          if (component.example?.header_text) {
            formattedComponent.example = {
              header_text: component.example.header_text
            };
          }
        } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)) {
          // For media headers, use the provided media handle from upload API response
          if (component.example?.header_handle?.[0]) {
            const mediaHandle = component.example.header_handle[0];

            formattedComponent.example = {
              header_handle: [mediaHandle]
            };
          } else {
            throw new Error(`Media header component (${component.format}) requires a media handle. Please upload media first.`);
          }
        }
      }

      // Handle BODY component
      if (component.type === 'BODY') {
        // CRITICAL: text field is REQUIRED by Meta API for non-authentication templates
        // Authentication templates don't need text field (they use preset templates)
        if (component.add_security_recommendation !== undefined) {
          // Authentication template - don't include text field
          formattedComponent.add_security_recommendation = component.add_security_recommendation;
        } else {
          // Non-authentication template - MUST have text field
          if (component.text !== undefined && component.text !== null && component.text !== '') {
            formattedComponent.text = component.text;
          } else {
            throw new Error('BODY component requires a text field for non-authentication templates');
          }
        }

        // Handle example for body text variables
        if (component.example?.body_text) {
          const bodyText = component.example.body_text;

          // Ensure body_text is in nested array format [[...]] and NOT EMPTY
          if (Array.isArray(bodyText) && bodyText.length > 0) {
            // Check if it's nested and has content
            if (Array.isArray(bodyText[0])) {
              // Only add if inner array has content
              if (bodyText[0].length > 0) {
                formattedComponent.example = {
                  body_text: bodyText
                };
              }
            } else {
              // Flat array with content
              if (bodyText.length > 0) {
                formattedComponent.example = {
                  body_text: [bodyText]
                };
              }
            }
          }
        } else if (component.text && /\{\{\d+\}\}/.test(component.text)) {
          // Only add example if template has variables
          const varCount = (component.text.match(/\{\{\d+\}\}/g) || []).length;
          formattedComponent.example = {
            body_text: [Array(varCount).fill('Sample text')]
          };
        }
        // If no variables and no example provided, don't include example field at all
      }

      // Handle FOOTER component
      if (component.type === 'FOOTER') {
        // For authentication templates, code_expiration_minutes
        if (component.code_expiration_minutes !== undefined) {
          formattedComponent.code_expiration_minutes = component.code_expiration_minutes;
        }
        
        // For regular templates, text
        if (component.text) {
          formattedComponent.text = component.text;
        }
      }

      // Handle CAROUSEL component
      if (component.type === 'CAROUSEL' && component.cards) {
        formattedComponent.cards = component.cards.map((card: any) => {
          const formattedCard: any = {
            components: []
          };

          // Process each component in the card
          if (card.components && Array.isArray(card.components)) {
            formattedCard.components = card.components.map((cardComponent: any) => {
              const formattedCardComponent: any = {
                type: cardComponent.type
              };

              // Handle HEADER component in card
              if (cardComponent.type === 'HEADER' || cardComponent.type === 'header') {
                formattedCardComponent.type = 'header';

                if (cardComponent.format) {
                  formattedCardComponent.format = cardComponent.format.toLowerCase();
                }

                // For product cards
                if (cardComponent.format === 'product' || cardComponent.format === 'PRODUCT') {
                  formattedCardComponent.format = 'product';
                }
                // For media cards (image/video)
                else if (['image', 'IMAGE', 'video', 'VIDEO'].includes(cardComponent.format)) {
                  formattedCardComponent.format = cardComponent.format.toLowerCase();

                  // Include media handle example
                  if (cardComponent.example?.header_handle) {
                    formattedCardComponent.example = {
                      header_handle: cardComponent.example.header_handle
                    };
                  }
                }
              }

              // Handle BODY component in card (optional for carousel cards)
              if (cardComponent.type === 'BODY' || cardComponent.type === 'body') {
                formattedCardComponent.type = 'body';

                if (cardComponent.text) {
                  formattedCardComponent.text = cardComponent.text;
                }

                if (cardComponent.example?.body_text) {
                  formattedCardComponent.example = {
                    body_text: cardComponent.example.body_text
                  };
                }
              }

              // Handle BUTTONS component in card
              if (cardComponent.type === 'BUTTONS' || cardComponent.type === 'buttons') {
                formattedCardComponent.type = 'buttons';

                if (cardComponent.buttons && Array.isArray(cardComponent.buttons)) {
                  formattedCardComponent.buttons = cardComponent.buttons.map((btn: any) => {
                    const buttonType = btn.type.toString().toLowerCase();
                    const formattedButton: any = {
                      type: buttonType,
                      text: btn.text
                    };

                    // Handle SPM (Single Product Message) button - for product cards
                    if (buttonType === 'spm') {
                      formattedButton.type = 'spm';
                    }
                    // Handle quick_reply buttons
                    else if (buttonType === 'quick_reply') {
                      formattedButton.type = 'quick_reply';
                    }
                    // Handle URL buttons with variable support
                    else if (buttonType === 'url') {
                      formattedButton.type = 'url';
                      if (btn.url) {
                        formattedButton.url = btn.url;
                      }
                      if (btn.example && Array.isArray(btn.example)) {
                        formattedButton.example = btn.example;
                      }
                    }
                    // Handle phone_number buttons
                    else if (buttonType === 'phone_number') {
                      formattedButton.type = 'phone_number';
                      if (btn.phone_number) {
                        formattedButton.phone_number = btn.phone_number;
                      }
                    }

                    return formattedButton;
                  });
                }
              }

              return formattedCardComponent;
            });
          }

          return formattedCard;
        });
      }

      // Handle BUTTONS component
      // CRITICAL: Button types MUST remain uppercase for Meta API
      if (component.type === 'BUTTONS' && component.buttons) {
        formattedComponent.buttons = component.buttons.map((button: any) => {
          // CRITICAL FIX: Keep button types in UPPERCASE (Meta API accepts both, but we standardize on uppercase)
          // Normalize the type to uppercase for consistency
          const buttonType = button.type.toString().toUpperCase();

          const formattedButton: any = {
            type: buttonType,
            text: button.text
          };

          // Handle FLOW buttons - CRITICAL: Preserve all fields
          if (buttonType === 'FLOW') {
            // MUST preserve these fields for Flow buttons
            if (button.flow_id) {
              formattedButton.flow_id = button.flow_id;
            }
            if (button.flow_action) {
              formattedButton.flow_action = button.flow_action;
            }
            if (button.navigate_screen) {
              formattedButton.navigate_screen = button.navigate_screen;
            }
            return formattedButton;
          }

          // Handle PHONE_NUMBER buttons
          if (buttonType === 'PHONE_NUMBER') {
            if (button.phone_number) {
              formattedButton.phone_number = button.phone_number;
            }
          }

          // Handle URL buttons
          if (buttonType === 'URL') {
            if (button.url) {
              formattedButton.url = button.url;

              // CRITICAL: Preserve existing example if provided
              if (button.example && Array.isArray(button.example)) {
                formattedButton.example = button.example;
              }
            }
          }

          // Handle QUICK_REPLY buttons
          if (buttonType === 'QUICK_REPLY') {
            // Quick reply buttons only need type and text
          }

          // Handle OTP buttons for authentication templates
          if (buttonType === 'OTP' || buttonType === 'COPY_CODE') {
            formattedButton.type = 'OTP'; // CRITICAL FIX: Keep as OTP, not COPY_CODE

            if (button.otp_type) {
              formattedButton.otp_type = button.otp_type;
            }

            // For ONE_TAP buttons, include additional fields
            if (button.otp_type === 'ONE_TAP') {
              if (button.autofill_text) {
                formattedButton.autofill_text = button.autofill_text;
              }
              if (button.package_name) {
                formattedButton.package_name = button.package_name;
              }
              if (button.signature_hash) {
                formattedButton.signature_hash = button.signature_hash;
              }
            }

            return formattedButton;
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
   * CRITICAL: This method must NOT modify the template structure
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
        const errorMessage = responseData.error?.message ||
          responseData.error?.error_user_msg ||
          'Failed to create template';
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
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
        messageData.template.language = { code: 'en_US' };
      }

      let lastError: any;
      const languageVariations = this.getLanguageVariations(messageData.template.language.code);

      for (const languageCode of languageVariations) {
        try {
          const attemptData = {
            ...messageData,
            template: {
              ...messageData.template,
              language: { code: languageCode }
            }
          };

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
            return responseData;
          } else {
            lastError = responseData;
            if (!responseData.error?.message?.includes('translation') &&
              !responseData.error?.message?.includes('Template name does not exist')) {
              break;
            }
          }
        } catch (error) {
          lastError = error;
        }
      }

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
          code: languageCode
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
   * Fetch phone numbers from Meta Graph API with comprehensive details
   * Uses the dedicated phone_numbers endpoint with extensive field list
   */
  static async fetchPhoneNumbers(appService: AppService): Promise<any[]> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.whatsapp_business_account_id) {
        throw new Error('WhatsApp Business Account ID is required');
      }

      // Comprehensive field list for phone numbers
      const fields = [
        'id',
        'display_phone_number',
        'phone_number',
        'verified_name',
        'display_name',
        'name',
        'quality_rating',
        'quality_score',
        'messaging_limit_tier',
        'tier',
        'current_limit',
        'max_daily_conversation_per_phone',
        'code_verification_status',
        'verification_status',
        'name_status',
        'new_name_status',
        'certificate',
        'account_mode',
        'is_official_business_account',
        'certificate_status',
        'platform_type',
        'throughput',
        'webhook_configuration',
      ].join(',');

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/phone_numbers?fields=${fields}`,
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

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
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

  /**
   * Fetch template details including media handles
   */
  static async fetchTemplateDetails(
    appService: AppService,
    templateId: string
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const url = `https://graph.facebook.com/${META_API_VERSION}/${templateId}`;
      const params = new URLSearchParams({
        fields: 'id,name,components,language,status',
        access_token: appService.access_token
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch template details: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching template details:', error);
      throw error;
    }
  }

  /**
   * Extract media handle from template components
   * Returns the media handle/URL or null if not found
   */
  static extractMediaHandle(template: any): string | null {
    const headerComponent = template.components?.find(
      (c: any) => c.type === "HEADER" &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(c.format?.toUpperCase())
    );

    const handle = headerComponent?.example?.header_handle?.[0];

    if (!handle) {
      return null;
    }

    // Return the handle regardless of whether it's a URL or ID
    // The buildMediaParameter function will determine how to use it
    return handle;
  }

  /**
   * Check if a string is a URL
   */
  static isUrl(str: string): boolean {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Upload media using the API endpoint
   */
  static async uploadMediaToMeta(
    file: File,
    accessToken: string
  ): Promise<{ handle: string; fileType: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', accessToken);

      const response = await fetch('/api/whatsapp/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload media');
      }

      const data = await response.json();
      return {
        handle: data.handle,
        fileType: data.fileType
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }

  /**
   * Check if template has media header
   */
  static hasMediaHeader(template: WhatsAppTemplate): boolean {
    return template.components?.some(
      (c) => c.type === "HEADER" &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(c.format?.toUpperCase() || '')
    ) || false;
  }

  /**
   * Check if template is a carousel template
   */
  static isCarouselTemplate(template: WhatsAppTemplate): boolean {
    return template.components?.some((c) => c.type === "CAROUSEL") || false;
  }

  /**
   * Get carousel type (media or product)
   */
  static getCarouselType(template: WhatsAppTemplate): 'media' | 'product' | null {
    const carouselComponent = template.components?.find((c) => c.type === "CAROUSEL");
    if (!carouselComponent?.cards || carouselComponent.cards.length === 0) return null;

    const firstCard = carouselComponent.cards[0];
    const headerComponent = firstCard?.components?.find((c: any) => c.type === "HEADER" || c.type === "header");

    if (headerComponent?.format === 'product' || headerComponent?.format === 'PRODUCT') {
      return 'product';
    } else if (['image', 'IMAGE', 'video', 'VIDEO'].includes(headerComponent?.format)) {
      return 'media';
    }

    return null;
  }

  /**
   * Get media type from template
   */
  static getMediaType(template: WhatsAppTemplate): string {
    const header = template.components?.find((c) => c.type === "HEADER");
    return header?.format?.toUpperCase() || "";
  }

  /**
   * Build media parameter object for sending messages
   * Automatically detects if the handle is a URL or ID and formats accordingly
   */
  static buildMediaParameter(mediaType: string, mediaHandle: string): any {
    const type = mediaType.toLowerCase();
    const parameter: any = { type };

    // Check if the handle is a URL or a media ID
    if (this.isUrl(mediaHandle)) {
      // Use 'link' for URLs (from template media)
      parameter[type] = { link: mediaHandle };
    } else {
      // Use 'id' for media IDs (from uploaded media)
      parameter[type] = { id: mediaHandle };
    }

    return parameter;
  }

  /**
   * Check message status by message ID
   * This helps debug why messages aren't being delivered
   */
  static async getMessageStatus(
    appService: AppService,
    messageId: string
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${messageId}`,
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
        throw new Error(`Failed to fetch message status: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching message status:', error);
      throw error;
    }
  }

  /**
   * Get quality rating and messaging limits for debugging delivery issues
   */
  static async getPhoneNumberQuality(
    appService: AppService
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.phone_number_id}?fields=quality_rating,messaging_limit_tier,is_official_business_account,account_mode,name_status,code_verification_status`,
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
        throw new Error(`Failed to fetch phone number quality: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching phone number quality:', error);
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
