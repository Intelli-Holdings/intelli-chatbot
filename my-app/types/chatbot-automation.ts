// Channel types for multi-channel support
export type ChatbotChannel = 'whatsapp' | 'widget' | 'messenger' | 'instagram';

// Channel-specific configuration
export interface ChannelConfig {
  channel: ChatbotChannel;
  enabled: boolean;
  // WhatsApp specific
  appServiceId?: number;        // Specific WhatsApp phone number
  phoneNumberId?: string;
  // Widget specific
  widgetId?: string;
  // Messenger/Instagram specific
  pageId?: string;
  accessToken?: string;
}

// Main Chatbot Configuration
export interface ChatbotAutomation {
  id: string;
  organizationId: string;
  appServiceId?: number;        // Legacy: Specific WhatsApp number
  channels?: ChannelConfig[];   // Multi-channel configuration
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;             // Lower = higher priority
  triggers: ChatbotTrigger[];
  menus: ChatbotMenu[];
  settings: ChatbotSettings;
  flowLayout?: FlowLayout;      // Visual flow builder layout
  createdAt: string;
  updatedAt: string;
}

// Trigger Configuration
export interface ChatbotTrigger {
  id: string;
  type: 'keyword' | 'first_message' | 'button_click';
  keywords?: string[];          // For keyword trigger
  caseSensitive?: boolean;
  menuId: string;               // Which menu to show
}

// Menu with Options
export interface ChatbotMenu {
  id: string;
  name: string;
  messageType: 'text' | 'interactive_buttons' | 'interactive_list';

  // Header (optional)
  header?: MenuHeader;

  // Body message
  body: string;

  // Footer (optional)
  footer?: string;

  // Options/Buttons
  options: MenuOption[];
}

// Menu header configuration
export interface MenuHeader {
  type: 'text' | 'image' | 'video' | 'document';
  content: string;            // Text or media URL
}

// Menu Option (Button or List Item)
export interface MenuOption {
  id: string;
  title: string;                // Button/item text (max 20 chars)
  description?: string;         // For list items only

  // Action when selected
  action: MenuOptionAction;
}

// Action configuration for menu options
export interface MenuOptionAction {
  type: 'show_menu' | 'send_message' | 'fallback_ai' | 'end';
  targetMenuId?: string;      // For show_menu
  message?: string;           // For send_message
  media?: MenuActionMedia;    // Optional media with message
}

// Media configuration for actions
export interface MenuActionMedia {
  type: 'image' | 'video' | 'document';
  url: string;
  caption?: string;
}

// Settings
export interface ChatbotSettings {
  welcomeEnabled: boolean;
  welcomeMenuId?: string;
  sessionTimeoutMinutes: number;
  fallbackMessage: string;      // Shown before AI takes over
  unknownInputBehavior: 'repeat_menu' | 'fallback_ai';
}

// Active Session Tracking
export interface ChatbotSession {
  id: string;
  chatbotId: string;
  customerNumber: string;
  phoneNumber: string;
  currentMenuId: string;
  variables: Record<string, string>;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'completed' | 'fallback';
}

// Create chatbot request
export interface CreateChatbotRequest {
  organizationId: string;
  appServiceId?: number;
  name: string;
  description?: string;
  triggers?: ChatbotTrigger[];
  menus?: ChatbotMenu[];
  settings?: Partial<ChatbotSettings>;
}

// Update chatbot request
export interface UpdateChatbotRequest {
  name?: string;
  description?: string;
  appServiceId?: number;
  channels?: ChannelConfig[];
  isActive?: boolean;
  priority?: number;
  triggers?: ChatbotTrigger[];
  menus?: ChatbotMenu[];
  settings?: Partial<ChatbotSettings>;
  flowLayout?: FlowLayout;
}

// Test chatbot request
export interface TestChatbotRequest {
  chatbotId: string;
  input: string;
  sessionId?: string;
}

// Test chatbot response
export interface TestChatbotResponse {
  sessionId: string;
  menu: ChatbotMenu | null;
  message: string;
  action: 'show_menu' | 'send_message' | 'fallback_ai' | 'end';
  fallbackTriggered: boolean;
}

// List sections for interactive list messages
export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

// WhatsApp Interactive Message formats
export interface WhatsAppInteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface WhatsAppInteractiveList {
  type: 'list';
  header?: {
    type: 'text';
    text: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    button: string;
    sections: ListSection[];
  };
}

export interface WhatsAppInteractiveButtonMessage {
  type: 'button';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: { link: string };
    video?: { link: string };
    document?: { link: string; filename?: string };
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    buttons: WhatsAppInteractiveButton[];
  };
}

// Default settings
export const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  welcomeEnabled: false,
  sessionTimeoutMinutes: 30,
  fallbackMessage: "I'll connect you with our support team for assistance.",
  unknownInputBehavior: 'repeat_menu',
};

// Default menu
export const createDefaultMenu = (id: string, name: string): ChatbotMenu => ({
  id,
  name,
  messageType: 'interactive_buttons',
  body: 'How can I help you today?',
  options: [],
});

// Helper to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ========================================
// Flow Builder Types (React Flow integration)
// ========================================

// Position for nodes in the flow canvas
export interface NodePosition {
  x: number;
  y: number;
}

