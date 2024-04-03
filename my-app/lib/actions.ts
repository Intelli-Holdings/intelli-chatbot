'use server'
interface ReservationState {
  success: boolean;
}

export async function createReservation(formData: FormData) {
  try {
    // Extract form data
const first_name = formData.get('firstName')?.toString() || '';
    const last_name = formData.get('lastName')?.toString() || '';
    const customer_email = formData.get('email')?.toString() || '';
    const customer_phone = formData.get('phoneNumber')?.toString() || '';
    const number_of_adult_guests = formData.get('adults')?.toString() || '';
    const number_of_child_guests = formData.get('children')?.toString() || '';
    const room_type = formData.get('roomType')?.toString() || '';
    const check_in_date = formData.get('checkIn')?.toString() || '';
    const check_out_date = formData.get('checkOut')?.toString() || '';
    let amount_paid = formData.get('amount')?.toString() || '';

    // Convert dates to the expected format (MM/DD/YYYY)
    const checkInDateFormatted = new Date(check_in_date).toLocaleDateString('en-US');
    const checkOutDateFormatted = new Date(check_out_date).toLocaleDateString('en-US');

    // Remove any currency symbols from the amount
    amount_paid = amount_paid.replace(/[^0-9.]/g, '');
    
    // Construct payload
const payload = {
      first_name,
      last_name,
      customer_email,
      customer_phone,
      number_of_adult_guests,
      number_of_child_guests,      
      check_in_date: checkInDateFormatted,
      check_out_date: checkOutDateFormatted,
      room_type,
      amount_paid,
    };

    // Log payload in console
console.log('Reservation payload:', JSON.stringify(payload, null, 2));

    // Send data to the backend API
const response = await fetch('https://intelli-python-backend.onrender.com/reservations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Failed to create reservation:', response.status, response.statusText, responseText);
      throw new Error(`Failed to create reservation: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { success: false };
  }
}

export async function handleCreateReservation(
  state: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  return await createReservation(formData);
}
