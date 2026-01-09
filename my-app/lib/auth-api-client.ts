/**
 * Authenticated API Client for Django Backend
 *
 * This utility provides type-safe API calls to your Django backend
 * with automatic Clerk JWT authentication.
 */

import { useAuth } from '@clerk/nextjs';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * API Error type
 */
export interface ApiError {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: any;
}

/**
 * User info from whoami endpoint
 */
export interface UserInfo {
  message: string;
  user: {
    clerk_id: string;
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    profile_image_url: string;
    is_staff: boolean;
  };
  token_info: {
    issuer: string;
    issued_at: number;
    expires_at: number;
    authorized_party: string;
    org_id?: string;
    org_role?: string;
    org_slug?: string;
  };
}

/**
 * Organization type
 */
export interface Organization {
  organization_id: string;
  name: string;
  slug: string;
  logo_url: string;
  members_count: number;
  membership: {
    id: string;
    role: string;
    role_name: string;
    permissions: string[];
    joined_at: string;
  };
}

/**
 * Organization detail type
 */
export interface OrganizationDetail {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
    image_url: string;
    members_count: number;
    business_phone_number: string;
    created_at: string;
  };
  your_membership: {
    role: string;
    role_name: string;
    permissions: string[];
    joined_at: string;
  };
}

/**
 * My organizations response
 */
export interface MyOrganizationsResponse {
  user_id: number;
  clerk_id: string;
  organizations: Organization[];
  total_count: number;
}

/**
 * Make an authenticated API request to Django backend
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add Authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-2xx responses
  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      error = {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const errorMessage = error.detail || error.error || error.message || 'API request failed';
    throw new Error(errorMessage);
  }

  // Return JSON for successful responses
  return response.json();
}

/**
 * Hook to get an API client with automatic Clerk token management
 */
export function useAuthApi() {
  const { getToken, isSignedIn } = useAuth();

  /**
   * Make an authenticated API call
   */
  const apiClient = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    // Get fresh token from Clerk
    const token = await getToken();

    if (!token) {
      throw new Error('Not authenticated. Please sign in.');
    }

    return fetchWithAuth(endpoint, options, token);
  };

  /**
   * GET request
   */
  const get = async <T = any>(endpoint: string): Promise<T> => {
    return apiClient<T>(endpoint, { method: 'GET' });
  };

  /**
   * POST request
   */
  const post = async <T = any>(endpoint: string, data: any): Promise<T> => {
    return apiClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  /**
   * PUT request
   */
  const put = async <T = any>(endpoint: string, data: any): Promise<T> => {
    return apiClient<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  /**
   * PATCH request
   */
  const patch = async <T = any>(endpoint: string, data: any): Promise<T> => {
    return apiClient<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  };

  /**
   * DELETE request
   */
  const del = async <T = any>(endpoint: string): Promise<T> => {
    return apiClient<T>(endpoint, { method: 'DELETE' });
  };

  return {
    apiClient,
    get,
    post,
    put,
    patch,
    delete: del,
    isSignedIn,
  };
}

/**
 * Specific API endpoint functions
 */

/**
 * Get current user info (whoami endpoint)
 */
export async function getUserInfo(token: string): Promise<UserInfo> {
  return fetchWithAuth('/auth/whoami/', {}, token);
}

/**
 * Get all organizations for the current user
 */
export async function getMyOrganizations(token: string): Promise<MyOrganizationsResponse> {
  return fetchWithAuth('/auth/my-organizations/', {}, token);
}

/**
 * Get organization details
 */
export async function getOrganizationDetail(
  orgId: string,
  token: string
): Promise<OrganizationDetail> {
  return fetchWithAuth(`/auth/organization/${orgId}/`, {}, token);
}

/**
 * Update organization phone number
 */
export async function updateOrganizationPhoneNumber(
  organizationId: string,
  phoneNumber: string,
  token: string,
  userPhone?: string,
  userEmail?: string
): Promise<{ message: string }> {
  return fetchWithAuth(
    '/auth/update/organization/phone-number/',
    {
      method: 'POST',
      body: JSON.stringify({
        organization_id: organizationId,
        phone_number: phoneNumber,
        user_phone: userPhone,
        user_email: userEmail,
      }),
    },
    token
  );
}

/**
 * Get phone numbers by organization
 */
export async function getOrganizationPhoneNumbers(
  orgId: string,
  token: string
): Promise<{
  main_business_phone_number: string;
  others: any[];
}> {
  return fetchWithAuth(`/auth/get/org/${orgId}/phone-numbers/`, {}, token);
}

/**
 * Get all organizations (returns only user's organizations)
 */
export async function getAllOrganizations(token: string): Promise<any[]> {
  return fetchWithAuth('/auth/get/all/organizations/', {}, token);
}

/**
 * Create onboarding info
 */
export async function createOnboarding(
  data: any,
  token: string
): Promise<any> {
  return fetchWithAuth('/auth/onboarding/', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}

/**
 * Update onboarding info
 */
export async function updateOnboarding(
  data: any,
  token: string
): Promise<any> {
  return fetchWithAuth('/auth/onboarding/', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token);
}
