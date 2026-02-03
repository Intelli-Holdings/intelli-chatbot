import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react'; // Import useAuth hook from Clerk

interface Reservation {
    id: number;
    first_name: string;
    last_name: string;
    customer_email: string;
    customer_phone: string;
    number_of_adult_guests: number;
    number_of_child_guests: number;
    room_type: string;
    check_in_date: string;
    check_out_date: string;
    amount_paid: string;
    status: string;
}

export const useFetchReservations = (): { reservations: Reservation[] | null; isLoading: boolean; error: Error | null } => {
    const [reservations, setReservations] = useState<Reservation[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const { getToken } = useAuth(); // Use the useAuth hook to get the getToken method

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const token = await getToken(); // Retrieve the session token
                const response = await fetch('https://intelli-python-backend.onrender.com/dashboard/reservations/', {
                    headers: {
                        // Include the token in the Authorization header
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch reservations');
                }
                const data = await response.json();
                setReservations(data.reservations);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            } finally {
                setIsLoading(false); // Set isLoading state to false regardless of success or failure
            }
        };

        fetchReservations();
    }, [getToken]); // Add getToken as a dependency to useEffect

    return { reservations, isLoading, error }; // Return reservations, isLoading, and error state variables
};