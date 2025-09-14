/**
 * WhatsApp Business API Template Types
 * Based on Meta's official template documentation
 */

// Template Categories
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

// Template Status
export type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | 'PENDING_DELETION';

// Component Types
export type ComponentType = 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';

// Header Formats
export type HeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';

// Button Types
export type ButtonType = 
  | 'QUICK_REPLY' 
  | 'URL' 
  | 'PHONE_NUMBER' 
  | 'COPY_CODE'
  | 'OTP'
  | 'MPM' // Multi-product message
  | 'CATALOG'
  | 'FLOW'
  | 'VOICE_CALL'
  | 'APP';

// OTP Types for Authentication Templates
export type OTPType = 'COPY_CODE' | 'ONE_TAP' | 'ZERO_TAP';

// Parameter Format Types
export type ParameterFormat = 'POSITIONAL' | 'NAMED';

// Flow Actions
export type FlowAction = 'navigate' | 'data_exchange';

// Button Interface
export interface TemplateButton {
  type: ButtonType;
  text: string;
  url?: string;
  phone_number?: string;
  example?: string[];
  otp_type?: OTPType;
  // For Flow buttons
  flow_id?: string;
  flow_name?: string;
  flow_json?: string;
  flow_action?: FlowAction;
  navigate_screen?: string;
  icon?: 'DOCUMENT' | 'PROMOTION' | 'REVIEW';
  // For OTP buttons
  supported_apps?: Array<{
    package_name: string;
    signature_hash: string;
  }>;
}

// Component Example Interface
export interface ComponentExample {
  header_text?: string[];
  header_handle?: string[]; // For media headers
  body_text?: string[][];
  header_text_named_params?: Array<{
    param_name: string;
    example: string;
  }>;
  body_text_named_params?: Array<{
    param_name: string;
    example: string;
  }>;
}

// Component Interface
export interface TemplateComponent {
  type: ComponentType;
  format?: HeaderFormat;
  text?: string;
  example?: ComponentExample;
  buttons?: TemplateButton[];
  // Authentication specific
  add_security_recommendation?: boolean;
  code_expiration_minutes?: number;
}

// Main Template Interface
export interface WhatsAppTemplate {
  id?: string;
  name: string;
  category: TemplateCategory;
  language: string;
  status?: TemplateStatus;
  components: TemplateComponent[];
  parameter_format?: ParameterFormat;
  message_send_ttl_seconds?: number;
  rejected_reason?: string;
}

// Template Creation Request
export interface CreateTemplateRequest {
  name: string;
  category: TemplateCategory;
  language: string;
  components: TemplateComponent[];
  parameter_format?: ParameterFormat;
  allow_category_change?: boolean;
  message_send_ttl_seconds?: number;
}

// Catalog Template Interface
export interface CatalogTemplate {
  id?: string;
  name: string;
  category: 'MARKETING';
  language: string;
  status?: TemplateStatus;
  components: [
    {
      type: 'BODY';
      text: string;
      example?: ComponentExample;
    },
    {
      type: 'FOOTER';
      text?: string;
    }?,
    {
      type: 'BUTTONS';
      buttons: [{
        type: 'CATALOG';
        text: 'View catalog';
      }];
    }?
  ];
  parameter_format?: ParameterFormat;
  message_send_ttl_seconds?: number;
  rejected_reason?: string;
}
// Authentication Template Parameter Interface
export interface AuthenticationParameter {
  type: 'text';
  text: string;
}

// Authentication Template Component Interface
export interface AuthenticationComponent {
  type: 'body' | 'button';
  parameters?: AuthenticationParameter[];
  sub_type?: 'url' | 'copy_code' | 'one_tap' | 'zero_tap';
  index?: string;
}

export interface AuthenticationTemplate {
  id?: string;
  name: string;
  category: 'AUTHENTICATION';
  language: string;
  status?: TemplateStatus;
  components: [
    {
      type: 'BODY';
      add_security_recommendation?: boolean;
    },
    {
      type: 'FOOTER';
      text?: string;
      code_expiration_minutes?: number;
    }?,
    {
      type: 'BUTTONS';
      buttons: [{
        type: 'OTP';
        text: string;
        otp_type: OTPType;
        supported_apps?: Array<{
          package_name: string;
          signature_hash: string;
        }>;
      }];
    }?
  ];
  parameter_format?: ParameterFormat;
  message_send_ttl_seconds?: number;
  rejected_reason?: string;
}

// Authentication Message Template (for sending messages)
export interface AuthenticationMessageTemplate {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components: AuthenticationComponent[];
  };
}

// Template Limits
export const TEMPLATE_LIMITS = {
  name: {
    maxLength: 512,
    pattern: /^[a-z0-9_]+$/,
  },
  header: {
    text: {
      maxLength: 60,
      maxVariables: 1,
    },
  },
  body: {
    text: {
      maxLength: 1024,
    },
  },
  footer: {
    text: {
      maxLength: 60,
    },
  },
  buttons: {
    maxTotal: 10,
    quickReply: {
      maxCount: 10,
      textMaxLength: 25,
    },
    url: {
      maxCount: 2,
      textMaxLength: 25,
      urlMaxLength: 2000,
    },
    phoneNumber: {
      maxCount: 1,
      textMaxLength: 25,
      phoneMaxLength: 20,
    },
    copyCode: {
      maxCount: 1,
      codeMaxLength: 15,
    },
  },
  ttl: {
    authentication: {
      min: 30, // seconds
      max: 900, // 15 minutes
      default: 600, // 10 minutes
    },
    utility: {
      min: 30, // seconds
      max: 43200, // 12 hours
      default: 2592000, // 30 days
    },
    marketing: {
      min: 43200, // 12 hours
      max: 2592000, // 30 days
      default: 2592000, // 30 days
    },
  },
};

