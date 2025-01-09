
export interface ChatMessage {
  [x: string]: any;
  id: number;
  content: string | null;
  answer: string | null;
  created_at: string;
  sender: string;
}

export interface Conversation {
  id: number;
  customer_number: string;
  customer_name?: string; 
  messages: ChatMessage[];
  updated_at: string;
  phone_number: string;
  recipient_id: string;
}


export interface Sentiment {
  id: number;
  content: string;
  sentiment: string[];
}


export interface SentimentAnalysis {
  chatsession: {
    id: number;
    customer_number: string;
    updated_at: string;
  };
  sentiments: {
    result: Sentiment[];
  };
  created_at: string;
}
