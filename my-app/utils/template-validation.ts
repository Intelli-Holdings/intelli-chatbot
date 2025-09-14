/**
 * Template Category Validation and Auto-Categorization
 * Based on Meta's WhatsApp Business API Guidelines
 */

import type { 
  TemplateCategory, 
  TemplateComponent,
  WhatsAppTemplate,
  TEMPLATE_LIMITS
} from '@/types/whatsapp-templates';

// Keywords that indicate marketing content
const MARKETING_KEYWORDS = [
  'sale', 'discount', 'offer', 'promo', 'promotion', 'deal', 'save',
  'limited time', 'exclusive', 'special', 'buy now', 'shop now',
  'free', 'gift', 'reward', 'loyalty', 'points', 'cashback',
  'new arrival', 'launch', 'introducing', 'announcement',
  'newsletter', 'subscribe', 'unsubscribe', 'opt-out', 'opt out',
  'marketing', 'advertisement', 'sponsored', 'partner',
  'click here', 'learn more', 'sign up', 'register now',
  'feedback', 'review', 'rate', 'survey', 'satisfaction'
];

// Keywords that indicate utility/transactional content
const UTILITY_KEYWORDS = [
  'order', 'confirmation', 'receipt', 'invoice', 'payment',
  'shipping', 'delivery', 'tracking', 'status', 'update',
  'appointment', 'booking', 'reservation', 'reminder',
  'account', 'password', 'security', 'verification',
  'ticket', 'support', 'help', 'assistance', 'inquiry',
  'notification', 'alert', 'important', 'urgent',
  'transaction', 'transfer', 'balance', 'statement'
];

// Keywords that indicate authentication content
const AUTHENTICATION_KEYWORDS = [
  'otp', 'code', 'verification', 'verify', 'authenticate',
  'confirm', 'security', 'password', 'pin', 'token',
  'one-time', 'one time', 'temporary', 'expires',
  '2fa', 'two-factor', 'two factor', 'multi-factor',
  'login', 'sign in', 'signin', 'access'
];

/**
 * Auto-categorize template based on content analysis
 */
export function autoCategorizeTemplate(components: TemplateComponent[]): TemplateCategory {
  // Check if it's an authentication template
  if (isAuthenticationTemplate(components)) {
    return 'AUTHENTICATION';
  }

  // Analyze text content from all components
  const fullText = extractFullText(components).toLowerCase();
  
  // Count keyword matches
  const marketingScore = countKeywordMatches(fullText, MARKETING_KEYWORDS);
  const utilityScore = countKeywordMatches(fullText, UTILITY_KEYWORDS);
  const authScore = countKeywordMatches(fullText, AUTHENTICATION_KEYWORDS);

  // Check button types for additional hints
  const buttons = components.find(c => c.type === 'BUTTONS')?.buttons || [];
  
  // OTP buttons indicate authentication
  if (buttons.some(b => b.type === 'OTP' || b.type === 'COPY_CODE')) {
    return 'AUTHENTICATION';
  }
  
  // Quick reply buttons with opt-out text indicate marketing
  if (buttons.some(b => 
    b.type === 'QUICK_REPLY' && 
    (b.text.toLowerCase().includes('unsubscribe') || 
     b.text.toLowerCase().includes('stop') ||
     b.text.toLowerCase().includes('opt')))) {
    return 'MARKETING';
  }

  // Catalog buttons indicate marketing
  if (buttons.some(b => b.type === 'CATALOG' || b.type === 'MPM')) {
    return 'MARKETING';
  }

  // Determine category based on highest score
  if (authScore > marketingScore && authScore > utilityScore) {
    return 'AUTHENTICATION';
  } else if (marketingScore > utilityScore) {
    return 'MARKETING';
  } else {
    // Default to UTILITY for transactional messages
    return 'UTILITY';
  }
}

/**
 * Check if template is an authentication template
 */
function isAuthenticationTemplate(components: TemplateComponent[]): boolean {
  const hasOTPButton = components.some(c => 
    c.type === 'BUTTONS' && 
    c.buttons?.some(b => b.type === 'OTP' || b.type === 'COPY_CODE')
  );
  
  const hasSecurityRecommendation = components.some(c => 
    c.type === 'BODY' && c.add_security_recommendation
  );
  
  const hasCodeExpiration = components.some(c => 
    c.type === 'FOOTER' && c.code_expiration_minutes
  );
  
  return hasOTPButton || hasSecurityRecommendation || hasCodeExpiration;
}

