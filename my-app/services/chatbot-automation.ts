import { logger } from "@/lib/logger";
import {
  ChatbotAutomation,
  ChatbotMenu,
  ChatbotTrigger,
  ChatbotSettings,
  CreateChatbotRequest,
  UpdateChatbotRequest,
  TestChatbotRequest,
  TestChatbotResponse,
  DEFAULT_CHATBOT_SETTINGS,
  generateId,
  createDefaultMenu,
  WhatsAppInteractiveButtonMessage,
  WhatsAppInteractiveList,
  ChatbotFlowBackend,
  BackendFlowNode,
  BackendFlowEdge,
  CreateFlowRequest,
  UpdateFlowRequest,
  FlowValidationResult,
  FlowStats,
  FlowExecution,
  objectToSnakeCase,
  objectToCamelCase,
} from '@/types/chatbot-automation';

// Use Django backend API for chatbot automation
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

// Helper to get auth headers (Clerk JWT)
async function getAuthHeaders(): Promise<HeadersInit> {
  // Get the Clerk session token if available
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Try to get auth token from Clerk (client-side)
  if (typeof window !== 'undefined') {
    try {
      // @ts-expect-error - Clerk is loaded globally
      const clerk = window.Clerk;
      if (clerk?.session) {
        const token = await clerk.session.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (e) {
      logger.warn('Failed to get Clerk token', { error: e instanceof Error ? e.message : String(e) });
    }
  }

  return headers;
}

// Convert frontend ChatbotAutomation to backend format
function toBackendFormat(chatbot: Partial<ChatbotAutomation>, organizationId: string): CreateFlowRequest | UpdateFlowRequest {
  // Convert nodes from frontend format (with trigger/menu) to backend format (with data.keywords)
  const nodes: BackendFlowNode[] = [];
  const edges: BackendFlowEdge[] = [];

  // If we have flowLayout with nodes/edges, use them directly
  if (chatbot.flowLayout?.nodes) {
    // This means we're using the new flow builder format
    // The nodes and edges should be passed separately
  }

  // Extract trigger keywords from start nodes or triggers
  const triggerKeywords: string[] = [];
  chatbot.triggers?.forEach(trigger => {
    if (trigger.keywords) {
      triggerKeywords.push(...trigger.keywords);
    }
  });

  return {
    organization: organizationId,
    name: chatbot.name || 'Untitled Flow',
    description: chatbot.description,
    nodes,
    edges,
    menus: chatbot.menus,
  };
}

// Convert backend ChatbotFlowBackend to frontend ChatbotAutomation format
function toFrontendFormat(flow: ChatbotFlowBackend): ChatbotAutomation {
  logger.debug('toFrontendFormat', { nodeCount: flow.nodes?.length, nodes: flow.nodes, edgeCount: flow.edges?.length, edges: flow.edges });

  // Ensure arrays are initialized (backend may return null/undefined)
  const nodes = flow.nodes || [];
  const edges = flow.edges || [];
  const menus: ChatbotMenu[] = flow.menus || [];
  const triggerKeywords = flow.trigger_keywords || [];

  // Extract triggers from start nodes
  const triggers: ChatbotTrigger[] = [];

  // Process nodes to extract triggers
  nodes.forEach(node => {
    if (node.type === 'start') {
      const data = node.data as { trigger?: ChatbotTrigger; keywords?: string[] };
      if (data.trigger) {
        triggers.push(data.trigger);
      } else if (data.keywords) {
        // Convert backend keywords format to frontend trigger format
        triggers.push({
          id: node.id.replace('start-', ''),
          type: 'keyword',
          keywords: data.keywords,
          caseSensitive: false,
          menuId: '',
        });
      }
    }
  });

  // If no triggers found but we have trigger_keywords, create triggers
  if (triggers.length === 0 && triggerKeywords.length > 0) {
    triggers.push({
      id: generateId(),
      type: 'keyword',
      keywords: triggerKeywords,
      caseSensitive: false,
      menuId: menus[0]?.id || '',
    });
  }

  return {
    id: flow.id,
    organizationId: flow.organization,
    name: flow.name,
    description: flow.description,
    isActive: flow.is_active,
    priority: 1,
    triggers,
    menus,
    settings: DEFAULT_CHATBOT_SETTINGS,
    flowLayout: {
      nodes: nodes.map(n => ({ id: n.id, position: n.position })),
      // Include raw backend data for React Flow to use directly
      rawNodes: nodes,
      rawEdges: edges,
    },
    createdAt: flow.created_at,
    updatedAt: flow.updated_at,
  };
}

export class ChatbotAutomationService {
  /**
   * Fetch all chatbots/flows for an organization
   */
  static async getChatbots(organizationId: string): Promise<ChatbotAutomation[]> {
    try {
      if (!organizationId) {
        logger.warn('getChatbots: organizationId is required');
        return [];
      }

      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/?organization=${organizationId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chatbots');
      }

      const data = await response.json();

      // Handle DRF paginated response format: {count, next, previous, results: [...]}
      // or direct array response
      let flows: ChatbotFlowBackend[];
      if (Array.isArray(data)) {
        flows = data;
      } else if (data && Array.isArray(data.results)) {
        flows = data.results;
      } else {
        logger.warn('Unexpected API response format', { data });
        flows = [];
      }

      return flows.map(toFrontendFormat);
    } catch (error) {
      logger.error('Error fetching chatbots', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Fetch a single chatbot/flow by ID
   */
  static async getChatbot(id: string): Promise<ChatbotAutomation> {
    try {
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid chatbot ID: ID is required');
      }

      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chatbot');
      }

      const flow: ChatbotFlowBackend = await response.json();
      return toFrontendFormat(flow);
    } catch (error) {
      logger.error('Error fetching chatbot', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Create a new chatbot/flow
   */
  static async createChatbot(data: CreateChatbotRequest): Promise<ChatbotAutomation> {
    try {
      const headers = await getAuthHeaders();

      // Create default structure if not provided
      const defaultMenuId = generateId();
      const defaultMainMenu = createDefaultMenu(defaultMenuId, 'Interactive Message');

      // Create default start node
      const startNodeId = `start-${generateId()}`;
      const defaultNodes: BackendFlowNode[] = [
        {
          id: startNodeId,
          type: 'start',
          position: { x: 50, y: 100 },
          data: {
            type: 'start',
            label: 'Start',
            keywords: [],
          },
        },
      ];

      const requestData: CreateFlowRequest = {
        organization: data.organizationId,
        name: data.name,
        description: data.description || '',
        nodes: defaultNodes,
        edges: [],
        menus: data.menus || [defaultMainMenu],
      };

      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Create chatbot error response', { data: errorData });
        throw new Error(errorData.message || errorData.detail || 'Failed to create chatbot');
      }

      const flow: ChatbotFlowBackend = await response.json();
      logger.info('Created chatbot response', { data: flow });

      if (!flow.id) {
        logger.error('Backend did not return an ID for the created chatbot');
        throw new Error('Failed to create chatbot: No ID returned');
      }

      return toFrontendFormat(flow);
    } catch (error) {
      logger.error('Error creating chatbot', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Update an existing chatbot/flow
   */
  static async updateChatbot(
    id: string,
    data: UpdateChatbotRequest
  ): Promise<ChatbotAutomation> {
    try {
      const headers = await getAuthHeaders();

      // Convert frontend format to backend format
      const requestData: UpdateFlowRequest = {
        name: data.name,
        description: data.description,
        menus: data.menus,
        is_active: data.isActive,
      };

      // If flowLayout contains node positions, extract nodes
      if (data.flowLayout?.nodes) {
        // Nodes and edges should be provided separately via updateFlowNodes
      }

      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to update chatbot');
      }

      const flow: ChatbotFlowBackend = await response.json();
      return toFrontendFormat(flow);
    } catch (error) {
      logger.error('Error updating chatbot', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Update flow nodes and edges (for flow builder)
   */
  static async updateFlowNodes(
    id: string,
    nodes: BackendFlowNode[],
    edges: BackendFlowEdge[]
  ): Promise<ChatbotAutomation> {
    try {
      const headers = await getAuthHeaders();

      const requestData = {
        nodes,
        edges,
      };

      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to update flow nodes');
      }

      const flow: ChatbotFlowBackend = await response.json();
      return toFrontendFormat(flow);
    } catch (error) {
      logger.error('Error updating flow nodes', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Delete a chatbot/flow
   */
  static async deleteChatbot(id: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }
    } catch (error) {
      logger.error('Error deleting chatbot', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Toggle chatbot active status (publish/unpublish)
   */
  static async toggleChatbot(id: string, isActive: boolean): Promise<ChatbotAutomation> {
    try {
      const headers = await getAuthHeaders();
      const endpoint = isActive ? 'publish' : 'unpublish';

      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/${endpoint}/`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to toggle chatbot status');
      }

      const flow: ChatbotFlowBackend = await response.json();
      return toFrontendFormat(flow);
    } catch (error) {
      logger.error('Error toggling chatbot', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Duplicate a chatbot/flow
   */
  static async duplicateChatbot(
    id: string,
    newName: string
  ): Promise<ChatbotAutomation> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/duplicate/`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to duplicate chatbot');
      }

      const flow: ChatbotFlowBackend = await response.json();
      return toFrontendFormat(flow);
    } catch (error) {
      logger.error('Error duplicating chatbot', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Validate a flow
   */
  static async validateFlow(id: string): Promise<FlowValidationResult> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/validate/`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to validate flow');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error validating flow', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get flow statistics
   */
  static async getFlowStats(id: string): Promise<FlowStats> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${id}/stats/`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get flow stats');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting flow stats', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Get flow executions
   */
  static async getFlowExecutions(flowId?: string): Promise<FlowExecution[]> {
    try {
      const headers = await getAuthHeaders();
      const url = flowId
        ? `${API_BASE_URL}/chatbot_automation/executions/?flow=${flowId}`
        : `${API_BASE_URL}/chatbot_automation/executions/`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to get flow executions');
      }

      const data = await response.json();

      // Handle DRF paginated response format
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.results)) {
        return data.results;
      } else {
        logger.warn('Unexpected executions API response format', { data });
        return [];
      }
    } catch (error) {
      logger.error('Error getting flow executions', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Test a chatbot with mock input (local simulation)
   */
  static async testChatbot(data: TestChatbotRequest): Promise<TestChatbotResponse> {
    // For now, this runs locally since the backend test endpoint
    // would require a real WhatsApp connection
    // TODO: Implement backend simulation endpoint
    try {
      const chatbot = await this.getChatbot(data.chatbotId);
      const menu = this.findMenuByKeyword(chatbot, data.input);

      if (menu) {
        return {
          sessionId: generateId(),
          menu,
          message: menu.body,
          action: 'show_menu',
          fallbackTriggered: false,
        };
      }

      return {
        sessionId: generateId(),
        menu: null,
        message: chatbot.settings.fallbackMessage,
        action: 'fallback_ai',
        fallbackTriggered: true,
      };
    } catch (error) {
      logger.error('Error testing chatbot', { error: error instanceof Error ? error.message : String(error) });
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
          if (trigger.caseSensitive) {
            // Exact match: strict equality (case-sensitive)
            return keyword.trim() === kw.trim();
          }
          // Contains: substring match (case-insensitive)
          return normalizedKeyword.includes(kw.toLowerCase().trim());
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

    // Check if using new flow format (rawNodes) or legacy format (menus)
    const hasRawNodes = chatbot.flowLayout?.rawNodes && chatbot.flowLayout.rawNodes.length > 0;
    const hasRawEdges = chatbot.flowLayout?.rawEdges || [];

    if (hasRawNodes) {
      // New flow format validation
      const rawNodes = chatbot.flowLayout!.rawNodes!;
      const rawEdges = hasRawEdges;

      // Check for at least one start node
      const startNodes = rawNodes.filter((n) => n.type === 'start');
      if (startNodes.length === 0) {
        errors.push('Flow needs at least one Trigger node');
      }

      // Check that start nodes have keywords and are connected
      startNodes.forEach((startNode) => {
        const data = startNode.data as { keywords?: string[] };
        if (!data.keywords || data.keywords.length === 0) {
          errors.push('Trigger node must have at least one keyword');
        }

        const hasConnection = rawEdges.some((e) => e.source === startNode.id);
        if (!hasConnection) {
          errors.push('Trigger node must be connected to another node');
        }
      });
    } else {
      // Legacy format validation (menus-based)
      if (!chatbot.menus || chatbot.menus.length === 0) {
        errors.push('At least one menu is required');
      }

      chatbot.menus?.forEach((menu) => {
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
    }

    return errors;
  }

  // ==========================================
  // Analytics Methods
  // ==========================================

  /**
   * Get comprehensive flow analytics
   */
  static async getFlowAnalytics(
    flowId: string,
    days: number = 30
  ): Promise<FlowAnalytics> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/flows/${flowId}/analytics/?days=${days}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flow analytics');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error fetching flow analytics', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  // ==========================================
  // Template Button Flow Mapping Methods
  // ==========================================

  /**
   * Get all template button flow mappings for a template
   */
  static async getTemplateButtonMappings(
    templateId: string,
    organizationId: string
  ): Promise<TemplateButtonFlowMapping[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/template-button-mappings/by-template/${templateId}/?organization=${organizationId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch template button mappings');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error fetching template button mappings', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  /**
   * Bulk update template button flow mappings
   */
  static async updateTemplateButtonMappings(
    organizationId: string,
    templateId: string,
    templateName: string,
    mappings: Array<{
      button_text: string;
      button_index: number;
      flow: string | null;
    }>
  ): Promise<{ status: string; results: any[] }> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/chatbot_automation/template-button-mappings/bulk-update/`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            organization: organizationId,
            template_id: templateId,
            template_name: templateName,
            mappings,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update template button mappings');
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating template button mappings', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}

// Type for template button flow mapping
export interface TemplateButtonFlowMapping {
  id: string;
  template_id: string;
  template_name: string;
  button_text: string;
  button_index: number;
  flow: string;
  flow_name: string;
  is_active: boolean;
}

// Types for flow analytics
export interface FlowAnalyticsSummary {
  total_executions: number;
  completed: number;
  failed: number;
  cancelled: number;
  waiting: number;
  completion_rate: number;
  avg_completion_time_seconds: number | null;
}

export interface FlowAnalyticsAllTime {
  total_executions: number;
  completed: number;
  completion_rate: number;
}

export interface DropOffNode {
  node_id: string;
  node_type: string;
  node_label: string;
  count: number;
  percentage: number;
}

export interface NodeStats {
  node_id: string;
  node_type: string;
  node_label: string;
  visits: number;
  visit_rate: number;
}

export interface TimeSeriesEntry {
  date: string;
  total: number;
  completed: number;
  failed: number;
}

export interface PathNode {
  node_id: string;
  node_type: string;
  node_label: string;
}

export interface PopularPath {
  path: PathNode[];
  count: number;
  percentage: number;
}

export interface FlowAnalytics {
  period_days: number;
  summary: FlowAnalyticsSummary;
  all_time: FlowAnalyticsAllTime;
  drop_offs: DropOffNode[];
  node_stats: NodeStats[];
  time_series: TimeSeriesEntry[];
  popular_paths: PopularPath[];
  last_executed_at: string | null;
}

export default ChatbotAutomationService;
