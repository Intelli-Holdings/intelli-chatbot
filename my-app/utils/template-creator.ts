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
  example?: string[]
}

export interface TemplateData {
  name: string
  language: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
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
    if (templateData.footer?.trim()) {
      components.push(this.createFooterComponent(templateData.footer))
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

    return {
      name: this.sanitizeTemplateName(templateData.name),
      language: templateData.language || 'en_US',
      category: templateData.category,
      components
    }
  }

  /**
   * Creates header component based on type
   */
  private static createHeaderComponent(templateData: any): TemplateComponent | null {
    const { headerType, headerText, headerVariables, headerMediaHandle } = templateData

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
          headerComponent.example = {
            header_text: headerVariables.map((_: any, i: number) => `Sample ${i + 1}`)
          }
        }

        return headerComponent

      case 'IMAGE':
      case 'VIDEO':
      case 'DOCUMENT':
        if (!headerMediaHandle) {
          throw new Error(`Media handle is required for ${headerType} header`)
        }

        return {
          type: 'HEADER',
          format: headerType as any,
          example: {
            header_handle: [headerMediaHandle]
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
    const { body, bodyVariables } = templateData

    const bodyComponent: TemplateComponent = {
      type: 'BODY',
      text: body
    }

    // Add examples for variables - Note the nested array structure
    if (bodyVariables?.length > 0) {
      bodyComponent.example = {
        body_text: [bodyVariables.map((_: any, i: number) => `Example ${i + 1}`)]
      }
    }

    return bodyComponent
  }

  /**
   * Creates footer component
   */
  private static createFooterComponent(footerText: string): TemplateComponent {
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

    const formattedButtons: TemplateButton[] = []

    for (const button of buttons) {
      const formattedButton = this.formatButton(button, buttonType, category)
      if (formattedButton) {
        formattedButtons.push(formattedButton)
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
        if (button.url?.includes('{{1}}') && button.example) {
          urlButton.example = [button.example]
        }

        return urlButton

      case 'OTP':
        // Special handling for authentication templates
        if (category === 'AUTHENTICATION') {
          return {
            type: 'OTP',
            otp_type: 'COPY_CODE',
            text: button.text || 'Copy Code'
          }
        }
        return null

      case 'COPY_CODE':
        return {
          type: 'COPY_CODE',
          example: button.example || 'CODE123'
        } as any

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
              header_handle: ["2:c2FtcGxl..."] // Media handle from upload
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
              header_handle: ["4::YX..."] // PDF handle
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
