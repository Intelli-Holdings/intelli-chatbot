/**
 * WhatsApp Template Creator Utility - Updated with Carousel and Flows support
 * Follows Meta's official documentation for template creation
 * 
 * CRITICAL FIXES:
 * - Button types forced to UPPERCASE
 * - body_text always uses nested array format [[ ]]
 * - header_handle uses array format [ ]
 * - Matches working Postman examples exactly
 */

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS' | 'CAROUSEL'
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION'
  text?: string
  example?: any
  buttons?: TemplateButton[]
  cards?: CarouselCard[]
}

export interface CarouselCard {
  components: Array<{
    type: 'HEADER' | 'BODY' | 'BUTTONS'
    format?: 'IMAGE' | 'VIDEO'
    text?: string
    example?: any
    buttons?: TemplateButton[]
  }>
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'PHONE_NUMBER' | 'URL' | 'OTP' | 'COPY_CODE' | 'FLOW'
  text?: string
  phone_number?: string
  url?: string
  otp_type?: string
  example?: string[] | string
  // Flow button properties
  flow_id?: string
  flow_action?: 'navigate' | 'data_exchange'
  navigate_screen?: string
}

export interface TemplateData {
  name: string
  language: string
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
  add_security_recommendation?: boolean
  code_expiration_minutes?: number
  components: TemplateComponent[]
}

export class TemplateCreationHandler {
  /**
   * Creates a properly formatted WhatsApp template according to Meta's specifications
   */
  static createTemplate(templateData: any): TemplateData {
    const components: TemplateComponent[] = []

    // Handle Carousel subcategory
    if (templateData.subcategory === 'carousel' && templateData.carouselData) {
      return this.createCarouselTemplate(templateData)
    }

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
    }

    if (templateData.category === 'AUTHENTICATION') {
      if (templateData.add_security_recommendation) {
        result.add_security_recommendation = true
      }
      if (templateData.code_expiration_minutes) {
        result.code_expiration_minutes = templateData.code_expiration_minutes
      }
    }

