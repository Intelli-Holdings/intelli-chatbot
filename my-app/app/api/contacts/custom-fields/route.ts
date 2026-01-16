import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * GET /api/contacts/custom-fields
 * Fetch all custom fields for an organization
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
    const organization = searchParams.get('organization');

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization parameter is required' },
        { status: 400 }
      );
    }

    const url = new URL(`${API_BASE_URL}/contacts/custom-fields/`);
    url.searchParams.set('organization', organization);

    console.log('Fetching custom fields from:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend error:', response.status, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom fields', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts/custom-fields
 * Create a new custom field
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

    console.log('Creating custom field:', body);
    console.log('API_BASE_URL:', API_BASE_URL);

    const response = await fetch(`${API_BASE_URL}/contacts/custom-fields/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }

      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('Custom field created successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating custom field:', error);
    return NextResponse.json(
      { error: 'Failed to create custom field', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
