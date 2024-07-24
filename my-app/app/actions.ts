'use server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface TakeoverPayload {
  customer_number: string;
  phone_number: string;
}

export async function toggleAISupport(formData: FormData) {
  const customerNumber = formData.get('customerNumber');
  const phoneNumber = formData.get('phoneNumber');

  if (!customerNumber || typeof customerNumber !== 'string') {
    throw new Error('Invalid customer number');
  }

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new Error('Invalid phone number');
  }

  try {
    const payload: TakeoverPayload = {
      customer_number: customerNumber,
      phone_number: phoneNumber
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
  } catch (error) {
    console.error('Error in toggleAISupport:', error);
    throw new Error('Failed to initiate conversation takeover');
  }
}

export async function sendMessage(formData: FormData) {
  const payload = {
    customer_number: formData.get('customer_number'),
    customer_name: formData.get('customer_name'),
    phone_number: formData.get('phone_number'),
    content: formData.get('content'),
    answer: formData.get('answer')
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