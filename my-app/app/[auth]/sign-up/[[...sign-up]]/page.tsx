'use client';

import { SignUp } from "@clerk/nextjs";
import { Navbar } from '@/components/navbar';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';
import { usePathname } from 'next/navigation';

export default function Page() {
  // Force full remount of SignUp (and its CAPTCHA widget) when the URL
  // changes — e.g. after the SSO callback redirect back to /auth/sign-up.
  // Without this, Next.js reuses the partially-hydrated component and the
  // CAPTCHA script never re-initializes.
  const pathname = usePathname();

  return (
    <div className="flex justify-center py-24">
      <Navbar />
      <AuthErrorBoundary>
        <SignUp key={pathname} />
      </AuthErrorBoundary>
    </div>
  );
}
