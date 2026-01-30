interface AppService {
  id: number;
  phone_number: string;
  phone_number_id: string;
  whatsapp_business_account_id: string;
  created_at: string;
  access_token: string;
  organization_id?: string;
  organizationId?: string;
  name?: string;
  status?: string;
  is_default?: boolean;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  components: TemplateComponent[];
  template_structure?: TemplateComponent[] | Record<string, any>;
  whatsapp_template_id?: string;
  is_active?: boolean;
  parameters?: any[];
  last_updated?: string;
  quality_score?: {
    score: string;
    date: number;
  };
  rejected_reason?: string;
  created_at?: string;
  updated_at?: string;
  message_send_ttl_seconds?: number;
}

interface TemplatesCacheEntry {
  timestamp: number;
  templates: WhatsAppTemplate[];
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

// WhatsApp Flow interfaces
interface WhatsAppFlow {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
  categories: string[];
  validation_errors?: any[];
  created_time?: string;
  updated_time?: string;
  json_version?: string;
  data_api_version?: string;
}

interface FlowScreen {
  id: string;
  title: string;
  terminal?: boolean;
  success?: boolean;
  data?: any;
}

interface FlowDetails extends WhatsAppFlow {
  screens?: FlowScreen[];
  preview?: any;
}

interface FlowMessagePayload {
  flow_id: string;
  flow_token?: string;
  flow_action?: 'navigate' | 'data_exchange';
  flow_action_payload?: {
    screen?: string;
    data?: Record<string, any>;
  };
}

const META_API_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || 'v23.0';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

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

const TEMPLATES_CACHE_PREFIX = 'whatsapp_templates_cache';
const TEMPLATES_CACHE_VERSION = 'v1';
const TEMPLATES_CACHE_MAX_AGE_MS = 5 * 60 * 1000;

export class WhatsAppService {
  /**
   * Extract detailed error message from Meta API response
   * Includes error_data.details, error_user_msg, and error_user_title if available
   */
  static extractErrorMessage(error: any): { message: string; details?: string } {
    if (!error) {
      return { message: 'Unknown error occurred' };
    }

    let message = 'An error occurred';
    let details: string | undefined;

    // Handle Meta API error response structure
    if (error.error) {
      // Try to get the most user-friendly message first
      message = error.error.error_user_title ||
                error.error.error_user_msg ||
                error.error.message ||
                message;

      // Extract additional details from multiple possible sources
      if (error.error.error_data?.details) {
        details = error.error.error_data.details;
      }
      // If no error_data.details, try error_user_msg as details (if not already used as message)
      else if (error.error.error_user_msg && error.error.error_user_title) {
        details = error.error.error_user_msg;
        message = error.error.error_user_title;
      }
      // Fallback to error_user_msg if available
      else if (error.error.error_user_msg) {
        details = error.error.error_user_msg;
      }
    }
    // Handle Error object
    else if (error instanceof Error) {
      message = error.message;
    }
    // Handle string error
    else if (typeof error === 'string') {
      message = error;
    }

    return { message, details };
  }

  static getTemplatesStorage(): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  static getTemplatesCacheKey(organizationId: string, appService: AppService): string {
    const serviceKey = String(
      appService.id ??
      appService.whatsapp_business_account_id ??
      appService.phone_number_id ??
      appService.phone_number ??
      'unknown'
    );

    return `${TEMPLATES_CACHE_PREFIX}:${TEMPLATES_CACHE_VERSION}:${organizationId}:${serviceKey}`;
  }

