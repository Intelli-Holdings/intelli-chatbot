import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useUserData = () => {
  const { user } = useUser();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const fetchUserData = useCallback(async (userEmail: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appservice/list/${userEmail}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setPhoneNumber(data[0].phone_number);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    if (user && user.primaryEmailAddress) {
      fetchUserData(user.primaryEmailAddress.emailAddress);
    }
  }, [user, fetchUserData]);

  return { phoneNumber };
};
