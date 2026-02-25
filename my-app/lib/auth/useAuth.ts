// useAuth.ts
import { useState, useEffect } from 'react';
import { getProfile, logout } from '@/lib/auth/authService';
import { logger } from "@/lib/logger";

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
        if (profile && profile['My profile']) {
          // Transform UserProfile to User format
          setUser({
            photoURL: null,
            displayName: profile['My profile'].username,
            email: profile['My profile'].email,
            firstName: null,
            companyName: profile['My profile'].company_name,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        logger.error('Error fetching user profile', { error: error instanceof Error ? error.message : String(error) });
      }
    };

    fetchProfile();
  }, []);

  const signOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      logger.error('Error signing out', { error: error instanceof Error ? error.message : String(error) });
    }
  };

  return { user, signOut };
};

export default useAuth;