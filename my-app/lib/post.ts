'use server';
interface ReservationState {
  success: boolean;
  error?: string;
}

export async function createReservation(formData: FormData): Promise<ReservationState> {
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
    const special_requests = formData.get('specialRequests')?.toString() || '';

    // Perform form validation
    if (
      !first_name ||
      !last_name ||
      !customer_email ||
      !customer_phone ||
      !number_of_adult_guests ||
      !number_of_child_guests ||
      !room_type ||
      !check_in_date ||
      !check_out_date ||
      !amount_paid
    ) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

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
      special_requests,
    };

    // Log payload in console
    console.log('Reservation payload:', JSON.stringify(payload, null, 2));

    // Send data to the backend API
    const response = await fetch('https://intelli-python-backend.onrender.com/reservations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include any necessary authentication headers
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create reservation:', response.status, response.statusText, errorData);
      return { success: false, error: errorData.message || 'An error occurred while creating the reservation.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { success: false, error: 'An error occurred while creating the reservation.' };
  }
}

export async function handleCreateReservation(
  state: ReservationState,
  formData: FormData
): Promise<ReservationState> {
  return await createReservation(formData);
}