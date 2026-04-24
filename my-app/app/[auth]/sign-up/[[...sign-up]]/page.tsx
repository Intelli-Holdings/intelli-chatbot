'use client';

import { SignUp } from "@clerk/nextjs";
import { Navbar } from '@/components/navbar';
import { AuthErrorBoundary } from '@/components/auth-error-boundary';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Page() {
  // Force full remount of SignUp (and its CAPTCHA widget) when the URL
  // changes — e.g. after the SSO callback redirect back to /auth/sign-up.
  // Without this, Next.js reuses the partially-hydrated component and the
  // CAPTCHA script never re-initializes.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Forward ?redirect_url=... from the middleware into Clerk so users land on
  // the protected route they were trying to reach after sign-up.
  const redirectUrl = searchParams.get('redirect_url') || undefined;

  return (
    <div className="flex justify-center py-24">
      <Navbar />
      <AuthErrorBoundary>
        <SignUp key={pathname} fallbackRedirectUrl={redirectUrl} />
      </AuthErrorBoundary>
    </div>
  );
}
