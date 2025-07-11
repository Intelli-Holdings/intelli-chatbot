export interface Assistant {
    id: string;
    name: string;
    prompt: string;
    organizationId: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface CreateAssistantData {
    name: string;
    prompt: string;
    organizationId: string;
  }
  
  