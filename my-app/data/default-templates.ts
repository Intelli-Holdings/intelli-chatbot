export interface DefaultTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  description: string;
  language: string;
  add_security_recommendation?: boolean;
  code_expiration_minutes?: number;
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
    text?: string;
    example?: any;
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'OTP';
      text: string;
      url?: string;
      phone_number?: string;
      otp_type?: 'COPY_CODE';
      example?: string[];
    }>;
  }>;
  preview?: {
    header?: string;
    body: string;
    footer?: string;
    buttons?: string[];
  };
}

export const defaultTemplates: DefaultTemplate[] = [
  // UTILITY TEMPLATES
  {
    id: 'customer-support',
    name: 'Customer Support Response',
    category: 'UTILITY',
    description: 'Respond to customer support inquiries',
    language: 'en_US',
    components: [
      {
        type: 'BODY',
        text: 'Hi {{1}}, thank you for contacting our support team.\n\nTicket ID: {{2}}\nIssue: {{3}}\n\nOur team is reviewing your request and will get back to you within 24 hours.',
        example: {
          body_text: [['John Doe', 'TICKET-789', 'Product inquiry']]
        }
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'PHONE_NUMBER',
            text: 'Call Support',
            phone_number: '254114567890'
          },
          {
            type: 'URL',
            text: 'View Ticket',
            url: 'https://support.example.com/ticket/{{1}}',
            example: ['TICKET-789']
          }
        ]
      }
    ],
    preview: {
      body: 'Hi John Doe, thank you for contacting our support team.\n\nTicket ID: TICKET-789\nIssue: Product inquiry\n\nOur team is reviewing your request and will get back to you within 24 hours.',
      buttons: ['Call Support', 'View Ticket']
    }
  },

  // MARKETING TEMPLATES
  {
    id: 'seasonal-sale',
    name: 'Seasonal Sale',
    category: 'MARKETING',
    description: 'Promote seasonal sales and discounts',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'IMAGE',
        example: {
          header_handle: ['']
        }
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}! Our {{2}} Sale is here!\n\nEnjoy {{3}}% off on all products. Use code: {{4}} at checkout.\n\nHurry! Offer valid only until {{5}}.',
        example: {
          body_text: [['John', 'Summer', '25', 'SALE25', 'March 31']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to unsubscribe'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Shop Now',
            url: 'https://example.com/sale'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Unsubscribe'
          }
        ]
      }
    ],
    preview: {
      body: 'Hi John! Our Summer Sale is here!\n\nEnjoy 25% off on all products. Use code: SALE25 at checkout.\n\nHurry! Offer valid only until March 31.',
      footer: 'Reply STOP to unsubscribe',
      buttons: ['Shop Now', 'Unsubscribe']
    }
  },

  // AUTHENTICATION TEMPLATES
  {
    id: 'transaction-authentication',
    name: 'Transaction Authentication',
    category: 'AUTHENTICATION',
    description: 'Require users to authenticate a transaction',
    language: 'en_US',
    add_security_recommendation: true,
    code_expiration_minutes: 5,
    components: [
      {
        type: 'BODY',
        text: 'Approve transaction:\n\nMerchant: {{1}}\nAmount: {{2}}\n\nCode: {{3}}\n\nExpires in 5 minutes.',
        example: {
          body_text: [['Amazon', '$99.99', '123456']]
        }
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'OTP',
            text: 'Copy Code',
            otp_type: 'COPY_CODE'
          }
        ]
      }
    ],
    preview: {
      body: 'Approve transaction:\n\nMerchant: Amazon\nAmount: $99.99\n\nCode: 123456\n\nExpires in 5 minutes.',
      buttons: ['Copy Code']
    }
  },

];