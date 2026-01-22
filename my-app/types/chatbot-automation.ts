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
