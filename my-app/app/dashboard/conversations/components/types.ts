

// Define the Conversation interface
export interface Conversation {
    id: number;
    sender_id: string;
    recipient_id: string;
    chat_history: ChatMessage[];
    created_at: string;
    customer_number?: string;
  }
  
  // Define the ChatMessage interface
 export interface ChatMessage {
    content: string | null;
    answer: string;
    created_at: string;
    sender: string | null;
    chatsession: {
      customer_number: string;
      updated_at: string;
    };
  }
  

  