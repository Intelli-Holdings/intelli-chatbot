import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

/**
 * GET /api/payments/config
 * Get all payment configurations for an organization
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/payments/config/?organization_id=${encodeURIComponent(organizationId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to fetch payment configs' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ configs: data });
  } catch (error) {
    console.error('Error in GET /api/payments/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/config
 * Create a new payment configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, ...config } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!config.provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/payments/config/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization_id: organizationId,
        ...config,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to create payment config' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/payments/config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
