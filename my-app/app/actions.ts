'use server';

import { revalidatePath } from 'next/cache';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface MessagePayload {
  customer_number: string;
  customer_name: string;
  phone_number: string;
  content: string;
  answer: string;
}

interface ChatMessage {
  content: string | null;
  answer: string;
  created_at: string;
  sender: string | null;
  chatsession: {
    customer_number: string;
    updated_at: string;
  };
}

interface AITogglePayload {
  phone_number: string;
  customer_number: string;
  enable_ai: boolean;
}

export async function toggleAISupport(formData: FormData) {
  const customerNumber = formData.get('phoneNumber');
  const businessNumber = formData.get('phoneNumber'); // Changed from 'businessNumber' to 'phoneNumber'
  const enableAI = formData.get('enableAI') === 'true';

  console.log('Raw form data:', {
    customerNumber,
    businessNumber,}
  );

  if (!customerNumber || typeof customerNumber !== 'string') {
    throw new Error('Invalid customer number');
  }

  if (!businessNumber || typeof businessNumber !== 'string') {
    throw new Error('Invalid business number');
  }

  try {
    const payload: AITogglePayload = {
      phone_number: businessNumber,
      customer_number: customerNumber,
      enable_ai: enableAI
    };

    console.log('Handing over to AI:', payload);

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
    console.log('AI support toggled successfully:', responseData);

    return {
      success: true,
      message: enableAI ? 'Conversation handed over to AI' : 'Human support has taken over the conversation',
      isAIEnabled: enableAI
    };
  } catch (error) {{}}
}


export async function sendMessage(formData: FormData) {
  const content = formData.get('message');
  const customerNumber = formData.get('customerNumber');
  const customerName = formData.get('customerName');
  const answer = formData.get('answer') || '';

  console.log('Raw form data:', {
    message: content,
    customerNumber,
    customerName,
    answer
  });

  if (typeof content !== 'string' || content.trim() === '') {
    throw new Error('Invalid or empty message content');
  }

  try {
    const payload: MessagePayload = {
      customer_number: customerNumber === 'string' ? customerNumber : 'unknown',
      customer_name: typeof customerName === 'string' ? customerName : 'Anonymous',
      phone_number: '233553221408',      
      content: content,
      answer: typeof answer === 'string' ? answer : ''
    };

    console.log('Processed payload:', payload); 
    return false

    const response = await fetch('${API_BASE_URL}/appservice/conversations/whatsapp/send_message/', {
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
    console.log('Message sent successfully:', responseData);

    revalidatePath('/conversations');

    return responseData;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw new Error('Failed to send message');
  }
}