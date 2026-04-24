'use client';

import { SignIn } from "@clerk/nextjs";
import { Navbar } from '@/components/navbar';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Page() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The middleware sends users here with ?redirect_url=<original URL>. Clerk v7
  // doesn't read that param automatically — forward it as fallbackRedirectUrl
  // so users land back where they were trying to go after sign-in.
  const redirectUrl = searchParams.get('redirect_url') || undefined;

  return (
    <div className="flex justify-center py-24">
      <Navbar />
      <AuthErrorBoundary>
        <SignIn key={pathname} fallbackRedirectUrl={redirectUrl} />
      </AuthErrorBoundary>
    </div>
  );
}
