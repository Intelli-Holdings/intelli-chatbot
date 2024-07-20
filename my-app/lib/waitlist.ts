'use server';


export async function joinWaitlist(formData: FormData) {
  try {
    // Extract form data
    const email_address = formData.get('email')?.toString() || '';
    const company_name = formData.get('companyName')?.toString() || '';
    const phone_number = formData.get('phoneNumber')?.toString() || ''; 

    // Construct payload
    const payload = {
      email_address,
      company_name,
      phone_number, 
    };

    // Log payload in console
    console.log('Waitlist payload:', JSON.stringify(payload, null, 2));

    // Send data to the backend API
    const response = await fetch('https://intelli-python-backend.onrender.com/waitlist/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Failed to join waitlist:', response.status, response.statusText, responseText);
      throw new Error(`Failed to join waitlist: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return { success: false };
  }
}