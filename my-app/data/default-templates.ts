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
    }>;
  }>;
  preview?: {
    header?: string;
    body: string;
    footer?: string;
    buttons?: string[];
  };
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
  text?: string;
  example?: any
  buttons?: any[];
  add_security_recommendation?: boolean;
  code_expiration_minutes?: number
}

export const defaultTemplates: DefaultTemplate[] = [
  // UTILITY TEMPLATES
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    category: 'UTILITY',
    description: 'Send order confirmation with details to customers',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Order Confirmed!'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, thank you for your order!\n\nOrder ID: {{2}}\nTotal Amount: {{3}}\nEstimated Delivery: {{4}}\n\nWe\'ll send you tracking information once your order ships.'
      },
      {
        type: 'FOOTER',
        text: 'Thank you for shopping with us!'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Track Order',
            url: 'https://example.com/track/{{1}}'
          }
        ]
      }
    ],
    preview: {
      header: 'Order Confirmed!',
      body: 'Hi [Customer Name], thank you for your order!\n\nOrder ID: [Order ID]\nTotal Amount: [Amount]\nEstimated Delivery: [Date]\n\nWe\'ll send you tracking information once your order ships.',
      footer: 'Thank you for shopping with us!',
      buttons: ['Track Order']
    }
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    category: 'UTILITY',
    description: 'Remind customers about upcoming appointments',
    language: 'en_GB',
    components: [
      {
        type: 'BODY',
        text: 'Hi {{1}}, this is a reminder about your appointment:\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n📍 Location: {{4}}\n\nPlease arrive 10 minutes early. Reply YES to confirm or NO to reschedule.'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'Confirm'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Reschedule'
          }
        ]
      }
    ],
    preview: {
      body: 'Hi [Customer Name], this is a reminder about your appointment:\n\n📅 Date: [Date]\n⏰ Time: [Time]\n📍 Location: [Location]\n\nPlease arrive 10 minutes early. Reply YES to confirm or NO to reschedule.',
      buttons: ['Confirm', 'Reschedule']
    }
  },
  {
    id: 'shipping-update',
    name: 'Shipping Update',
    category: 'UTILITY',
    description: 'Notify customers about shipping status',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'IMAGE'
      },
      {
        type: 'BODY',
        text: 'Good news {{1}}! Your order #{{2}} has been shipped.\n\nTracking Number: {{3}}\nEstimated Delivery: {{4}}\n\nYou can track your package using the button below.'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Track Package',
            url: 'https://example.com/track/{{1}}'
          }
        ]
      }
    ],
    preview: {
      body: 'Good news [Customer Name]! Your order #[Order ID] has been shipped.\n\nTracking Number: [Tracking Number]\nEstimated Delivery: [Date]\n\nYou can track your package using the button below.',
      buttons: ['Track Package']
    }
  },
  {
    id: 'payment-receipt',
    name: 'Payment Receipt',
    category: 'UTILITY',
    description: 'Send payment confirmation and receipt',
    language: 'en',
    components: [
      {
        type: 'HEADER',
        format: 'DOCUMENT'
      },
      {
        type: 'BODY',
        text: 'Thank you {{1}}! Your payment has been received.\n\nPayment ID: {{2}}\nAmount: {{3}}\nDate: {{4}}\n\nYour receipt is attached above.'
      },
      {
        type: 'FOOTER',
        text: 'Keep this receipt for your records'
      }
    ],
    preview: {
      body: 'Thank you [Customer Name]! Your payment has been received.\n\nPayment ID: [Payment ID]\nAmount: [Amount]\nDate: [Date]\n\nYour receipt is attached above.',
      footer: 'Keep this receipt for your records'
    }
  },
  {
    id: 'customer-support',
    name: 'Customer Support Response',
    category: 'UTILITY',
    description: 'Respond to customer support inquiries',
    language: 'en',
    components: [
      {
        type: 'BODY',
        text: 'Hi {{1}}, thank you for contacting our support team.\n\nTicket ID: {{2}}\nIssue: {{3}}\n\nOur team is reviewing your request and will get back to you within 24 hours.'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'PHONE_NUMBER',
            text: 'Call Support',
            phone_number: '+1234567890'
          },
          {
            type: 'URL',
            text: 'View Ticket',
            url: 'https://support.example.com/ticket/{{1}}'
          }
        ]
      }
    ],
    preview: {
      body: 'Hi [Customer Name], thank you for contacting our support team.\n\nTicket ID: [Ticket ID]\nIssue: [Issue]\n\nOur team is reviewing your request and will get back to you within 24 hours.',
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
        format: 'IMAGE'
      },
      {
        type: 'BODY',
        text: '🎉 Hi {{1}}! Our {{2}} Sale is here!\n\nEnjoy {{3}}% off on all products. Use code: {{4}} at checkout.\n\nHurry! Offer valid only until {{5}}.',
        example: {
          body_text: [
            ["customer", "Summer", "25", "SALE25", "end of the month"]
          ]
        }
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to unsubscribe from promotional messages'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Shop Now',
            url: 'https://example.com/sale'
          }
        ]
      }
    ],
    preview: {
      body: '🎉 Hi [Customer Name]! Our [Season] Sale is here!\n\nEnjoy [Discount]% off on all products. Use code: [Code] at checkout.\n\nHurry! Offer valid only until [Date].',
      footer: 'Reply STOP to unsubscribe from promotional messages',
      buttons: ['Shop Now']
    }
  },
  {
    id: 'new-product-launch',
    name: 'New Product Launch',
    category: 'MARKETING',
    description: 'Announce new product launches',
    language: 'en_US',
    components: [
      {
        type: 'HEADER',
        format: 'VIDEO'
      },
      {
        type: 'BODY',
        text: 'Introducing {{1}} - Our Latest Innovation! \n\nHi {{2}}, be among the first to experience {{3}}.\n\nSpecial launch price: {{4}} (Regular: {{5}})\n\nLimited stock available!',
        example: {
          body_text: [
            ["New Product", "customer", "amazing features", "$99", "$129"]
          ]
        }
      },
      {
        type: 'FOOTER',
        text: 'Text STOP to opt-out of marketing messages'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Learn More',
            url: 'https://example.com/product/{{1}}'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Not Interested'
          }
        ]
      }
    ],
    preview: {
      body: 'Introducing [Product Name] - Our Latest Innovation! \n\nHi [Customer Name], be among the first to experience [Feature].\n\nSpecial launch price: [Price] (Regular: [Regular Price])\n\nLimited stock available!',
      footer: 'Text STOP to opt-out of marketing messages',
      buttons: ['Learn More', 'Not Interested']
    }
  },
  {
    id: 'abandoned-cart',
    name: 'Abandoned Cart Reminder',
    category: 'MARKETING',
    description: 'Remind customers about items left in cart',
    language: 'en_GB',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'You left something behind {{1}}! '
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, you have {{2}} items in your cart worth {{3}}.\n\nComplete your purchase now and get {{4}}% off with code: COMEBACK\n\nYour cart will expire in 24 hours.',
        example: {
          body_text: [
            ["customer", "3", "$50", "10"]
          ]
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
            text: 'Complete Purchase',
            url: 'https://example.com/cart'
          }
        ]
      }
    ],
    preview: {
      header: 'You left something behind [Customer Name]!',
      body: 'Hi [Customer Name], you have [Number] items in your cart worth [Amount].\n\nComplete your purchase now and get [Discount]% off with code: COMEBACK\n\nYour cart will expire in 24 hours.',
      footer: 'Reply STOP to unsubscribe',
      buttons: ['Complete Purchase']
    }
  },
  {
    id: 'loyalty-reward',
    name: 'Loyalty Program Reward',
    category: 'MARKETING',
    description: 'Notify customers about loyalty rewards',
    language: 'en_GB',
    components: [
      {
        type: 'BODY',
        text: ' Congratulations {{1}}!\n\nYou\'ve earned {{2}} loyalty points. Your total balance is now {{3}} points.\n\nRedeem {{4}} points to get {{5}} off your next purchase!',
        example: {
          body_text: [
            ["customer", "100", "500", "200", "$10"]
          ]
        }
      },
      {
        type: 'FOOTER',
        text: 'To opt-out of rewards notifications, reply STOP'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'View Rewards',
            url: 'https://example.com/rewards'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Check Balance'
          }
        ]
      }
    ],
    preview: {
      body: ' Congratulations [Customer Name]!\n\nYou\'ve earned [Points] loyalty points. Your total balance is now [Total] points.\n\nRedeem [Required Points] points to get [Discount] off your next purchase!',
      footer: 'To opt-out of rewards notifications, reply STOP',
      buttons: ['View Rewards', 'Check Balance']
    }
  },
  {
    id: 'feedback-request',
    name: 'Customer Feedback Request',
    category: 'MARKETING',
    description: 'Request feedback after purchase or service',
    language: 'en_GB',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'We value your opinion! '
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, thank you for your recent purchase of {{2}}.\n\nHow was your experience? Your feedback helps us improve our service.\n\nRate us from 1-5 stars:',
        example: {
          body_text: [
            ["customer", "product"]
          ]
        }
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to opt-out of feedback requests'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: '⭐⭐⭐⭐⭐'
          },
          {
            type: 'QUICK_REPLY',
            text: '⭐⭐⭐⭐'
          },
          {
            type: 'QUICK_REPLY',
            text: '⭐⭐⭐'
          }
        ]
      }
    ],
    preview: {
      header: 'We value your opinion! 💭',
      body: 'Hi [Customer Name], thank you for your recent purchase of [Product].\n\nHow was your experience? Your feedback helps us improve our service.\n\nRate us from 1-5 stars:',
      footer: 'Reply STOP to opt-out of feedback requests',
      buttons: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐']
    }
  },

  // AUTHENTICATION TEMPLATES
  {
    id: 'otp_verification',
    name: 'OTP Verification',
    category: 'AUTHENTICATION',
    description: 'Send a one-time password for verification',
    language: 'en',
    add_security_recommendation: true,
    code_expiration_minutes: 10,
    components: [
      {
        type: 'BODY',
        text: 'Your verification code is {{1}}. This code will expire in 10 minutes. If you did not request this code, please ignore this message.'
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
      body: 'Your verification code is [123456]. This code will expire in 10 minutes. If you did not request this code, please ignore this message.',
      buttons: ['Copy Code']
    }
  },
  {
    id: 'account-verification',
    name: 'Account Verification',
    category: 'AUTHENTICATION',
    description: 'Verify new account registration',
    language: 'en_US',
    add_security_recommendation: true,
    code_expiration_minutes: 30,
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Welcome to {{1}}! '
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, please verify your account to get started.\n\nYour verification code is: {{2}}\n\nEnter this code in the app to complete registration.'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'OTP',
            otp_type: 'COPY_CODE',
            text: 'Copy Code'
          }
        ]
      }
    ],
    preview: {
      header: 'Welcome to [App Name]!',
      body: 'Hi [Customer Name], please verify your account to get started.\n\nYour verification code is: [Code]\n\nEnter this code in the app to complete registration.',
      buttons: ['Copy Code']
    }
  },
  {
    id: 'transaction-authentication',
    name: 'Transaction Authentication',
    category: 'AUTHENTICATION',
    description: 'Require users to authenticate a transaction',
    language: 'en',
    add_security_recommendation: true,
    code_expiration_minutes: 30,
    components: [
      {
        type: 'BODY',
        text: 'Please approve the following transaction:\n\nMerchant: {{1}}\nAmount: {{2}}\n\nUse the code {{3}} to complete your transaction. This code expires in 30 minutes.'
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
      body: 'Please approve the following transaction:\n\nMerchant: [Merchant]\nAmount: [Amount]\n\nUse the code [Code] to complete your transaction. This code expires in 30 minutes.',
      buttons: ['Copy Code']
    }
  },
  {
    id: 'reservation-otp',
    name: 'Reservation OTP',
    category: 'AUTHENTICATION',
    description: 'Send an OTP to confirm a reservation',
    language: 'en',
    add_security_recommendation: true,
    code_expiration_minutes: 5,
    components: [
      {
        type: 'BODY',
        text: 'Your reservation code is {{1}}. Please show this code upon arrival. This code is valid for 5 minutes.'
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
      body: 'Your reservation code is [Code]. Please show this code upon arrival. This code is valid for 5 minutes.',
      buttons: ['Copy Code']
    }
  }
]