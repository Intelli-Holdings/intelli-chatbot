/**
 * Shared API helpers for commerce services.
 *
 * Provides authenticated fetch for all commerce backend calls.
 * Uses Clerk JWT token from the browser session.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const COMMERCE_URL = (orgId: string) => `${API_BASE}/commerce/org/${orgId}`;

/**
 * Get Clerk JWT auth headers.
 */
/**
 * Get Clerk JWT token.
 * Uses window.Clerk which is populated by ClerkProvider.
 */
export async function getClerkToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    // @ts-expect-error - Clerk is loaded globally via ClerkProvider
    const clerk = window.Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
  } catch {
    // Clerk not ready
  }
  return null;
}

/**
 * Authenticated fetch for commerce API requests.
 * Automatically attaches Clerk JWT and Content-Type headers.
 *
 * @param url - Full URL to fetch
 * @param options - Standard RequestInit options
 * @param token - Optional pre-fetched JWT token (from useAuth hook)
 */
export async function commerceFetch(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  // Use provided token or try to get one
  const authToken = token ?? await getClerkToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> || {}),
    },
  });
}
