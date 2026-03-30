'use client';

import { RedirectToSignUp } from '@clerk/nextjs';

/**
 * @deprecated Use the Clerk <SignUp /> component in /auth/sign-up instead.
 */
export default function SignUpComponent() {
  return <RedirectToSignUp />;
}
