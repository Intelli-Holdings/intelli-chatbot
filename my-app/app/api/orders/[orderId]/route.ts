import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

/**
 * GET /api/orders/[orderId]
 * Get a specific order
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to fetch order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/orders/[orderId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[orderId]
 * Update an order
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to update order' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/orders/[orderId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[orderId]
 * Delete an order
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to delete order' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/orders/[orderId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
