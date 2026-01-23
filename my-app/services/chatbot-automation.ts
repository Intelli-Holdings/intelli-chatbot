import {
  ChatbotAutomation,
  ChatbotMenu,
  ChatbotTrigger,
  ChatbotSettings,
  ChatbotSession,
  CreateChatbotRequest,
  UpdateChatbotRequest,
  TestChatbotRequest,
  TestChatbotResponse,
  DEFAULT_CHATBOT_SETTINGS,
  generateId,
  createDefaultMenu,
  WhatsAppInteractiveButtonMessage,
  WhatsAppInteractiveList,
} from '@/types/chatbot-automation';

// Use local Next.js API routes for chatbot automation
// Change to process.env.NEXT_PUBLIC_API_BASE_URL when backend is ready
const API_BASE_URL = '';

export class ChatbotAutomationService {
  /**
   * Fetch all chatbots for an organization
   */
  static async getChatbots(organizationId: string): Promise<ChatbotAutomation[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/org/${organizationId}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chatbots');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      throw error;
    }
  }

  /**
   * Fetch a single chatbot by ID
   */
  static async getChatbot(id: string): Promise<ChatbotAutomation> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/${id}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chatbot');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chatbot:', error);
      throw error;
    }
  }

  /**
   * Create a new chatbot
   */
  static async createChatbot(data: CreateChatbotRequest): Promise<ChatbotAutomation> {
    try {
      // Create default structure if not provided
      const defaultMenuId = generateId();
      const defaultMainMenu = createDefaultMenu(defaultMenuId, 'Interactive Message');

      // Create default trigger (Start Flow node) that connects to the main menu
      const defaultTrigger: ChatbotTrigger = {
        id: generateId(),
        type: 'keyword',
        keywords: [],
        caseSensitive: false,
        menuId: defaultMenuId,
      };

      const chatbotData: Partial<ChatbotAutomation> = {
        organizationId: data.organizationId,
        appServiceId: data.appServiceId,
        name: data.name,
        description: data.description || '',
        isActive: false,
        priority: 1,
        triggers: data.triggers || [defaultTrigger],
        menus: data.menus || [defaultMainMenu],
        settings: {
          ...DEFAULT_CHATBOT_SETTINGS,
          ...data.settings,
        },
      };

      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chatbotData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create chatbot');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chatbot:', error);
      throw error;
    }
  }

  /**
   * Update an existing chatbot
   */
  static async updateChatbot(
    id: string,
    data: UpdateChatbotRequest
  ): Promise<ChatbotAutomation> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/${id}/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update chatbot');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating chatbot:', error);
      throw error;
    }
  }

  /**
   * Delete a chatbot
   */
  static async deleteChatbot(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/${id}/`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      throw error;
    }
  }

  /**
   * Toggle chatbot active status
   */
  static async toggleChatbot(id: string, isActive: boolean): Promise<ChatbotAutomation> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/${id}/toggle/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle chatbot status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling chatbot:', error);
      throw error;
    }
  }

  /**
   * Duplicate a chatbot
   */
  static async duplicateChatbot(
    id: string,
    newName: string
  ): Promise<ChatbotAutomation> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/${id}/duplicate/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to duplicate chatbot');
      }

      return await response.json();
    } catch (error) {
      console.error('Error duplicating chatbot:', error);
      throw error;
    }
  }

  /**
   * Test a chatbot with mock input
   */
  static async testChatbot(data: TestChatbotRequest): Promise<TestChatbotResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chatbot-automations/test/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to test chatbot');
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing chatbot:', error);
      throw error;
    }
  }

  /**
   * Convert a menu to WhatsApp interactive button message format
   */
  static menuToInteractiveButtons(menu: ChatbotMenu): WhatsAppInteractiveButtonMessage {
    const buttons = menu.options.slice(0, 3).map((option) => ({
      type: 'reply' as const,
      reply: {
        id: option.id,
        title: option.title.substring(0, 20),
      },
    }));

    const message: WhatsAppInteractiveButtonMessage = {
      type: 'button',
      body: {
        text: menu.body,
      },
      action: {
        buttons,
      },
    };

    // Add header if present
    if (menu.header) {
      if (menu.header.type === 'text') {
        message.header = {
          type: 'text',
          text: menu.header.content,
        };
      } else if (menu.header.type === 'image') {
        message.header = {
          type: 'image',
          image: { link: menu.header.content },
        };
      } else if (menu.header.type === 'video') {
        message.header = {
          type: 'video',
          video: { link: menu.header.content },
        };
      } else if (menu.header.type === 'document') {
        message.header = {
          type: 'document',
          document: { link: menu.header.content },
        };
      }
    }

    // Add footer if present
    if (menu.footer) {
      message.footer = {
        text: menu.footer,
      };
    }

    return message;
  }

  /**
   * Convert a menu to WhatsApp interactive list message format
   */
  static menuToInteractiveList(menu: ChatbotMenu): WhatsAppInteractiveList {
    const rows = menu.options.map((option) => ({
      id: option.id,
      title: option.title.substring(0, 24),
      description: option.description?.substring(0, 72),
    }));

    const message: WhatsAppInteractiveList = {
      type: 'list',
      body: {
        text: menu.body,
      },
      action: {
        button: 'View Options',
        sections: [
          {
            title: menu.name,
            rows,
          },
        ],
      },
    };

    // Add header if present and is text type
    if (menu.header && menu.header.type === 'text') {
      message.header = {
        type: 'text',
        text: menu.header.content,
      };
    }

    // Add footer if present
    if (menu.footer) {
      message.footer = {
        text: menu.footer,
      };
    }

    return message;
  }

  /**
   * Find menu by trigger keyword
   */
  static findMenuByKeyword(
    chatbot: ChatbotAutomation,
    keyword: string
  ): ChatbotMenu | null {
    const normalizedKeyword = keyword.toLowerCase().trim();

    for (const trigger of chatbot.triggers) {
      if (trigger.type === 'keyword' && trigger.keywords) {
        const matches = trigger.keywords.some((kw) => {
          const normalizedTrigger = trigger.caseSensitive
            ? kw.trim()
            : kw.toLowerCase().trim();
          const inputToMatch = trigger.caseSensitive
            ? keyword.trim()
            : normalizedKeyword;
          return normalizedTrigger === inputToMatch;
        });

        if (matches) {
          return chatbot.menus.find((menu) => menu.id === trigger.menuId) || null;
        }
      }
    }

    return null;
  }

  /**
   * Find menu by option selection
   */
  static findMenuByOption(
    chatbot: ChatbotAutomation,
    currentMenuId: string,
    optionId: string
  ): { menu: ChatbotMenu | null; action: 'show_menu' | 'send_message' | 'fallback_ai' | 'end' } {
    const currentMenu = chatbot.menus.find((m) => m.id === currentMenuId);
    if (!currentMenu) {
      return { menu: null, action: 'fallback_ai' };
    }

    const option = currentMenu.options.find((o) => o.id === optionId);
    if (!option) {
      return { menu: null, action: 'fallback_ai' };
    }

    if (option.action.type === 'show_menu' && option.action.targetMenuId) {
      const targetMenu = chatbot.menus.find(
        (m) => m.id === option.action.targetMenuId
      );
      return { menu: targetMenu || null, action: 'show_menu' };
    }

    return { menu: null, action: option.action.type };
  }

  /**
   * Get welcome menu if enabled
   */
  static getWelcomeMenu(chatbot: ChatbotAutomation): ChatbotMenu | null {
    if (!chatbot.settings.welcomeEnabled || !chatbot.settings.welcomeMenuId) {
      return null;
    }

    return chatbot.menus.find((m) => m.id === chatbot.settings.welcomeMenuId) || null;
  }

  /**
   * Validate chatbot configuration
   */
  static validateChatbot(chatbot: Partial<ChatbotAutomation>): string[] {
    const errors: string[] = [];

    if (!chatbot.name?.trim()) {
      errors.push('Chatbot name is required');
    }

    if (!chatbot.menus || chatbot.menus.length === 0) {
      errors.push('At least one menu is required');
    }

    chatbot.menus?.forEach((menu, index) => {
      if (!menu.body?.trim()) {
        errors.push(`Menu "${menu.name}" body text is required`);
      }

      if (menu.messageType === 'interactive_buttons' && menu.options.length > 3) {
        errors.push(`Menu "${menu.name}" can have maximum 3 buttons`);
      }

      menu.options.forEach((option) => {
        if (option.title.length > 20) {
          errors.push(`Option "${option.title}" title exceeds 20 characters`);
        }

        if (option.action.type === 'show_menu' && !option.action.targetMenuId) {
          errors.push(`Option "${option.title}" is missing target menu`);
        }
      });
    });

    chatbot.triggers?.forEach((trigger) => {
      if (trigger.type === 'keyword' && (!trigger.keywords || trigger.keywords.length === 0)) {
        errors.push('Keyword trigger must have at least one keyword');
      }

      if (!trigger.menuId) {
        errors.push('Trigger must be linked to a menu');
      }
    });

    return errors;
  }
}

export default ChatbotAutomationService;
