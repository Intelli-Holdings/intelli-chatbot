import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from "@/lib/logger";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * GET /api/contacts/import-mappings
 * Fetch all import mappings for an organization
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
    const channel = searchParams.get('channel');

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization parameter is required' },
        { status: 400 }
      );
    }

    const url = new URL(`${API_BASE_URL}/contacts/import-mappings/`);
    url.searchParams.set('organization', organization);
    if (channel) url.searchParams.set('channel', channel);

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
    logger.error("Error fetching import mappings", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to fetch import mappings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts/import-mappings
 * Create a new import mapping
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

    const response = await fetch(`${API_BASE_URL}/contacts/import-mappings/`, {
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
    logger.error("Error creating import mapping", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to create import mapping' },
      { status: 500 }
    );
  }
}
