/**
 * WhatsApp Template Creator Utility
 * Follows Meta's official documentation for template creation
 * https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION'
  text?: string
  example?: any
  buttons?: TemplateButton[]
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'PHONE_NUMBER' | 'URL' | 'OTP' | 'COPY_CODE' | 'FLOW'
  text?: string
  phone_number?: string
  url?: string
  otp_type?: string
  example?: string[] | string
}

export interface TemplateData {
  name: string
  language: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  add_security_recommendation?: boolean;
  code_expiration_minutes?: number;
  components: TemplateComponent[]
}

export class TemplateCreationHandler {
  /**
   * Creates a properly formatted WhatsApp template according to Meta's specifications
   */
  static createTemplate(templateData: any): TemplateData {
    const components: TemplateComponent[] = []

    // Add header component
    if (templateData.headerType && templateData.headerType !== "NONE") {
      const headerComponent = this.createHeaderComponent(templateData)
      if (headerComponent) {
        components.push(headerComponent)
      }
    }

    // Add body component (required)
    const bodyComponent = this.createBodyComponent(templateData)
    components.push(bodyComponent)

    // Add footer component
    if (templateData.category !== 'AUTHENTICATION') {
      if (templateData.footer?.trim()) {
        const footerComponent = this.createFooterComponent(templateData.footer, templateData.category)
        if (footerComponent) {
          components.push(footerComponent)
        }
      } else if (templateData.category === 'MARKETING') {
        // Auto-add opt-out footer for marketing templates
        const footerComponent = this.createFooterComponent(undefined, templateData.category)
        if (footerComponent) {
          components.push(footerComponent)
        }
      }
    }

    // Add buttons component
    if (templateData.buttonType !== "NONE" && templateData.buttons?.length > 0) {
      const buttonsComponent = this.createButtonsComponent(templateData)
      if (buttonsComponent) {
        components.push(buttonsComponent)
      }
    }

    // Validate template based on category
    this.validateTemplate(templateData.category, components)

    const result: TemplateData = {
      name: this.sanitizeTemplateName(templateData.name),
      language: templateData.language || 'en_US',
      category: templateData.category,
      components
    };

    if (templateData.category === 'AUTHENTICATION') {
      if (templateData.add_security_recommendation) {
        result.add_security_recommendation = true;
      }
      if (templateData.code_expiration_minutes) {
        result.code_expiration_minutes = templateData.code_expiration_minutes;
      }
    }

    return result;
  }

  /**
   * Creates header component based on type
   */
  private static createHeaderComponent(templateData: any): TemplateComponent | null {
    const { headerType, headerText, headerVariables, headerMediaHandle, customVariableValues } = templateData

    switch (headerType) {
      case 'TEXT':
        if (!headerText?.trim()) return null
        
        // For authentication templates, remove emojis from header
        let cleanHeaderText = headerText
        if (templateData.category === 'AUTHENTICATION') {
          cleanHeaderText = this.removeEmojis(headerText)
        }

        const headerComponent: TemplateComponent = {
          type: 'HEADER',
          format: 'TEXT',
          text: cleanHeaderText
        }

        // Add examples for variables
        if (headerVariables?.length > 0) {
          const exampleValues = headerVariables.map((variable: any, i: number) => {
            const key = variable.replace(/[{}]/g, '')
            
            // Use custom values if available
            if (customVariableValues && customVariableValues[key]) {
              return customVariableValues[key]
            }
            
            // Generate meaningful examples
            if (key.toLowerCase().includes('company') || key.includes('1')) {
              return 'YourCompany'
            } else if (key.toLowerCase().includes('name')) {
              return 'John'
            } else {
              return `Sample${i + 1}`
            }
          })
          
          headerComponent.example = {
            header_text: exampleValues
          }
        }

        return headerComponent

      case 'IMAGE':
      case 'VIDEO':
      case 'DOCUMENT':
        if (!headerMediaHandle) {
          throw new Error(`Media handle is required for ${headerType} header. Please upload media first.`)
        }

        // Validate the media handle format
        if (!this.validateMediaHandle(headerMediaHandle, headerType)) {
          throw new Error(`Invalid media handle for ${headerType} header. Please upload media again to get a valid handle.`)
        }

        return {
          type: 'HEADER',
          format: headerType as any,
          example: {
            header_handle: [headerMediaHandle] // Dynamic handle from upload API response
          }
        }

      case 'LOCATION':
        return {
          type: 'HEADER',
          format: 'LOCATION'
        }

      default:
        return null
    }
  }

  /**
   * Creates body component with proper variable examples
   */
  private static createBodyComponent(templateData: any): TemplateComponent {
    const { body, bodyVariables, customVariableValues, category } = templateData;

    const bodyComponent: TemplateComponent = {
      type: 'BODY',
    };

    const hasVariables = bodyVariables?.length > 0;

    if (hasVariables) {
      const exampleValues = bodyVariables.map((variable: any, i: number) => {
        const key = variable.replace(/[{}]/g, '');
        if (customVariableValues && customVariableValues[key]) {
          return customVariableValues[key];
        }
        if (key.toLowerCase().includes('name') || key.includes('1')) return 'John Doe';
        if (key.toLowerCase().includes('order') || key.includes('2')) return '#12345';
        if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.includes('3')) return '$99.99';
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.includes('4')) return 'March 15';
        if (key.toLowerCase().includes('code') || key.toLowerCase().includes('track')) return 'ABC123';
        return `Sample${i + 1}`;
      });
      
      bodyComponent.example = {
        body_text: [exampleValues],
      };
    } else if (category === 'MARKETING' || category === 'UTILITY') {
      // Marketing and Utility templates ALWAYS need an example field, even without variables
      // For templates without variables, provide an array with a single element
      const exampleText = body?.substring(0, 60) || 'Sample message';
      bodyComponent.example = {
        body_text: [[exampleText]]
      };
    }

    // Add the 'text' property based on Meta's rules:
    // - ALWAYS for non-AUTHENTICATION templates.
    // - ONLY for AUTHENTICATION templates if they DO NOT have variables.
    if (category !== 'AUTHENTICATION' || !hasVariables) {
      bodyComponent.text = body;
    }

    return bodyComponent;
  }

  /**
   * Creates footer component with proper opt-out requirements
   */
  private static createFooterComponent(footerText?: string, category?: string): TemplateComponent | null {
    if (!footerText?.trim()) {
      // For marketing templates, auto-add opt-out footer if missing
      if (category === 'MARKETING') {
        return {
          type: 'FOOTER',
          text: 'Reply STOP to opt out'
        }
      }
      return null
    }

    return {
      type: 'FOOTER',
      text: footerText.substring(0, 60) // Max 60 characters
    }
  }

  /**
   * Creates buttons component with proper validation
   */
  private static createButtonsComponent(templateData: any): TemplateComponent | null {
    const { buttonType, buttons, category } = templateData

    if (!buttons?.length) return null

    let formattedButtons: TemplateButton[] = []

    for (const button of buttons) {
      const formattedButton = this.formatButton(button, buttonType, category)
      if (formattedButton) {
        formattedButtons.push(formattedButton)
      }
    }

    if (category === 'AUTHENTICATION') {
      if (formattedButtons.length !== 1 || formattedButtons[0].type !== 'OTP') {
        // Find the valid OTP button or create a default one if none is valid
        const otpButton = buttons.find((b: any) => b.type === 'OTP');
        if (otpButton) {
          formattedButtons = [{
            type: 'OTP',
            text: otpButton.text || 'Copy Code',
            otp_type: 'COPY_CODE'
          }];
        } else {
          // If no valid OTP button is found, you might want to throw an error
          // or just use a default, depending on desired behavior.
          // Here, we'll default to a single valid OTP button.
          formattedButtons = [{
            type: 'OTP',
            text: 'Copy Code',
            otp_type: 'COPY_CODE'
          }];
        }
      }
    }
    
    if (formattedButtons.length === 0) return null

    return {
      type: 'BUTTONS',
      buttons: formattedButtons
    }
  }

  /**
   * Formats individual button according to Meta specs
   */
  private static formatButton(button: any, buttonType: string, category: string): TemplateButton | null {
    switch (button.type) {
      case 'QUICK_REPLY':
        return {
          type: 'QUICK_REPLY',
          text: button.text?.substring(0, 25) || 'Reply' // Max 25 characters
        }

      case 'PHONE_NUMBER':
        return {
          type: 'PHONE_NUMBER',
          text: button.text?.substring(0, 25) || 'Call',
          phone_number: button.phone_number
        }

      case 'URL':
        const urlButton: TemplateButton = {
          type: 'URL',
          text: button.text?.substring(0, 25) || 'Visit',
          url: button.url
        }

        // Add example if URL contains variables
        if (button.url?.includes('{{1}}')) {
          // Match the variable pattern with meaningful examples
          let exampleValue = button.example || 'default-value'
          
          // Generate contextual examples based on URL pattern
          if (button.url.includes('order') || button.url.includes('purchase')) {
            exampleValue = button.example || 'ORD12345'
          } else if (button.url.includes('track') || button.url.includes('status')) {
            exampleValue = button.example || 'TRK98765'
          } else if (button.url.includes('product') || button.url.includes('item')) {
            exampleValue = button.example || 'PROD456'
          } else if (button.url.includes('user') || button.url.includes('profile')) {
            exampleValue = button.example || 'USR789'
          }
          
          urlButton.example = [exampleValue]
        }

        return urlButton

      case 'OTP':
        // For AUTHENTICATION templates, an OTP button is a special type of COPY_CODE button.
        if (category === 'AUTHENTICATION') {
          return {
            type: 'COPY_CODE',
            example: '123456' // Example is required for COPY_CODE buttons
          };
        }
        // If not an AUTH template, an OTP button is not valid in this context.
        return null;

      case 'COPY_CODE':
        // This is for a generic "copy code" button, not the OTP-specific one.
        return {
          type: 'COPY_CODE',
          example: button.example || 'EXAMPLE_CODE',
        };

      default:
        return null
    }
  }

  /**
   * Validates template according to category rules
   */
  private static validateTemplate(category: string, components: TemplateComponent[]): void {
    switch (category) {
      case 'MARKETING':
        // Marketing templates must have opt-out option
        const hasOptOut = components.some(component => 
          component.type === 'BUTTONS' && 
          component.buttons?.some(button => 
            button.type === 'QUICK_REPLY' && 
            (button.text?.toLowerCase().includes('stop') || 
             button.text?.toLowerCase().includes('unsubscribe'))
          )
        )
        
        if (!hasOptOut) {
          console.warn('Marketing templates should include an opt-out button for best practices')
        }
        break

      case 'AUTHENTICATION':
        // Authentication templates cannot have emojis in header
        const headerComponent = components.find(c => c.type === 'HEADER')
        if (headerComponent?.text && this.containsEmojis(headerComponent.text)) {
          throw new Error('Authentication templates cannot contain emojis in header text')
        }
        break

      case 'UTILITY':
        // Utility templates are more flexible, no specific restrictions
        break
    }
  }

  /**
   * Sanitizes template name according to Meta requirements
   */
  private static sanitizeTemplateName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 512) // Max length
  }

  /**
   * Removes emojis from text
   */
  private static removeEmojis(text: string): string {
    // Emoji regex pattern compatible with ES5
    const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
    return text.replace(emojiRegex, '')
  }

  /**
   * Checks if text contains emojis
   */
  private static containsEmojis(text: string): boolean {
    const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/
    return emojiRegex.test(text)
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

    // Basic validation for Meta media handle format
    // Meta handles typically start with a number followed by a colon
    const handlePattern = /^\d+:[a-zA-Z0-9+/=]+$/;
    return handlePattern.test(handle);
  }

  /**
   * Creates sample template structures for different categories
   */
  static createSampleTemplates() {
    return {
      authentication: {
        name: "account_verification",
        language: "en_US",
        category: "AUTHENTICATION",
        components: [
          {
            type: "HEADER",
            format: "TEXT",
            text: "Welcome to YourApp", // No emojis
            example: {
              header_text: ["YourCompany"]
            }
          },
          {
            type: "BODY",
            text: "Your verification code is {{1}}. This code expires in 10 minutes.",
            example: {
              body_text: [["123456"]]
            }
          },
          {
            type: "BUTTONS",
            buttons: [{
              type: "OTP",
              otp_type: "COPY_CODE",
              text: "Copy Code"
            }]
          }
        ]
      },

      marketing: {
        name: "seasonal_promotion",
        language: "en_US",
        category: "MARKETING",
        components: [
          {
            type: "HEADER",
            format: "IMAGE",
            example: {
              header_handle: ["DYNAMIC_HANDLE_FROM_UPLOAD"] // Media handle dynamically fetched from upload API
            }
          },
          {
            type: "BODY",
            text: "🎉 Our {{1}} sale is now live! Get {{2}} off everything. Use code {{3}}",
            example: {
              body_text: [["Summer", "25%", "SAVE25"]]
            }
          },
          {
            type: "FOOTER",
            text: "Valid until end of month. Terms apply."
          },
          {
            type: "BUTTONS",
            buttons: [
              {
                type: "URL",
                text: "Shop Now",
                url: "https://yourstore.com/sale"
              },
              {
                type: "QUICK_REPLY",
                text: "Unsubscribe"
              }
            ]
          }
        ]
      },

      utility: {
        name: "order_confirmation",
        language: "en_US",
        category: "UTILITY",
        components: [
          {
            type: "HEADER",
            format: "DOCUMENT",
            example: {
              header_handle: ["DYNAMIC_HANDLE_FROM_UPLOAD"] // Media handle dynamically fetched from upload API
            }
          },
          {
            type: "BODY",
            text: "Hi {{1}}, your order {{2}} has been confirmed. Total: {{3}}. Estimated delivery: {{4}}",
            example: {
              body_text: [["John", "#12345", "$99.99", "March 15"]]
            }
          },
          {
            type: "BUTTONS",
            buttons: [
              {
                type: "PHONE_NUMBER",
                text: "Call Support",
                phone_number: "15551234567"
              },
              {
                type: "URL",
                text: "Track Order",
                url: "https://yourstore.com/track/{{1}}",
                example: ["12345"]
              }
            ]
          }
        ]
      }
    }
  }
}
