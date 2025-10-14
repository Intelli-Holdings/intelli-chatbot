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
    "name": "order_confirmation",
    "language": "en_US",
    "category": "UTILITY",
    "components": [
      {
        "type": "HEADER",
        "format": "DOCUMENT",
        "example": {
          "header_handle": [""]
        }
      },
      {
        "type": "BODY",
        "text": "Thank you for your order, {{1}}! Your order number is #{{2}}. Tap the PDF linked above to view your receipt. If you have any questions, please use the buttons below to contact support. Thanks again!",
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
            "url": "https://www.examplesite.com/support"
          }
        ]
      }
    ],
    id: "",
    description: ""
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
    description: ""
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