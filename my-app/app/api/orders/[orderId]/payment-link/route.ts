import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

/**
 * POST /api/orders/[orderId]/payment-link
 * Send payment link for an order
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    if (!body.provider) {
      return NextResponse.json(
        { error: 'Payment provider is required' },
        { status: 400 }
      );
    }

    if (!body.customer_phone) {
      return NextResponse.json(
        { error: 'Customer phone is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment-link/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to send payment link' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/orders/[orderId]/payment-link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
