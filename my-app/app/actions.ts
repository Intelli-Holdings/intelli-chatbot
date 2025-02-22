'use server';

import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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