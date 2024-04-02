'use server'

interface ReservationState {
  success: boolean;
}

export async function createReservation(formData: FormData) {
  try {
    // Extract form data
    const firstName = formData.get('firstName')?.toString() || '';
    const lastName = formData.get('lastName')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const phoneNumber = formData.get('phoneNumber')?.toString() || '';
    const adults = formData.get('adults')?.toString() || '';
    const children = formData.get('children')?.toString() || '';
    const roomType = formData.get('roomType')?.toString() || '';
    const checkInDate = formData.get('checkInDate')?.toString() || '';
    const checkOutDate = formData.get('checkOutDate')?.toString() || '';
    const amount = formData.get('amount')?.toString() || '';

    // Send data to the backend API
    const response = await fetch('https://intelli-python-backend.onrender.com/reservations/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phoneNumber,
        adults,
        children,
        roomType,
        checkInDate,
        checkOutDate,
        amount,
      }),
    });

    if (!response.ok) {
      const errorMessage = `Failed to create reservation: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
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