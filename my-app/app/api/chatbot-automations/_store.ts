import { ChatbotAutomation } from "@/types/chatbot-automation";

// Global in-memory storage for development
// Using globalThis to ensure the store persists across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var chatbotsStore: Map<string, ChatbotAutomation> | undefined;
}

// In-memory storage for development (replace with database in production)
// This will reset when the server restarts
export const chatbotsStore: Map<string, ChatbotAutomation> =
  globalThis.chatbotsStore ?? new Map();

if (process.env.NODE_ENV !== "production") {
  globalThis.chatbotsStore = chatbotsStore;
}