    return result
  }

  /**
   * Creates a carousel template
   */
  private static createCarouselTemplate(templateData: any): TemplateData {
    const { name, language, carouselData } = templateData

    if (!carouselData?.cards || carouselData.cards.length < 2) {
      throw new Error('Carousel templates require at least 2 cards')
    }

    if (carouselData.cards.length > 10) {
      throw new Error('Carousel templates cannot have more than 10 cards')
    }

    const components: TemplateComponent[] = []

    // Add body component (message that appears above carousel)
    if (carouselData.messageBody?.trim()) {
      const bodyVariables = this.extractVariables(carouselData.messageBody)
      const bodyComponent: TemplateComponent = {
        type: 'BODY',
        text: carouselData.messageBody
      }

      if (bodyVariables.length > 0) {
        bodyComponent.example = {
          body_text: [bodyVariables.map((_, i) => `value${i + 1}`)]
        }
      } else {
        // CRITICAL FIX: Even without variables, include empty example
        bodyComponent.example = {
          body_text: [[]]
        }
      }

      components.push(bodyComponent)
    }

    // Add carousel component
    const carouselComponent: TemplateComponent = {
      type: 'CAROUSEL',
      cards: carouselData.cards.map((card: any) => {
        const cardComponents: any[] = []

        // Header (media)
        cardComponents.push({
          type: 'HEADER',
          format: card.headerMediaType,
          example: {
            header_handle: [card.headerMediaHandle]
          }
        })

        // Body text (if present)
        if (card.bodyText?.trim()) {
          const bodyVariables = this.extractVariables(card.bodyText)
          const bodyComp: any = {
            type: 'BODY',
            text: card.bodyText
          }

          if (bodyVariables.length > 0) {
            bodyComp.example = {
              body_text: [bodyVariables.map((_, i) => `value${i + 1}`)]
            }
          } else {
            // CRITICAL FIX: Empty example for non-variable body
            bodyComp.example = {
              body_text: [[]]
            }
          }

          cardComponents.push(bodyComp)
        }

        // Buttons (if present)
        if (card.buttons?.length > 0) {
          cardComponents.push({
            type: 'BUTTONS',
            buttons: card.buttons.map((btn: any) => {
              const button: any = {
                type: btn.type.toUpperCase(), // CRITICAL FIX: Force uppercase
                text: btn.text
              }

              if (btn.type.toUpperCase() === 'URL') {
                button.url = btn.url
                if (btn.url?.includes('{{1}}') && btn.urlVariable) {
                  button.example = [btn.urlVariable]
                }
              } else if (btn.type.toUpperCase() === 'PHONE_NUMBER') {
                button.phone_number = btn.phone_number
              }

              return button
            })
          })
        }

        return { components: cardComponents }
      })
    }

    components.push(carouselComponent)

    return {
      name: this.sanitizeTemplateName(name),
      language: language || 'en_US',
      category: 'MARKETING', // Carousel templates are always MARKETING
      components
    }
  }

  /**
   * Extract variables from text
   */
  private static extractVariables(text: string): string[] {
    const matches = text.match(/\{\{(\d+)\}\}/g) || []
    return matches
  }

  /**
   * Creates header component based on type
   */
  private static createHeaderComponent(templateData: any): TemplateComponent | null {
    const { headerType, headerText, headerVariables, headerMediaHandle, customVariableValues } = templateData

    switch (headerType) {
      case 'TEXT':
        if (!headerText?.trim()) return null
        
        let cleanHeaderText = headerText
        if (templateData.category === 'AUTHENTICATION') {
          cleanHeaderText = this.removeEmojis(headerText)
        }

        const headerComponent: TemplateComponent = {
          type: 'HEADER',
          format: 'TEXT',
          text: cleanHeaderText
        }

        if (headerVariables?.length > 0) {
          const exampleValues = headerVariables.map((variable: any, i: number) => {
            const key = variable.replace(/[{}]/g, '')
            if (customVariableValues && customVariableValues[key]) {
              return customVariableValues[key]
            }
            if (key.toLowerCase().includes('company') || key.includes('1')) {
              return 'YourCompany'
            } else if (key.toLowerCase().includes('name')) {
              return 'John'
            } else {
              return `Sample${i + 1}`
            }
          })
          
          // CRITICAL FIX: header_text is simple array, NOT nested
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

        // CRITICAL FIX: header_handle must be array format
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
   * CRITICAL: body_text must ALWAYS be nested array format [[ ]]
   */
  private static createBodyComponent(templateData: any): TemplateComponent {
    const { body, bodyVariables, customVariableValues, category } = templateData

    const bodyComponent: TemplateComponent = {
      type: 'BODY',
    }

    const hasVariables = bodyVariables?.length > 0

    if (hasVariables) {
      const exampleValues = bodyVariables.map((variable: any, i: number) => {
        const key = variable.replace(/[{}]/g, '')
        if (customVariableValues && customVariableValues[key]) {
          return customVariableValues[key]
        }
        if (key.toLowerCase().includes('name') || key.includes('1')) return 'John Doe'
        if (key.toLowerCase().includes('order') || key.includes('2')) return '#12345'
        if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.includes('3')) return '$99.99'
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.includes('4')) return 'March 15'
        if (key.toLowerCase().includes('code') || key.toLowerCase().includes('track')) return 'ABC123'
        return `Sample${i + 1}`
      })
      
      // CRITICAL FIX: body_text must be nested array [[val1, val2, ...]]
      bodyComponent.example = {
        body_text: [exampleValues],
      }
    } else {
      // CRITICAL FIX: Templates without variables need empty nested array [[]]
      bodyComponent.example = {
        body_text: [[]]
      }
    }

    if (category !== 'AUTHENTICATION' || !hasVariables) {
      bodyComponent.text = body
    }

    return bodyComponent
  }

  /**
   * Creates footer component with proper opt-out requirements
   */
  private static createFooterComponent(footerText?: string, category?: string): TemplateComponent | null {
    if (!footerText?.trim()) {
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
      text: footerText.substring(0, 60)
    }
  }

  /**
   * Creates buttons component with proper validation
   * CRITICAL: Button types must be UPPERCASE
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
        const otpButton = buttons.find((b: any) => b.type === 'OTP' || b.type === 'otp')
        if (otpButton) {
          formattedButtons = [{
            type: 'OTP',
            text: otpButton.text || 'Copy Code',
            otp_type: 'COPY_CODE'
          }]
        } else {
          formattedButtons = [{
            type: 'OTP',
            text: 'Copy Code',
            otp_type: 'COPY_CODE'
          }]
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
   * CRITICAL: All button types MUST be UPPERCASE
   */
  private static formatButton(button: any, buttonType: string, category: string): TemplateButton | null {
    // CRITICAL FIX: Normalize button type to uppercase for comparison
    const buttonTypeUpper = button.type?.toString().toUpperCase()
    
    switch (buttonTypeUpper) {
      case 'QUICK_REPLY':
        return {
          type: 'QUICK_REPLY',
          text: button.text?.substring(0, 25) || 'Reply'
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

        if (button.url?.includes('{{1}}')) {
          let exampleValue = button.example || 'default-value'
          
          if (button.url.includes('order') || button.url.includes('purchase')) {
            exampleValue = button.example || 'ORD12345'
          } else if (button.url.includes('track') || button.url.includes('status')) {
            exampleValue = button.example || 'TRK98765'
          } else if (button.url.includes('product') || button.url.includes('item')) {
            exampleValue = button.example || 'PROD456'
          } else if (button.url.includes('user') || button.url.includes('profile')) {
            exampleValue = button.example || 'USR789'
          }
          
          // CRITICAL FIX: Ensure example is always array format
          urlButton.example = Array.isArray(exampleValue) ? exampleValue : [exampleValue]
        }

        return urlButton

      case 'FLOW':
        // Flow buttons for Flows templates
        if (!button.flow_id) {
          throw new Error('Flow button requires a flow_id')
        }

        const flowButton: TemplateButton = {
          type: 'FLOW',
          text: button.text?.substring(0, 20) || 'Open Flow',
          flow_id: button.flow_id,
          flow_action: button.flow_action || 'navigate'
        }

        if (button.flow_action === 'navigate' && button.navigate_screen) {
          flowButton.navigate_screen = button.navigate_screen
        }

        return flowButton

      case 'OTP':
      case 'COPY_CODE':
        if (category === 'AUTHENTICATION') {
          return {
            type: 'COPY_CODE',
            example: button.example || '123456'
          }
        }
        return {
          type: 'COPY_CODE',
          example: button.example || 'EXAMPLE_CODE',
        }

      default:
        console.warn(`Unknown button type: ${button.type}`)
        return null
    }
  }

  /**
   * Validates template according to category rules
   */
  private static validateTemplate(category: string, components: TemplateComponent[]): void {
    switch (category) {
      case 'MARKETING':
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
        const headerComponent = components.find(c => c.type === 'HEADER')
        if (headerComponent?.text && this.containsEmojis(headerComponent.text)) {
          throw new Error('Authentication templates cannot contain emojis in header text')
        }
        break

      case 'UTILITY':
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
      .substring(0, 512)
  }

  /**
   * Removes emojis from text
   */
  private static removeEmojis(text: string): string {
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
      return false
    }
  
    if (handle === 'DYNAMIC_HANDLE_FROM_UPLOAD' || 
        handle.includes('...') || 
        handle.includes('sample') || 
        handle.includes('example')) {
      return false
    }

    if (handle.length < 5) {
      return false
    }
  
    const handlePattern = /^[a-zA-Z0-9:_\-+/=]+$/
    return handlePattern.test(handle)
  }
}