// Base data for all flow nodes
export interface FlowNodeDataBase {
  label: string;
}

// Start node data (trigger configuration)
export interface StartNodeData extends FlowNodeDataBase {
  type: 'start';
  trigger: ChatbotTrigger;
  tagSlug?: string;  // Optional tag to apply to contacts who trigger this flow
  tagName?: string;  // Tag name for display purposes
}

// Question node data (menu/interactive message)
export interface QuestionNodeData extends FlowNodeDataBase {
  type: 'question';
  menu: ChatbotMenu;
}

// Action node data types
export type ActionType = 'send_message' | 'fallback_ai' | 'end';

export interface ActionNodeData extends FlowNodeDataBase {
  type: 'action';
  actionType: ActionType;
  message?: string; // For send_message
  assistantId?: string; // For fallback_ai - selected assistant
}

// Union type for all flow node data
export type FlowNodeData = StartNodeData | QuestionNodeData | ActionNodeData;

// Custom node type for React Flow
export interface ChatbotFlowNode {
  id: string;
  type: 'start' | 'question' | 'action';
  position: NodePosition;
  data: FlowNodeData;
}

// Custom edge type for React Flow
export interface ChatbotFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // For option-specific connections from QuestionNode
  targetHandle?: string;
  label?: string; // Option title for edges from QuestionNode
  animated?: boolean;
}

// Flow layout configuration stored with chatbot
export interface FlowLayout {
  nodes: Array<{
    id: string;
    position: NodePosition;
  }>;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  // Raw backend data for React Flow (full node/edge data)
  rawNodes?: BackendFlowNode[];
  rawEdges?: BackendFlowEdge[];
}

// Validation constants
export const CHATBOT_LIMITS = {
  maxNameLength: 100,
  maxDescriptionLength: 500,
  maxBodyLength: 1024,
  maxFooterLength: 60,
  maxHeaderTextLength: 60,
  maxButtonTitleLength: 20,
  maxButtonDescriptionLength: 72,
  maxButtonsPerMenu: 3,
  maxListItemsPerSection: 10,
  maxSections: 10,
  maxTriggerKeywords: 20,
  maxMenus: 50,
};

// Custom field prefix constant - used to identify custom fields in variable names
export const CUSTOM_FIELD_PREFIX = 'custom:';

// Helper functions for custom field handling
export function isCustomField(fieldName: string): boolean {
  return fieldName.startsWith(CUSTOM_FIELD_PREFIX);
}

export function getCustomFieldKey(fieldName: string): string {
  return fieldName.replace(CUSTOM_FIELD_PREFIX, '');
}

export function createCustomFieldName(key: string): string {
  return `${CUSTOM_FIELD_PREFIX}${key}`;
}

// ========================================
// Backend API Types (Django REST Framework)
// ========================================

// Execution status enum matching backend
export type ExecutionStatus =
  | 'running'
  | 'waiting_for_input'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Backend ChatbotFlow model - uses snake_case
export interface ChatbotFlowBackend {
  id: string;
  organization: string;
  name: string;
  description: string;
  nodes: BackendFlowNode[];
  edges: BackendFlowEdge[];
  menus: ChatbotMenu[];  // For backward compatibility
  trigger_keywords: string[];
  is_active: boolean;
  is_published: boolean;
  published_at: string | null;
  version: number;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Backend node format
export interface BackendFlowNode {
  id: string;
  type: string;
  position: NodePosition;
  data: Record<string, unknown>;
}

// Backend edge format
export interface BackendFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
}

// Flow execution record
export interface FlowExecution {
  id: string;
  flow: string;
  contact_id: string;
  trigger_keyword: string;
  status: ExecutionStatus;
  current_node_id: string | null;
  visited_nodes: string[];
  collected_variables: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

// Flow validation result
export interface FlowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Flow stats
export interface FlowStats {
  execution_count: number;
  completion_rate: number;
  avg_duration_seconds: number;
  last_executed_at: string | null;
}

// API request/response types for backend
export interface CreateFlowRequest {
  organization: string;
  name: string;
  description?: string;
  nodes: BackendFlowNode[];
  edges: BackendFlowEdge[];
  menus?: ChatbotMenu[];
}

export interface UpdateFlowRequest {
  name?: string;
  description?: string;
  nodes?: BackendFlowNode[];
  edges?: BackendFlowEdge[];
  menus?: ChatbotMenu[];
  is_active?: boolean;
}

// Helper to convert camelCase to snake_case
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Helper to convert snake_case to camelCase
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Convert object keys from camelCase to snake_case
export function objectToSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = toSnakeCase(key);
      const value = obj[key];
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[snakeKey] = objectToSnakeCase(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map(item =>
          typeof item === 'object' && item !== null
            ? objectToSnakeCase(item as Record<string, unknown>)
            : item
        );
      } else {
        result[snakeKey] = value;
      }
    }
  }
  return result;
}

// Convert object keys from snake_case to camelCase
export function objectToCamelCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = toCamelCase(key);
      const value = obj[key];
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[camelKey] = objectToCamelCase(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map(item =>
          typeof item === 'object' && item !== null
            ? objectToCamelCase(item as Record<string, unknown>)
            : item
        );
      } else {
        result[camelKey] = value;
      }
    }
  }
  return result;
}
