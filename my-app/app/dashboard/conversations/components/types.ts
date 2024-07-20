
export interface ChatMessage {
  id: number;
  content: string | null;
  answer: string | null;
  created_at: string;
  sender: string;
}

export interface Conversation {
  id: number;
  customer_number: string;
  messages: ChatMessage[];
  updated_at: string;
  sender_id: string;
  recipient_id: string;
}