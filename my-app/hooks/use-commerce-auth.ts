/**
 * Hook to provide Clerk auth token for commerce API calls.
 * Ensures token is available before making requests.
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

/**
 * Returns a getToken function that reliably gets the Clerk JWT.
 * Use this in commerce hooks to pass the token to commerceFetch.
 */
export function useCommerceAuth() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchToken = useCallback(async (): Promise<string | null> => {
    if (!isLoaded || !isSignedIn) return null;
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken, isLoaded, isSignedIn]);

  return { getToken: fetchToken, isReady: isLoaded && isSignedIn };
}
