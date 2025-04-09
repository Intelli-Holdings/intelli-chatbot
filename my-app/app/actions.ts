'use server';

import { Contact, CRMProvider } from '@/types/contact';
import * as XLSX from 'exceljs';
import Papa from 'papaparse';
import { revalidatePath } from 'next/cache';
import { toast } from 'sonner';
import { useWebSocket, type WebSocketMessage } from "@/hooks/use-websocket"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
;
const WEBSOCKET_BASE_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "wss://backend.intelliconcierge.com/ws";

interface ConversationPayload {
  customer_number: string;
  phone_number: string;
}

export async function takeoverConversation(formData: FormData) {
  const customerNumber = formData.get('customerNumber');
  const phoneNumber = formData.get('phoneNumber');

  const payload: ConversationPayload = {
    customer_number: customerNumber as string,
    phone_number: phoneNumber as string,
  };

  console.log('Taking over conversation:', payload);

  const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/takeover_conversation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API response error:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('Conversation takeover successful:', responseData);

  return {
    success: true,
    message: 'Conversation takeover initiated',
  };
}

export async function handoverConversation(formData: FormData) {
  const customerNumber = formData.get('customerNumber');
  const phoneNumber = formData.get('phoneNumber');

  const payload: ConversationPayload = {
    customer_number: customerNumber as string,
    phone_number: phoneNumber as string,
  };

  console.log('Handing over conversation:', payload);

  const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/handover_conversation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API response error:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('Conversation handover successful:', responseData);


  return {
    success: true,
    message: 'Conversation handover initiated',
  };
}

export async function sendMessage(formData: FormData) {
  // For text-only messages
  if (!formData.has('file')) {
    const payload = {
      customer_number: formData.get('customer_number'),
      phone_number: formData.get('phone_number'),
      answer: formData.get('answer'),
    };

    const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/send_message/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } 
  // For messages with media files
  else {
    // FormData will be sent directly for file uploads
    const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/send_message/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API error response:', errorData);
      toast.error('Failed to send message');
    }

    return response.json();
  }
}

export async function humanSupportMessages(customerNumber: string, phoneNumber: string) {
  const WEBSOCKET_URL = `${WEBSOCKET_BASE_URL}/messages/?customer_number=${customerNumber}&phone_number=${phoneNumber}`;
  console.log('Connecting to WebSocket for human support:', WEBSOCKET_URL);

  const ws = new WebSocket(WEBSOCKET_URL);

  ws.onopen = () => {
    console.log('WebSocket connection established for human support.');
  };

  ws.onmessage = (event) => {
    const message: WebSocketMessage = JSON.parse(event.data);

    // Generate a unique id for the message
    const newId = Date.now();

    // Extract media URL if applicable
    let mediaUrl = null;
    if (message.type === "image" || message.type === "audio" || message.type === "video") {
      const mediaMatch = message.content.match(/Media - (https:\/\/[^\s]+)/);
      if (mediaMatch && mediaMatch[1]) {
        mediaUrl = mediaMatch[1];
      }
    }

    // Use the timestamp from the payload if available; otherwise fallback to current time
    const messageTimestamp = message.timestamp || new Date().toISOString();

    // Create the new message object
    const newMessage = {
      id: newId,
      content: message.type === "text" ? message.content : null,
      sender: message.sender,
      created_at: messageTimestamp,
      read: false,
      answer: null,
      media: mediaUrl,
      type: message.type,
    };

    // Dispatch a custom event to update the chat area with the new message
    window.dispatchEvent(
      new CustomEvent("newMessageReceived", {
        detail: { message: newMessage },
      })
    );
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed for human support.');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws; // Return the WebSocket instance for further control if needed
}

export async function importContacts(formData: FormData) {
  const file = formData.get('file') as File;
  const fileType = file.name.split('.').pop()?.toLowerCase();

  try {
    let contacts: Contact[] = [];

    if (fileType === 'csv') {
      const text = await file.text();
      const result = Papa.parse(text, { header: true });
      contacts = result.data.map(formatContactData);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const buffer = await file.arrayBuffer();
      const workbook = new XLSX.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];
      const data = worksheet.getSheetValues();
      contacts = data.slice(1).map(row => formatContactData(row ? {
        name: (row as any[])[1]?.toString() || '',
        email: (row as any[])[2]?.toString() || '',
        phone: (row as any[])[3]?.toString() || '',
        title: (row as any[])[4]?.toString() || '',
        company: (row as any[])[5]?.toString() || '',
        source: (row as any[])[6]?.toString() || ''
      } : {}));
    }

    // Here you would typically save to your database
    return { success: true, contacts };
  } catch (error) {
    return { success: false, error: 'Failed to import contacts' };
  }
}

function formatContactData(data: any): Contact {
  return {
    id: crypto.randomUUID(),
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    title: data.title || '',
    company: data.company || '',
    dateAdded: new Date().toISOString(),
    source: data.source || 'Import',
    hasMessaged: false,
  };
}

export async function connectToCRM(provider: string, credentials: any | null) {
  try {
    // If credentials is null, handle as a disconnect request
    if (credentials === null) {
      // Implement disconnect logic here
      // For example, remove stored credentials, revoke tokens, etc.
      
      revalidatePath('/dashboard/contacts');
      return { 
        success: true, 
        message: 'CRM disconnected successfully' 
      };
    }

    // Validate provider and credentials
    if (!provider || !credentials) {
      return { 
        success: false, 
        message: 'Invalid provider or credentials' 
      };
    }

    // Handle connection based on provider type
    switch (provider) {
      case 'salesforce':
        // Validate required Salesforce fields
        if (!credentials.clientId || !credentials.clientSecret || 
            !credentials.username || !credentials.password) {
          return { 
            success: false, 
            message: 'Missing required Salesforce credentials' 
          };
        }
        // Implement Salesforce connection logic
        break;

      case 'zoho':
        // Validate required Zoho fields
        if (!credentials.apiKey || !credentials.organization) {
          return { 
            success: false, 
            message: 'Missing required Zoho credentials' 
          };
        }
        // Implement Zoho connection logic
        break;

      case 'airtable':
        // Validate required Airtable fields
        if (!credentials.apiKey || !credentials.baseId || !credentials.tableName) {
          return { 
            success: false, 
            message: 'Missing required Airtable credentials' 
          };
        }
        // Implement Airtable connection logic
        break;

      default:
        return { 
          success: false, 
          message: 'Unsupported CRM provider' 
        };
    }

    // Store credentials securely (implement your secure storage solution)
    // await storeCredentials(provider, credentials)

    // Revalidate the contacts page to reflect the new connection
    revalidatePath('/dashboard/contacts');

    return { 
      success: true, 
      message: 'CRM connected successfully' 
    };

  } catch (error) {
    console.error('CRM connection error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to connect to CRM'
    };
  }
}