  static readTemplatesCache(
    organizationId: string,
    appService: AppService
  ): TemplatesCacheEntry | null {
    const storage = this.getTemplatesStorage();
    if (!storage) {
      return null;
    }

    const cacheKey = this.getTemplatesCacheKey(organizationId, appService);

    try {
      const raw = storage.getItem(cacheKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as TemplatesCacheEntry;
      if (!parsed || !Array.isArray(parsed.templates) || typeof parsed.timestamp !== 'number') {
        storage.removeItem(cacheKey);
        return null;
      }

      return parsed;
    } catch (error) {
      storage.removeItem(cacheKey);
      return null;
    }
  }

  static writeTemplatesCache(
    organizationId: string,
    appService: AppService,
    templates: WhatsAppTemplate[]
  ): void {
    const storage = this.getTemplatesStorage();
    if (!storage) {
      return;
    }

    const cacheKey = this.getTemplatesCacheKey(organizationId, appService);
    const payload: TemplatesCacheEntry = {
      timestamp: Date.now(),
      templates,
    };

    try {
      storage.setItem(cacheKey, JSON.stringify(payload));
    } catch (error) {
      // Failed to cache templates in storage
    }
  }

  static clearTemplatesCache(organizationId: string, appService: AppService): void {
    const storage = this.getTemplatesStorage();
    if (!storage) {
      return;
    }

    const cacheKey = this.getTemplatesCacheKey(organizationId, appService);

    try {
      storage.removeItem(cacheKey);
    } catch (error) {
      // Failed to clear cached templates
    }
  }

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
   * Fetch WhatsApp templates from backend (synced with Meta)
   */
  static async fetchTemplates(
    appService: AppService,
    options: {
      organizationId?: string;
      sync?: boolean;
      cacheMaxAgeMs?: number;
      bypassCache?: boolean;
    } = {}
  ): Promise<WhatsAppTemplate[]> {
    const organizationId =
      options.organizationId || appService.organization_id || appService.organizationId;

    if (!organizationId) {
      throw new Error('Organization ID is required to fetch templates');
    }

    const cacheMaxAgeMs = options.cacheMaxAgeMs ?? TEMPLATES_CACHE_MAX_AGE_MS;
    const shouldUseCache = !options.sync && !options.bypassCache;
    const cacheEntry = shouldUseCache ? this.readTemplatesCache(organizationId, appService) : null;

    if (
      shouldUseCache &&
      cacheEntry &&
      Date.now() - cacheEntry.timestamp <= cacheMaxAgeMs
    ) {
      return cacheEntry.templates;
    }

    try {
      const params = new URLSearchParams({
        organizationId,
      });

      if (options.sync) {
        params.set('sync', 'true');
      }

      if (appService.id) {
        params.set('appserviceId', String(appService.id));
      }

      if (appService.phone_number) {
        params.set('appservicePhoneNumber', appService.phone_number);
      }

      const response = await fetch(`/api/whatsapp/templates?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error ||
          errorData.detail ||
          errorData.message ||
          'Failed to fetch templates';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const templates = Array.isArray(data)
        ? data
        : data.results || data.data || data.templates || [];

      const normalizeComponents = (structure: any): TemplateComponent[] => {
        if (Array.isArray(structure)) {
          return structure;
        }

        if (structure && typeof structure === 'object') {
          if (Array.isArray(structure.components)) {
            return structure.components;
          }

          const normalized: TemplateComponent[] = [];
          if (structure.header) {
            normalized.push({ type: 'HEADER', ...(structure.header as any) });
          }
          if (structure.body) {
            normalized.push({ type: 'BODY', ...(structure.body as any) });
          }
          if (structure.footer) {
            normalized.push({ type: 'FOOTER', ...(structure.footer as any) });
          }
          if (Array.isArray(structure.buttons)) {
            normalized.push({ type: 'BUTTONS', buttons: structure.buttons });
          }
          return normalized;
        }

        return [];
      };

      const normalizedTemplates = templates.map((template: any) => {
        const components =
          template.components ||
          template.template_structure ||
          template.templateStructure ||
          [];

        return {
          ...template,
          components: normalizeComponents(components),
        } as WhatsAppTemplate;
      });

      this.writeTemplatesCache(organizationId, appService, normalizedTemplates);
      return normalizedTemplates;
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      if (shouldUseCache && cacheEntry) {
        return cacheEntry.templates;
      }
      throw error;
    }
  }

  /**
   * Create a new WhatsApp template with proper formatting
   * CRITICAL: This method must NOT modify the template structure
   */
  static async createTemplate(
    appService: AppService,
    templateData: any,
    options: { organizationId?: string } = {}
  ): Promise<any> {
    try {
      const organizationId =
        options.organizationId || appService.organization_id || appService.organizationId;

      if (!organizationId) {
        throw new Error('Organization ID is required to create templates');
      }

      const response = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          templateData,
          appserviceId: appService.id,
          appservicePhoneNumber: appService.phone_number,
          description: templateData?.description,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.error ||
          responseData.detail ||
          responseData.message ||
          'Failed to create template';
        throw new Error(errorMessage);
      }

      this.clearTemplatesCache(organizationId, appService);
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
    templateData: any,
    options: { organizationId?: string } = {}
  ): Promise<any> {
    try {
      const organizationId =
        options.organizationId || appService.organization_id || appService.organizationId;

      if (!organizationId) {
        throw new Error('Organization ID is required to update templates');
      }

      const response = await fetch('/api/whatsapp/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          templateId,
          templateData,
          appserviceId: appService.id,
          appservicePhoneNumber: appService.phone_number,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.error ||
          responseData.detail ||
          responseData.message ||
          'Failed to update template';
        throw new Error(errorMessage);
      }

      this.clearTemplatesCache(organizationId, appService);
      return responseData;
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
    templateId: string,
    options: { organizationId?: string } = {}
  ): Promise<any> {
    try {
      const organizationId =
        options.organizationId || appService.organization_id || appService.organizationId;

      if (!organizationId) {
        throw new Error('Organization ID is required to delete templates');
      }

      const response = await fetch('/api/whatsapp/templates', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          templateId,
          appserviceId: appService.id,
          appservicePhoneNumber: appService.phone_number,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage =
          responseData.error ||
          responseData.detail ||
          responseData.message ||
          'Failed to delete template';
        throw new Error(errorMessage);
      }

      this.clearTemplatesCache(organizationId, appService);
      return responseData;
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
   * Upload media using the backend API endpoint
   */
  static async uploadMediaToMeta(
    file: File,
    appServicePhone: string
  ): Promise<{ handle: string; fileType: string }> {
    try {
      const formData = new FormData();
      formData.append('media_file', file);
      formData.append('appservice_phone_number', appServicePhone);
      formData.append('upload_type', 'resumable');

      const response = await fetch('/api/whatsapp/templates/upload_media', {
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
        fileType: data.fileType || data.file_type
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

  // ============================================================================
  // WHATSAPP FLOWS METHODS
  // ============================================================================

  /**
   * Fetch all WhatsApp Flows for a business account
   */
  static async fetchFlows(appService: AppService): Promise<WhatsAppFlow[]> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.whatsapp_business_account_id) {
        throw new Error('WhatsApp Business Account ID is required');
      }

      // Note: created_time and updated_time are not available fields for WhatsAppFlow
      // Only use supported fields: id, name, status, categories, validation_errors
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/flows?fields=id,name,status,categories,validation_errors`,
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
        throw new Error(`Failed to fetch flows: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching WhatsApp Flows:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed information about a specific Flow including screens
   */
  static async fetchFlowDetails(
    appService: AppService,
    flowId: string
  ): Promise<FlowDetails> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      // Fetch flow with preview to get screens
      // Note: created_time and updated_time are not available on WhatsAppFlow node
      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${flowId}?fields=id,name,status,categories,validation_errors,preview.invalidate(false)`,
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
        throw new Error(`Failed to fetch flow details: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // Parse screens from preview
      let screens: FlowScreen[] = [];
      if (data.preview?.preview) {
        try {
          const previewData = JSON.parse(data.preview.preview);

          // The preview structure is: { version, screens: [...] }
          if (previewData.screens && Array.isArray(previewData.screens)) {
            screens = previewData.screens.map((screen: any) => ({
              id: screen.id,
              title: screen.title || screen.id,
              terminal: screen.terminal || false,
              success: screen.success,
              data: screen.data
            }));
          }
        } catch (e) {
          console.error('Error parsing flow preview:', e);
          console.error('Preview data:', data.preview?.preview);
        }
      }

      // If no screens found from preview, try fetching from assets endpoint
      if (screens.length === 0) {
        console.warn('No preview data found, trying assets endpoint for flow:', flowId);

        try {
          const flowJSON = await this.getFlowJSON(appService, flowId);
          if (flowJSON?.screens && Array.isArray(flowJSON.screens)) {
            screens = flowJSON.screens.map((screen: any) => ({
              id: screen.id,
              title: screen.title || screen.id,
              terminal: screen.terminal || false,
              success: screen.success,
              data: screen.data
            }));
            console.log(`Found ${screens.length} screens from assets endpoint`);
          }
        } catch (assetError) {
          console.error('Error fetching from assets endpoint:', assetError);
        }
      }

      return {
        id: data.id,
        name: data.name,
        status: data.status,
        categories: data.categories || [],
        validation_errors: data.validation_errors,
        screens
      };
    } catch (error) {
      console.error('Error fetching flow details:', error);
      throw error;
    }
  }

  /**
   * Create a message template with a Flow button
   * This creates a business-initiated message template that includes a Flow
   */
  static async createFlowTemplate(
    appService: AppService,
    templateData: {
      name: string;
      language: string;
      category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
      bodyText: string;
      flowId: string;
      flowAction?: 'navigate' | 'data_exchange';
      navigateScreen?: string;
      buttonText?: string;
    }
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.whatsapp_business_account_id) {
        throw new Error('WhatsApp Business Account ID is required');
      }

      // Format template name
      const templateName = templateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      // Build template components
      // Check if body text has variables ({{1}}, {{2}}, etc.)
      const variableMatches = templateData.bodyText.match(/\{\{\d+\}\}/g);
      const hasVariables = variableMatches && variableMatches.length > 0;

      const bodyComponent: any = {
        type: 'BODY',
        text: templateData.bodyText
      };

      // Meta ALWAYS requires example field for BODY component
      if (hasVariables) {
        // For templates WITH variables: provide sample values
        const exampleValues = variableMatches!.map((_, idx) => `Sample ${idx + 1}`);
        bodyComponent.example = {
          body_text: [exampleValues]  // Nested array: [[val1, val2, ...]]
        };
      } else {
        // For templates WITHOUT variables: provide empty nested array
        bodyComponent.example = {
          body_text: [[]]  // Empty nested array required by Meta
        };
      }

      const components: any[] = [
        bodyComponent,
        {
          type: 'BUTTONS',
          buttons: [
            {
              type: 'FLOW',
              text: templateData.buttonText || 'Open Flow',
              flow_id: templateData.flowId,
              flow_action: templateData.flowAction || 'navigate'
              // Note: navigate_screen is NOT supported in template creation
              // The screen is specified when SENDING the template, not when creating it
            }
          ]
        }
      ];

      const payload = {
        name: templateName,
        language: templateData.language,
        category: templateData.category,
        components
      };

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/message_templates`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        // Extract detailed error information
        const errorInfo = this.extractErrorMessage(responseData);

        // Create a comprehensive error message
        let errorMessage = errorInfo.message;
        if (errorInfo.details) {
          errorMessage = `${errorInfo.message}\n\nDetails: ${errorInfo.details}`;
        }

        // Create error with both message and details for better handling
        const error: any = new Error(errorMessage);
        error.details = errorInfo.details;
        error.apiResponse = responseData;

        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('Error creating flow template:', error);
      throw error;
    }
  }

  /**
   * Send a template message with a Flow (business-initiated)
   */
  static async sendFlowTemplate(
    appService: AppService,
    recipientNumber: string,
    templateName: string,
    languageCode: string,
    flowToken?: string,
    flowActionData?: Record<string, any>
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.phone_number_id) {
        throw new Error('Phone number ID is required');
      }

      const messageData: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          }
        }
      };

      // Add flow button parameters if provided
      if (flowToken || flowActionData) {
        messageData.template.components = [
          {
            type: 'button',
            sub_type: 'flow',
            index: '0',
            parameters: [
              {
                type: 'action',
                action: {
                  ...(flowToken && { flow_token: flowToken }),
                  ...(flowActionData && { flow_action_data: flowActionData })
                }
              }
            ]
          }
        ];
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

      const responseData = await response.json();

      if (!response.ok) {
        // Extract detailed error information
        const errorInfo = this.extractErrorMessage(responseData);

        // Create a comprehensive error message
        let errorMessage = errorInfo.message;
        if (errorInfo.details) {
          errorMessage = `${errorInfo.message}\n\nDetails: ${errorInfo.details}`;
        }

        // Create error with both message and details for better handling
        const error: any = new Error(errorMessage);
        error.details = errorInfo.details;
        error.apiResponse = responseData;

        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('Error sending flow template:', error);
      throw error;
    }
  }

  /**
   * Send an interactive Flow message (user-initiated conversation)
   * This is for sending Flows in response to user messages within 24-hour window
   */
  static async sendInteractiveFlowMessage(
    appService: AppService,
    recipientNumber: string,
    flowId: string,
    options: {
      headerText?: string;
      bodyText: string;
      footerText?: string;
      buttonText: string;
      flowToken?: string;
      flowAction?: 'navigate' | 'data_exchange';
      screen?: string;
      flowData?: Record<string, any>;
      mode?: 'draft' | 'published';
    }
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.phone_number_id) {
        throw new Error('Phone number ID is required');
      }

      const messageData: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientNumber,
        type: 'interactive',
        interactive: {
          type: 'flow',
          body: {
            text: options.bodyText
          },
          action: {
            name: 'flow',
            parameters: {
              flow_message_version: '3',
              flow_id: flowId,
              flow_cta: options.buttonText,
              mode: options.mode || 'published',
              ...(options.flowToken && { flow_token: options.flowToken }),
              ...(options.flowAction && { flow_action: options.flowAction })
            }
          }
        }
      };

