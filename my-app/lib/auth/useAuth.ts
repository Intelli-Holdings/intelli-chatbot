// useAuth.ts
import { useState, useEffect } from 'react';
import { getProfile, logout } from '@/lib/auth/authService';

interface User {
  id: number;
  email: string;
  role: string | null;
  is_email_verified: boolean;
  company_name: string;
  username: string;
}

interface UserProfile {
  My_profile: User;
  email_verified?: string;
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile: UserProfile | null = await getProfile();
        if (profile && profile.My_profile) {
          setUser(profile.My_profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
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