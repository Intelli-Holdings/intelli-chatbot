// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function sendMessage(formData: FormData) {
  const message = formData.get('message');

  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }

  console.log('Message:', message);

  const response = await fetch('https://intelli-python-backend-56zq.onrender.com/appservice/conversations/whatsapp/send_message/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Failed to send message. Status:', response.status, 'Body:', errorBody);
    throw new Error('Failed to send message');
  }

  const responseData = await response.json();
  console.log('Message sent successfully:', responseData);

  // Optionally, you can revalidate a path if needed
  revalidatePath('/conversations');

  return responseData;
}