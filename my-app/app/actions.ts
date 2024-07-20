// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

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
  customer_number: string;
  enable_ai: boolean;
}

export async function toggleAISupport(formData: FormData) {
  const customerNumber = formData.get('customerNumber');
  const enableAI = formData.get('enableAI') === 'true';

  if (!customerNumber || typeof customerNumber !== 'string') {
    throw new Error('Invalid customer number');
  }

  try {
    const payload: AITogglePayload = {
      customer_number: customerNumber,
      enable_ai: enableAI
    };

    console.log('Handing over to AI:', payload);

    const response = await fetch('https://intelli-python-backend-lxui.onrender.com/appservice/conversations/whatsapp/handover_conversation/', {
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

    // Update the conversation state in the database or state management system
    // This is a placeholder for where you would update your local state
    // updateConversationState(customerNumber, enableAI);

    // Revalidate the conversations path to reflect the changes
    revalidatePath('/conversations');

    return {
      success: true,
      message: enableAI ? 'Conversation handed over to AI' : 'Human support has taken over the conversation',
      isAIEnabled: enableAI
    };
  } catch (error) {
    console.error('Error in toggleAISupport:', error);
    throw new Error('Failed to toggle AI support');
  }
}

// This function would update your local state or database
// Implement this based on your state management solution
function updateConversationState(customerNumber: string, isAIEnabled: boolean) {
  // Update your local state or database
  // For example, if using a database:
  // await db.conversation.update({
  //   where: { customerNumber: customerNumber },
  //   data: { isAIEnabled: isAIEnabled }
  // });
}

export async function sendMessage(formData: FormData) {
  const content = formData.get('message');
  const customerNumber = formData.get('customerNumber') || 'default';
  const customerName = formData.get('customerName') || 'Anonymous';
  const answer = formData.get('answer') || '';

  if ( typeof content !== 'string') {
    throw new Error('Invalid message content');
  }

  try {
    const payload: MessagePayload = {
      customer_number: typeof customerNumber === 'string' ? customerNumber : 'default',
      customer_name: typeof customerName === 'string' ? customerName : 'Anonymous',
      phone_number: "233553221408",
      content: content,
      answer: typeof answer === 'string' ? answer : ''
    };

    console.log('Payload:', payload);

    const response = await fetch('https://intelli-python-backend-lxui.onrender.com/appservice/conversations/whatsapp/send_message/', {
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