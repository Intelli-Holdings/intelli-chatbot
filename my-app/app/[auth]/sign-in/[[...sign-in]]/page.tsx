'use client';

import { SignIn } from "@clerk/nextjs";
import { Navbar } from '@/components/navbar';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';
import { usePathname } from 'next/navigation';

export default function Page() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center py-24">
      <Navbar />
      <AuthErrorBoundary>
        <SignIn key={pathname} />
      </AuthErrorBoundary>
    </div>
  );
}