      // Add optional header
      if (options.headerText) {
        messageData.interactive.header = {
          type: 'text',
          text: options.headerText
        };
      }

      // Add optional footer
      if (options.footerText) {
        messageData.interactive.footer = {
          text: options.footerText
        };
      }

      // Add flow action payload if screen or data is provided
      // IMPORTANT: data must be a non-empty object or omitted entirely
      if (options.screen || (options.flowData && Object.keys(options.flowData).length > 0)) {
        const payload: any = {};

        if (options.screen) {
          payload.screen = options.screen;
        }

        // Only add data if it's a non-empty object
        if (options.flowData && Object.keys(options.flowData).length > 0) {
          payload.data = options.flowData;
        }

        messageData.interactive.action.parameters.flow_action_payload = payload;
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

      const responseData = await response.json();

      if (!response.ok) {
        // Extract detailed error information
        const errorInfo = this.extractErrorMessage(responseData);

        // Create a comprehensive error message
        let errorMessage = errorInfo.message;
        if (errorInfo.details) {
          errorMessage = `${errorInfo.message}\n\nDetails: ${errorInfo.details}`;
        }

        // Create error with both message and details for better handling
        const error: any = new Error(errorMessage);
        error.details = errorInfo.details;
        error.apiResponse = responseData;

        throw error;
      }

      return responseData;
    } catch (error) {
      console.error('Error sending interactive flow message:', error);
      throw error;
    }
  }