// Language codes supported by WhatsApp
export const SUPPORTED_LANGUAGES = [
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'zh_CN', name: 'Chinese (Simplified)' },
  { code: 'zh_HK', name: 'Chinese (Hong Kong)' },
  { code: 'zh_TW', name: 'Chinese (Traditional)' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'en_GB', name: 'English (UK)' },
  { code: 'en_US', name: 'English (US)' },
  { code: 'et', name: 'Estonian' },
  { code: 'fil', name: 'Filipino' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'ka', name: 'Georgian' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ha', name: 'Hausa' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'rw_RW', name: 'Kinyarwanda' },
  { code: 'ko', name: 'Korean' },
  { code: 'ky_KG', name: 'Kyrgyz' },
  { code: 'lo', name: 'Lao' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'ms', name: 'Malay' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'nb', name: 'Norwegian' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt_BR', name: 'Portuguese (Brazil)' },
  { code: 'pt_PT', name: 'Portuguese (Portugal)' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'es', name: 'Spanish' },
  { code: 'es_AR', name: 'Spanish (Argentina)' },
  { code: 'es_ES', name: 'Spanish (Spain)' },
  { code: 'es_MX', name: 'Spanish (Mexico)' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zu', name: 'Zulu' },
];

// Validation helpers
export const validateTemplateName = (name: string): boolean => {
  return TEMPLATE_LIMITS.name.pattern.test(name.toLowerCase()) && 
         name.length <= TEMPLATE_LIMITS.name.maxLength;
};

export const validateHeaderText = (text: string): boolean => {
  const variableCount = (text.match(/\{\{\d+\}\}/g) || []).length;
  return text.length <= TEMPLATE_LIMITS.header.text.maxLength && 
         variableCount <= TEMPLATE_LIMITS.header.text.maxVariables;
};

export const validateBodyText = (text: string): boolean => {
  return text.length <= TEMPLATE_LIMITS.body.text.maxLength;
};

export const validateFooterText = (text: string): boolean => {
  return text.length <= TEMPLATE_LIMITS.footer.text.maxLength;
};

export const validateButtonText = (text: string, buttonType: ButtonType): boolean => {
  switch (buttonType) {
    case 'QUICK_REPLY':
      return text.length <= TEMPLATE_LIMITS.buttons.quickReply.textMaxLength;
    case 'URL':
      return text.length <= TEMPLATE_LIMITS.buttons.url.textMaxLength;
    case 'PHONE_NUMBER':
      return text.length <= TEMPLATE_LIMITS.buttons.phoneNumber.textMaxLength;
    default:
      return text.length <= 25;
  }
};

export const validateTTL = (seconds: number, category: TemplateCategory): boolean => {
  const limits = TEMPLATE_LIMITS.ttl[category.toLowerCase() as keyof typeof TEMPLATE_LIMITS.ttl];
  return seconds >= limits.min && seconds <= limits.max;
};

// Helper to determine if template requires media upload
export const requiresMediaUpload = (components: TemplateComponent[]): boolean => {
  const header = components.find(c => c.type === 'HEADER');
  return header?.format ? ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format) : false;
};

// Helper to count variables in template
export const countVariables = (text: string): number => {
  const matches = text.match(/\{\{\d+\}\}/g) || [];
  return matches.length;
};

// Helper to validate button combination
export const validateButtonCombination = (buttons: TemplateButton[]): boolean => {
  if (buttons.length > TEMPLATE_LIMITS.buttons.maxTotal) return false;
  
  const quickReplyCount = buttons.filter(b => b.type === 'QUICK_REPLY').length;
  const urlCount = buttons.filter(b => b.type === 'URL').length;
  const phoneCount = buttons.filter(b => b.type === 'PHONE_NUMBER').length;
  
  if (quickReplyCount > TEMPLATE_LIMITS.buttons.quickReply.maxCount) return false;
  if (urlCount > TEMPLATE_LIMITS.buttons.url.maxCount) return false;
  if (phoneCount > TEMPLATE_LIMITS.buttons.phoneNumber.maxCount) return false;
  
  // Quick reply buttons must be grouped together
  if (quickReplyCount > 0) {
    const firstQuickReplyIndex = buttons.findIndex(b => b.type === 'QUICK_REPLY');
    const lastQuickReplyIndex = buttons.lastIndexOf(buttons.find(b => b.type === 'QUICK_REPLY')!);
    const quickReplyGroupSize = lastQuickReplyIndex - firstQuickReplyIndex + 1;
    
    if (quickReplyGroupSize !== quickReplyCount) {
      return false; // Quick reply buttons are not grouped together
    }
  }
  
  return true;
};
