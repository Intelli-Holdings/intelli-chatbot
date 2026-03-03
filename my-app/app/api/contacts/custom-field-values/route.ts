import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from "@/lib/logger";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * GET /api/contacts/custom-field-values
 * Fetch custom field values for a contact or organization
 */
export async function GET(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const contact = searchParams.get('contact');
    const contactOrganization = searchParams.get('contact__organization');

    if (!contact && !contactOrganization) {
      return NextResponse.json(
        { error: 'Contact or contact__organization parameter is required' },
        { status: 400 }
      );
    }

    const url = new URL(`${API_BASE_URL}/contacts/custom-field-values/`);
    if (contact) url.searchParams.set('contact', contact);
    if (contactOrganization) url.searchParams.set('contact__organization', contactOrganization);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error("Error fetching custom field values", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to fetch custom field values' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts/custom-field-values
 * Create or update a custom field value for a contact
 */
export async function POST(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/contacts/custom-field-values/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error("Error creating custom field value", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to create custom field value' },
      { status: 500 }
    );
  }
}
