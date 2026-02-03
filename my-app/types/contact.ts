export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    title: string;
    company: string;
    avatar?: string;
    dateAdded: string;
    source: string;
    hasMessaged?: boolean;
    lastActive?: string;
  }
  
  export interface CRMProvider {
    id: string;
    name: string;
    icon: string;
    isConnected: boolean;
  }
  