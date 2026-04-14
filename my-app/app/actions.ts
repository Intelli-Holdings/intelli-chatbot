'use server';

import { Contact, CRMProvider } from '@/types/contact';
import * as XLSX from 'exceljs';
import Papa from 'papaparse';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

import { logger } from "@/lib/logger";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ConversationPayload {
  customer_number: string;
  phone_number: string;
}

export async function takeoverConversation(formData: FormData) {
  const { getToken } = await auth();
  const token = await getToken();

  const customerNumber = formData.get('customerNumber');
  const phoneNumber = formData.get('phoneNumber');
  const instagramBusinessAccountId = formData.get('instagramBusinessAccountId');

  const payload: Record<string, string> = {
    customer_number: customerNumber as string,
  };

  if (instagramBusinessAccountId) {
    payload.instagram_business_account_id = instagramBusinessAccountId as string;
  } else {
    payload.phone_number = phoneNumber as string;
  }

  logger.info('Taking over conversation:');

  const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/takeover_conversation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('API response error:', { error: errorText });
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  logger.info('Conversation takeover successful');

  return {
    success: true,
    message: 'Conversation takeover initiated',
  };
}

export async function handoverConversation(formData: FormData) {
  const { getToken } = await auth();
  const token = await getToken();

  const customerNumber = formData.get('customerNumber');
  const phoneNumber = formData.get('phoneNumber');
  const instagramBusinessAccountId = formData.get('instagramBusinessAccountId');

  const payload: Record<string, string> = {
    customer_number: customerNumber as string,
  };

  if (instagramBusinessAccountId) {
    payload.instagram_business_account_id = instagramBusinessAccountId as string;
  } else {
    payload.phone_number = phoneNumber as string;
  }

  logger.info('Handing over conversation:');

  const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/handover_conversation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('API response error:', { error: errorText });
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();
  logger.info('Conversation handover successful:');

  return {
    success: true,
    message: 'Conversation handover initiated',
  };
}

export async function sendInstagramMessage(formData: FormData) {
  // For text-only messages
  if (!formData.has('file')) {
    const payload = {
      instagram_business_account_id: formData.get('instagram_business_account_id'),
      customer_id: formData.get('customer_id'),
      answer: formData.get('answer'),
    };

    const response = await fetch(`${API_BASE_URL}/appservice/conversations/instagram/send_message/`, {
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
    const response = await fetch(`${API_BASE_URL}/appservice/conversations/instagram/send_message/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Instagram API error response:', { error: errorData });
      throw new Error(`Failed to send message: ${response.status}`);
    }

    return response.json();
  }
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
      logger.error('API error response:', { error: errorData });
      throw new Error(`Failed to send message: ${response.status}`);
    }

    return response.json();
  }
}

export async function sendTemplateMessage(payload: {
  phone_number: string
  customer_number: string
  template_name: string
  language?: string
  components?: any[]
}) {
  const response = await fetch(`${API_BASE_URL}/appservice/conversations/whatsapp/send_template/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to send template: ${response.status}`);
  }

  return response.json();
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
    logger.error('CRM connection error:', { error: error instanceof Error ? error.message : String(error) });
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to connect to CRM'
    };
  }
}