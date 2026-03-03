/**
 * Contacts Service - Handles all contacts-related API calls
 * Uses Next.js API routes that proxy to Django backend
 */

import { logger } from "@/lib/logger";

export interface Contact {
  id: number;
  organization: number;
  phone: string;
  email?: string;
  name?: string;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface ContactsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Contact[];
}

/**
 * Fetch contacts count for an organization
 */
export async function getContactsCount(organizationId: string): Promise<number> {
  try {
    // Fetch first page with page_size=1 to get the count efficiently
    const url = `/api/contacts/contacts?organization=${organizationId}&page=1&page_size=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch contacts count: ${response.statusText}`);
    }

    const data: ContactsListResponse = await response.json();
    return data.count || 0;
  } catch (error) {
    logger.error('Error fetching contacts count', { error: error instanceof Error ? error.message : String(error) });
    return 0;
  }
}

/**
 * Fetch all contacts for an organization (paginated)
 */
export async function getContacts(
  organizationId: string,
  params?: {
    page?: number;
    pageSize?: number;
    tags?: string;
  }
): Promise<ContactsListResponse> {
  const queryParams = new URLSearchParams({
    organization: organizationId,
    page: (params?.page || 1).toString(),
    page_size: (params?.pageSize || 50).toString(),
  });

  if (params?.tags) {
    queryParams.append('tags__slug__in', params.tags);
  }

  const url = `/api/contacts/contacts?${queryParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch contacts: ${response.statusText}`);
  }

  return response.json();
}
