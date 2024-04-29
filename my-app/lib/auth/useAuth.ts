// useAuth.ts
import { useState, useEffect } from 'react';
import { getProfile, logout } from '@/lib/auth/authService';

interface User {
  photoURL: string | null;
  displayName: string | null;
  email: string | null;
  firstName: string | null;
  companyName: string | null;
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const signOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return { user, signOut };
};

export default useAuth;