"use client"

import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { DashComponent } from "@/components/component/dash";
import { useAuthState } from '@/lib/firebase/auth';

export default function Page() {
  const router = useRouter();
  const user = useAuthState();

  useLayoutEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else {
      router.push('/dashboard');
    }
  }, [router, user]);

  return (
    <div className="h-full">
      <DashComponent />
    </div>
  );
}