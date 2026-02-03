// components/Logout.tsx or components/Logout.js
'use client';
import { useRouter } from 'next/navigation';
import useAuth from '@/lib/auth/useAuth';
import { useEffect } from 'react';

const Logout: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  return null; // or you can render a loading spinner or message
};

export default Logout;