  /**
   * Publish a draft Flow
   */
  static async publishFlow(
    appService: AppService,
    flowId: string
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${flowId}/publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to publish flow: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error publishing flow:', error);
      throw error;
    }
  }

  /**
   * Deprecate a published Flow
   */
  static async deprecateFlow(
    appService: AppService,
    flowId: string
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${flowId}`,
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
        throw new Error(`Failed to deprecate flow: ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deprecating flow:', error);
      throw error;
    }
  }

  // ============================================================================
  // TYPING INDICATOR METHODS
  // ============================================================================

  /**
   * Send a typing indicator to a WhatsApp user.
   *
   * This shows the user that an agent is preparing a response.
   * The typing indicator will be dismissed once a message is sent,
   * or after 25 seconds, whichever comes first.
   *
   * @param phoneNumber - The business phone number
   * @param customerNumber - The customer's WhatsApp number
   * @param messageId - Optional specific message ID to mark as read
   * @returns Promise<boolean> - True if successful
   */
  static async sendTypingIndicator(
    phoneNumber: string,
    customerNumber: string,
    messageId?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appservice/whatsapp/typing-indicator/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phone_number: phoneNumber,
          customer_number: customerNumber,
          ...(messageId && { message_id: messageId })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Typing indicator error:', data);
        return { success: false, message: data.error || 'Failed to send typing indicator' };
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Helper method to get flow JSON directly (for debugging)
   * This can help diagnose why screens aren't showing up
   */
  static async getFlowJSON(
    appService: AppService,
    flowId: string
  ): Promise<any> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${flowId}/assets`,
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
        throw new Error(`Failed to fetch flow JSON: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // The flow JSON is in data.data[0] if it exists
      if (data.data && data.data.length > 0) {
        return JSON.parse(data.data[0].flow_json);
      }

      return null;
    } catch (error) {
      console.error('Error fetching flow JSON:', error);
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
  PhoneNumberLimit,
  WhatsAppFlow,
  FlowScreen,
  FlowDetails,
  FlowMessagePayload
};
