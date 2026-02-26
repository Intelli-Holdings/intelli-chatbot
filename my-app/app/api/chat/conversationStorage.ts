// conversationStorage.ts

export function storeConversation(conversation: any[]) {
    localStorage.setItem('conversation', JSON.stringify(conversation));
  }
  
  export function retrieveConversation(): any[] | null {
    const storedConversation = localStorage.getItem('conversation');
    return storedConversation ? JSON.parse(storedConversation) : null;
  }