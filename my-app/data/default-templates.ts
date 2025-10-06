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
        text: 'Hi {{1}}, thank you for your order!\n\nOrder ID: {{2}}\nTotal Amount: {{3}}\nEstimated Delivery: {{4}}\n\nWe\'ll send you tracking information once your order ships.',
        example: {
          body_text: [['John Doe', '#12345', '$99.99', 'March 15']]
        }
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
      body: 'Hi John Doe, thank you for your order!\n\nOrder ID: #12345\nTotal Amount: $99.99\nEstimated Delivery: March 15\n\nWe\'ll send you tracking information once your order ships.',
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
        text: 'Hi {{1}}, this is a reminder about your appointment:\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n📍 Location: {{4}}\n\nPlease arrive 10 minutes early.',
        example: {
          body_text: [['John Doe', 'March 15, 2025', '2:00 PM', '123 Main St']]
        }
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
      body: 'Hi John Doe, this is a reminder about your appointment:\n\n📅 Date: March 15, 2025\n⏰ Time: 2:00 PM\n📍 Location: 123 Main St\n\nPlease arrive 10 minutes early.',
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
        text: 'Good news {{1}}! Your order #{{2}} has been shipped.\n\nTracking Number: {{3}}\nEstimated Delivery: {{4}}\n\nYou can track your package using the button below.',
        example: {
          body_text: [['John Doe', '12345', 'TRK98765XYZ', 'March 20, 2025']]
        }
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
      body: 'Good news John Doe! Your order #12345 has been shipped.\n\nTracking Number: TRK98765XYZ\nEstimated Delivery: March 20, 2025\n\nYou can track your package using the button below.',
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
        text: 'Thank you {{1}}! Your payment has been received.\n\nPayment ID: {{2}}\nAmount: {{3}}\nDate: {{4}}\n\nYour receipt is attached above.',
        example: {
          body_text: [['John Doe', 'PAY-12345', '$99.99', 'March 10, 2025']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Keep this receipt for your records'
      }
    ],
    preview: {
      body: 'Thank you John Doe! Your payment has been received.\n\nPayment ID: PAY-12345\nAmount: $99.99\nDate: March 10, 2025\n\nYour receipt is attached above.',
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
        format: 'IMAGE'
      },
      {
        type: 'BODY',
        text: '🎉 Hi {{1}}! Our {{2}} Sale is here!\n\nEnjoy {{3}}% off on all products. Use code: {{4}} at checkout.\n\nHurry! Offer valid only until {{5}}.',
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
      body: '🎉 Hi John! Our Summer Sale is here!\n\nEnjoy 25% off on all products. Use code: SALE25 at checkout.\n\nHurry! Offer valid only until March 31.',
      footer: 'Reply STOP to unsubscribe',
      buttons: ['Shop Now', 'Unsubscribe']
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
          body_text: [['SmartWidget Pro', 'John', 'amazing features', '$99', '$129']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to opt-out'
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
      body: 'Introducing SmartWidget Pro - Our Latest Innovation! \n\nHi John, be among the first to experience amazing features.\n\nSpecial launch price: $99 (Regular: $129)\n\nLimited stock available!',
      footer: 'Reply STOP to opt-out',
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
        text: 'You left something behind!'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, you have {{2}} items in your cart worth {{3}}.\n\nComplete your purchase now and get {{4}}% off with code: COMEBACK\n\nYour cart will expire in 24 hours.',
        example: {
          body_text: [['John', '3', '$50', '10']]
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
          },
          {
            type: 'QUICK_REPLY',
            text: 'Unsubscribe'
          }
        ]
      }
    ],
    preview: {
      header: 'You left something behind!',
      body: 'Hi John, you have 3 items in your cart worth $50.\n\nComplete your purchase now and get 10% off with code: COMEBACK\n\nYour cart will expire in 24 hours.',
      footer: 'Reply STOP to unsubscribe',
      buttons: ['Complete Purchase', 'Unsubscribe']
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
        text: '🎁 Congratulations {{1}}!\n\nYou\'ve earned {{2}} loyalty points. Your total balance is now {{3}} points.\n\nRedeem {{4}} points to get {{5}} off your next purchase!',
        example: {
          body_text: [['John', '100', '500', '200', '$10']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to opt-out'
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
            text: 'Unsubscribe'
          }
        ]
      }
    ],
    preview: {
      body: '🎁 Congratulations John!\n\nYou\'ve earned 100 loyalty points. Your total balance is now 500 points.\n\nRedeem 200 points to get $10 off your next purchase!',
      footer: 'Reply STOP to opt-out',
      buttons: ['View Rewards', 'Unsubscribe']
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
        text: 'We value your opinion!'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, thank you for your recent purchase of {{2}}.\n\nHow was your experience? Your feedback helps us improve our service.\n\nRate us from 1-5 stars:',
        example: {
          body_text: [['John', 'SmartWidget']]
        }
      },
      {
        type: 'FOOTER',
        text: 'Reply STOP to opt-out'
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
            text: 'Unsubscribe'
          }
        ]
      }
    ],
    preview: {
      header: 'We value your opinion!',
      body: 'Hi John, thank you for your recent purchase of SmartWidget.\n\nHow was your experience? Your feedback helps us improve our service.\n\nRate us from 1-5 stars:',
      footer: 'Reply STOP to opt-out',
      buttons: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', 'Unsubscribe']
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
        text: '{{1}} is your verification code. It will expire in 10 minutes.'
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
      body: '123456 is your verification code. It will expire in 10 minutes.',
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
        text: 'Welcome to MyApp'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, please verify your account.\n\nYour verification code is: {{2}}\n\nEnter this code in the app to complete registration.'
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
      header: 'Welcome to MyApp',
      body: 'Hi John, please verify your account.\n\nYour verification code is: 123456\n\nEnter this code in the app to complete registration.',
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
    code_expiration_minutes: 5,
    components: [
      {
        type: 'BODY',
        text: 'Approve transaction:\n\nMerchant: {{1}}\nAmount: {{2}}\n\nCode: {{3}}\n\nExpires in 5 minutes.'
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
        text: 'Your reservation code is {{1}}. Show this upon arrival. Valid for 5 minutes.'
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
      body: 'Your reservation code is ABC123. Show this upon arrival. Valid for 5 minutes.',
      buttons: ['Copy Code']
    }
  }
]