/**
 * Extract all text content from components
 */
function extractFullText(components: TemplateComponent[]): string {
  return components
    .map(c => {
      if (c.text) return c.text;
      if (c.buttons) {
        return c.buttons.map(b => b.text).join(' ');
      }
      return '';
    })
    .join(' ');
}

/**
 * Count keyword matches in text
 */
function countKeywordMatches(text: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

/**
 * Validate template category against content
 */
export function validateTemplateCategory(
  template: WhatsAppTemplate,
  suggestedCategory?: TemplateCategory
): {
  isValid: boolean;
  recommendedCategory: TemplateCategory;
  warnings: string[];
} {
  const autoCategory = autoCategorizeTemplate(template.components);
  const targetCategory = suggestedCategory || template.category;
  
  const warnings: string[] = [];

  // Check for category mismatches
  if (targetCategory !== autoCategory) {
    if (targetCategory === 'UTILITY' && autoCategory === 'MARKETING') {
      warnings.push(
        'This template contains marketing content and should be categorized as MARKETING. ' +
        'Meta may automatically re-categorize it during review.'
      );
    } else if (targetCategory === 'MARKETING' && autoCategory === 'UTILITY') {
      warnings.push(
        'This template appears to be transactional and could be categorized as UTILITY. ' +
        'UTILITY templates have different pricing and delivery guarantees.'
      );
    } else if (autoCategory === 'AUTHENTICATION' && targetCategory !== 'AUTHENTICATION') {
      warnings.push(
        'This template contains authentication elements and must be categorized as AUTHENTICATION.'
      );
    }
  }

  // Check TTL settings for authentication templates
  if (targetCategory === 'AUTHENTICATION') {
    const ttl = template.message_send_ttl_seconds;
    if (ttl && (ttl < 30 || ttl > 900)) {
      warnings.push(
        'Authentication templates must have a TTL between 30 seconds and 15 minutes.'
      );
    }
  }

  // Check for required opt-out in marketing templates
  if (targetCategory === 'MARKETING') {
    const hasOptOut = template.components.some(c => 
      (c.type === 'FOOTER' && c.text?.toLowerCase().includes('stop')) ||
      (c.type === 'BUTTONS' && c.buttons?.some(b => 
        b.text.toLowerCase().includes('unsubscribe') || 
        b.text.toLowerCase().includes('stop')
      ))
    );
    
    if (!hasOptOut) {
      warnings.push(
        'Marketing templates should include an opt-out option (e.g., "Reply STOP to unsubscribe" in footer or an Unsubscribe button).'
      );
    }
  }

  return {
    isValid: warnings.length === 0,
    recommendedCategory: autoCategory,
    warnings
  };
}

/**
 * Get category-specific template requirements
 */
export function getCategoryRequirements(category: TemplateCategory): {
  requirements: string[];
  recommendations: string[];
  ttlLimits: { min: number; max: number; default: number };
} {
  switch (category) {
    case 'AUTHENTICATION':
      return {
        requirements: [
          'Must contain a one-time password or verification code',
          'Template text must follow the format: "<VERIFICATION_CODE> is your verification code"',
          'Can optionally include security disclaimer: "For your security, do not share this code"',
          'Can optionally include expiration warning: "This code expires in <NUM_MINUTES> minutes"',
          'Must include OTP button (Copy Code, One-Tap, or Zero-Tap)'
        ],
        recommendations: [
          'Keep message concise and clear',
          'Use code expiration to enhance security',
          'Consider using One-Tap autofill for better UX on Android'
        ],
        ttlLimits: { min: 30, max: 900, default: 600 }
      };

    case 'UTILITY':
      return {
        requirements: [
          'Must be transactional or informational in nature',
          'Cannot contain promotional content or marketing language',
          'Must be triggered by a user action or transaction',
          'Should provide value through information or service'
        ],
        recommendations: [
          'Include relevant transaction details',
          'Add action buttons for common next steps',
          'Keep the message focused on the transaction'
        ],
        ttlLimits: { min: 30, max: 43200, default: 2592000 }
      };

    case 'MARKETING':
      return {
        requirements: [
          'Must clearly be promotional or marketing in nature',
          'Must include opt-out instructions',
          'Cannot be sent to users who have opted out',
          'Subject to marketing message limits and pricing'
        ],
        recommendations: [
          'Add an Unsubscribe quick reply button',
          'Include "Reply STOP to unsubscribe" in footer',
          'Use compelling but honest language',
          'Include clear call-to-action buttons'
        ],
        ttlLimits: { min: 43200, max: 2592000, default: 2592000 }
      };
  }
}

/**
 * Validate template compliance with Meta's guidelines
 */
export function validateTemplateCompliance(template: WhatsAppTemplate): {
  isCompliant: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate template name
  const nameRegex = /^[a-z0-9_]+$/;
  if (!nameRegex.test(template.name.toLowerCase())) {
    errors.push('Template name must contain only lowercase letters, numbers, and underscores');
  }
  if (template.name.length > 512) {
    errors.push('Template name must not exceed 512 characters');
  }

  // Validate components
  const hasBody = template.components.some(c => c.type === 'BODY');
  if (!hasBody) {
    errors.push('Template must have a BODY component');
  }

  // Check for duplicate component types (except BUTTONS)
  const componentTypes = template.components.map(c => c.type);
  const duplicates = componentTypes.filter((type, index) => 
    type !== 'BUTTONS' && componentTypes.indexOf(type) !== index
  );
  if (duplicates.length > 0) {
    errors.push(`Duplicate component types found: ${duplicates.join(', ')}`);
  }

  // Validate each component
  template.components.forEach(component => {
    validateComponent(component, errors, warnings);
  });

  // Category-specific validation
  const categoryValidation = validateTemplateCategory(template);
  warnings.push(...categoryValidation.warnings);

  return {
    isCompliant: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate individual component
 */
function validateComponent(
  component: TemplateComponent,
  errors: string[],
  warnings: string[]
): void {
  switch (component.type) {
    case 'HEADER':
      if (component.format === 'TEXT' && component.text) {
        if (component.text.length > 60) {
          errors.push('Header text must not exceed 60 characters');
        }
        const variableCount = (component.text.match(/\{\{\d+\}\}/g) || []).length;
        if (variableCount > 1) {
          errors.push('Header text can contain maximum 1 variable');
        }
      }
      break;

    case 'BODY':
      if (!component.text) {
        errors.push('Body component must have text');
      } else if (component.text.length > 1024) {
        errors.push('Body text must not exceed 1024 characters');
      }
      break;

    case 'FOOTER':
      if (component.text && component.text.length > 60) {
        errors.push('Footer text must not exceed 60 characters');
      }
      break;

    case 'BUTTONS':
      if (component.buttons) {
        if (component.buttons.length > 10) {
          errors.push('Maximum 10 buttons allowed');
        }
        
        // Validate button combinations
        const quickReplyCount = component.buttons.filter(b => b.type === 'QUICK_REPLY').length;
        const urlCount = component.buttons.filter(b => b.type === 'URL').length;
        const phoneCount = component.buttons.filter(b => b.type === 'PHONE_NUMBER').length;
        
        if (urlCount > 2) {
          errors.push('Maximum 2 URL buttons allowed');
        }
        if (phoneCount > 1) {
          errors.push('Maximum 1 phone number button allowed');
        }
        if (quickReplyCount > 10) {
          errors.push('Maximum 10 quick reply buttons allowed');
        }
        
        // Check button text lengths
        component.buttons.forEach(button => {
          if (button.text.length > 25) {
            errors.push(`Button text "${button.text}" exceeds 25 character limit`);
          }
        });
        
        // Validate quick reply grouping
        if (quickReplyCount > 0) {
          const firstQR = component.buttons.findIndex(b => b.type === 'QUICK_REPLY');
          const lastQR = component.buttons.map(b => b.type).lastIndexOf('QUICK_REPLY');
          const qrGrouped = component.buttons
            .slice(firstQR, lastQR + 1)
            .every(b => b.type === 'QUICK_REPLY');
          
          if (!qrGrouped) {
            warnings.push('Quick reply buttons should be grouped together');
          }
        }
      }
      break;
  }
}

/**
 * Generate example values for template variables
 */
export function generateExampleValues(text: string): string[] {
  const variables = text.match(/\{\{(\d+)\}\}/g) || [];
  const examples: { [key: number]: string } = {
    1: 'John Doe',
    2: 'ORD-12345',
    3: '$99.99',
    4: 'January 15, 2024',
    5: '10',
    6: 'Product Name',
    7: 'tracking_number_123',
    8: 'Company Name',
    9: '123456', // For OTP
    10: '5 minutes'
  };
  
  return variables.map(v => {
    const num = parseInt(v.replace(/[{}]/g, ''));
    return examples[num] || `Value${num}`;
  });
}
