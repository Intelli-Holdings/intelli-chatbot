'use server';
import { logger } from "@/lib/logger";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function joinWaitlist(formData: FormData) {
  try {
    // Extract form data
    const email_address = formData.get('email')?.toString() || '';
    const company_name = formData.get('companyName')?.toString() || '';
    const phone_number = formData.get('phoneNumber')?.toString() || '';
    const full_name = formData.get('fullName')?.toString() || '';

    // Construct payload
    const payload = {
      email_address,
      company_name,
      phone_number,
      full_name,
    };

    // Log payload in console
    // console.log('Waitlist payload:', JSON.stringify(payload, null, 2));

    // Send data to the backend API
    const response = await fetch(`${API_BASE_URL}/intelli_waitlist/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      logger.error('Failed to join waitlist', { status: response.status, statusText: response.statusText, data: responseText });
      throw new Error(`Failed to join waitlist: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    logger.error('Error joining waitlist', { error: error instanceof Error ? error.message : String(error) });
    return { success: false };
  }
}