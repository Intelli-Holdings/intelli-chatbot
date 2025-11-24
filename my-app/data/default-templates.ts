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
    add_security_recommendation?: boolean;
    code_expiration_minutes?: number;
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'OTP';
      text?: string;
      url?: string;
      phone_number?: string;
      otp_type?: 'COPY_CODE' | 'ONE_TAP' | 'ZERO_TAP';
      autofill_text?: string;
      package_name?: string;
      signature_hash?: string;
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
    "name": "order_confirmation",
    "language": "en_US",
    "category": "UTILITY",
    "components": [
      {
        "type": "HEADER",
        "format": "IMAGE",
        "example": {
          "header_handle": [""]
        }
      },
      {
        "type": "BODY",
        "text": "Thank you for your order, {{1}}! Your order number is #{{2}}. Tap the Image above to view your receipt. If you have any questions, please use the buttons below to contact support. Thanks again!",
        "example": {
          "body_text": [
            [
              "Mark", "860198-230332"
            ]
          ]
        }
      },
      {
        "type": "BUTTONS",
        "buttons": [
          {
            "type": "PHONE_NUMBER",
            "text": "Call",
            "phone_number": "16467043595"
          },
          {
            "type": "URL",
            "text": "Contact Support",
            "url": "https://www.example.com/support"
          }
        ]
      }
    ],
    id: "",
    description: "Order confirmation with receipt and support options"
  },

  // MARKETING TEMPLATES
  {
    "name": "limited_time_offer_tuscan_getaway",
    "language": "en_US",
    "category": "MARKETING",
    "components": [
      {
        "type": "HEADER",
        "format": "IMAGE",
        "example": {
          "header_handle": [""]
        }
      },
      {
        "type": "BODY",
        "text": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
        "example": {
          "body_text": [
            [
              "Mark", "Tuscan Getaway package", "800"
            ]
          ]
        }
      },
      {
        "type": "FOOTER",
        "text": "Offer valid until May 31, 2023"
      },
      {
        "type": "BUTTONS",
        "buttons": [
          {
            "type": "PHONE_NUMBER",
            "text": "Call",
            "phone_number": "15550051310"
          },
          {
            "type": "URL",
            "text": "Shop Now",
            "url": "https://www.shopify.com/shop?promo={{1}}",
            "example": [
              "summer2023"
            ]
          }
        ]
      }
    ],
    id: "",
    description: "Limited time promotional offer with image header"
  },

  // AUTHENTICATION TEMPLATES
  {
    id: 'authentication-copy-code',
    name: 'authentication_copy_code',
    category: 'AUTHENTICATION',
    description: 'Authentication template with copy code button',
    language: 'en_US',
    components: [
      {
        type: 'BODY',
        text: "Approve transaction:\n\nMerchant: {{1}}\nAmount: {{2}}\n\nCode: {{3}}\n\nExpires in 5 minutes.",
        add_security_recommendation: true,
        example: {
    
          body_text: [['123456']]
        }
      },
      {
        type: 'FOOTER',
        // Code expiration is controlled via minutes on FOOTER for auth templates
        code_expiration_minutes: 5
      },
      {
        "type": 'BUTTONS',
        "buttons": [
          {
            "type": 'OTP',
            "otp_type": 'COPY_CODE',
            "text": 'Copy Code'
          }
        ]
      }
    ],
    preview: {
      body: 'For your security, use the code provided to complete authentication.',
      footer: 'This code expires in 5 minutes.',
      buttons: ['Copy Code']
    }
  },

];
