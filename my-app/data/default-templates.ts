export interface DefaultTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  description: string;
  components: {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    example?: any;
    buttons?: any[];
  }[];
  preview: {
    headerText?: string;
    bodyText: string;
    footerText?: string;
    buttons?: string[];
  };
}

export const defaultTemplates: DefaultTemplate[] = [
  {
    id: 'welcome_new_customer',
    name: 'Welcome New Customer',
    category: 'MARKETING',
    description: 'Welcome message for new customers',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Welcome to {{1}}!'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, thank you for choosing {{2}}! We\'re excited to have you on board. Our team is here to help you get started.'
      },
      {
        type: 'FOOTER',
        text: 'Need help? Reply to this message'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'Get Started'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Contact Support'
          }
        ]
      }
    ],
    preview: {
      headerText: 'Welcome to Your Business!',
      bodyText: 'Hi John, thank you for choosing Your Business! We\'re excited to have you on board. Our team is here to help you get started.',
      footerText: 'Need help? Reply to this message',
      buttons: ['Get Started', 'Contact Support']
    }
  },
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    category: 'UTILITY',
    description: 'Confirm customer orders',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Order Confirmed! 📦'
      },
      {
        type: 'BODY',
        text: 'Great news {{1}}! Your order #{{2}} has been confirmed and will be processed within 24 hours.\n\nOrder Total: {{3}}\nEstimated Delivery: {{4}}'
      },
      {
        type: 'FOOTER',
        text: 'Track your order anytime'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Track Order',
            url: 'https://example.com/track/{{1}}'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Contact Us'
          }
        ]
      }
    ],
    preview: {
      headerText: 'Order Confirmed! 📦',
      bodyText: 'Great news John! Your order #12345 has been confirmed and will be processed within 24 hours.\n\nOrder Total: $99.99\nEstimated Delivery: 3-5 business days',
      footerText: 'Track your order anytime',
      buttons: ['Track Order', 'Contact Us']
    }
  },
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    category: 'UTILITY',
    description: 'Remind customers about upcoming appointments',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Appointment Reminder'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, this is a reminder that you have an appointment scheduled for {{2}} at {{3}}.\n\nLocation: {{4}}\n\nPlease arrive 10 minutes early.'
      },
      {
        type: 'FOOTER',
        text: 'Need to reschedule? Let us know'
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
          },
          {
            type: 'QUICK_REPLY',
            text: 'Cancel'
          }
        ]
      }
    ],
    preview: {
      headerText: 'Appointment Reminder',
      bodyText: 'Hi Sarah, this is a reminder that you have an appointment scheduled for Tomorrow at 2:00 PM.\n\nLocation: 123 Main St, City\n\nPlease arrive 10 minutes early.',
      footerText: 'Need to reschedule? Let us know',
      buttons: ['Confirm', 'Reschedule', 'Cancel']
    }
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    category: 'AUTHENTICATION',
    description: 'Send password reset verification code',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Password Reset Request'
      },
      {
        type: 'BODY',
        text: 'Hello {{1}}, you requested to reset your password. Your verification code is: {{2}}\n\nThis code will expire in 10 minutes. If you didn\'t request this, please ignore this message.'
      },
      {
        type: 'FOOTER',
        text: 'Keep your account secure'
      }
    ],
    preview: {
      headerText: 'Password Reset Request',
      bodyText: 'Hello Alex, you requested to reset your password. Your verification code is: 123456\n\nThis code will expire in 10 minutes. If you didn\'t request this, please ignore this message.',
      footerText: 'Keep your account secure'
    }
  },
  {
    id: 'shipping_update',
    name: 'Shipping Update',
    category: 'UTILITY',
    description: 'Notify customers about shipping status',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Your Order is on the Way! 🚚'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, your order #{{2}} has been shipped and is on its way to you!\n\nTracking Number: {{3}}\nExpected Delivery: {{4}}'
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
      headerText: 'Your Order is on the Way! 🚚',
      bodyText: 'Hi Maria, your order #67890 has been shipped and is on its way to you!\n\nTracking Number: TRK123456789\nExpected Delivery: Friday, Dec 15',
      buttons: ['Track Package']
    }
  },
  {
    id: 'promotional_offer',
    name: 'Promotional Offer',
    category: 'MARKETING',
    description: 'Share special offers and promotions',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: '🎉 Special Offer Just for You!'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, we have an exclusive offer just for you!\n\nGet {{2}}% off your next purchase with code: {{3}}\n\nOffer valid until {{4}}. Don\'t miss out!'
      },
      {
        type: 'FOOTER',
        text: 'Terms and conditions apply'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Shop Now',
            url: 'https://example.com/shop'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Learn More'
          }
        ]
      }
    ],
    preview: {
      headerText: '🎉 Special Offer Just for You!',
      bodyText: 'Hi David, we have an exclusive offer just for you!\n\nGet 25% off your next purchase with code: SAVE25\n\nOffer valid until December 31st. Don\'t miss out!',
      footerText: 'Terms and conditions apply',
      buttons: ['Shop Now', 'Learn More']
    }
  },
  {
    id: 'delivery_notification',
    name: 'Delivery Notification',
    category: 'UTILITY',
    description: 'Notify customers when their order is delivered',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Package Delivered Successfully! ✅'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, your order #{{2}} has been delivered to {{3}}.\n\nDelivered at: {{4}}\n\nWe hope you enjoy your purchase!'
      },
      {
        type: 'FOOTER',
        text: 'Thank you for choosing us'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'QUICK_REPLY',
            text: 'Rate Experience'
          },
          {
            type: 'URL',
            text: 'Shop Again',
            url: 'https://example.com/shop'
          }
        ]
      }
    ],
    preview: {
      headerText: 'Package Delivered Successfully! ✅',
      bodyText: 'Hi Emma, your order #98765 has been delivered to 456 Oak Avenue.\n\nDelivered at: Today, 3:45 PM\n\nWe hope you enjoy your purchase!',
      footerText: 'Thank you for choosing us',
      buttons: ['Rate Experience', 'Shop Again']
    }
  },
  {
    id: 'event_reminder',
    name: 'Event Reminder',
    category: 'MARKETING',
    description: 'Remind customers about upcoming events',
    components: [
      {
        type: 'HEADER',
        format: 'TEXT',
        text: 'Don\'t Miss Out! 🎪'
      },
      {
        type: 'BODY',
        text: 'Hi {{1}}, just a friendly reminder about our upcoming {{2}} event!\n\nDate: {{3}}\nTime: {{4}}\nLocation: {{5}}\n\nWe can\'t wait to see you there!'
      },
      {
        type: 'FOOTER',
        text: 'Save the date!'
      },
      {
        type: 'BUTTONS',
        buttons: [
          {
            type: 'URL',
            text: 'Event Details',
            url: 'https://example.com/event/{{1}}'
          },
          {
            type: 'QUICK_REPLY',
            text: 'Add to Calendar'
          }
        ]
      }
    ],
    preview: {
      headerText: 'Don\'t Miss Out! 🎪',
      bodyText: 'Hi Lisa, just a friendly reminder about our upcoming Summer Sale event!\n\nDate: August 15, 2025\nTime: 10:00 AM - 6:00 PM\nLocation: Downtown Store\n\nWe can\'t wait to see you there!',
      footerText: 'Save the date!',
      buttons: ['Event Details', 'Add to Calendar']
    }
  }
];
