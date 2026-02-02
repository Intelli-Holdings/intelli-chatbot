import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

/**
 * POST /api/payments/link
 * Create a payment link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, ...linkData } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!linkData.order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (!linkData.provider) {
      return NextResponse.json(
        { error: 'Payment provider is required' },
        { status: 400 }
      );
    }

    if (!linkData.amount || linkData.amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/payments/link/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organization_id: organizationId,
        ...linkData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to create payment link' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/payments/link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
