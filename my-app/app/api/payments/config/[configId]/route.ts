import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ configId: string }>;
}

/**
 * GET /api/payments/config/[configId]
 * Get a specific payment configuration
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { configId } = await params;

    const response = await fetch(`${API_BASE_URL}/payments/config/${configId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to fetch payment config' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/payments/config/[configId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/payments/config/[configId]
 * Update a payment configuration
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { configId } = await params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/payments/config/${configId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to update payment config' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/payments/config/[configId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payments/config/[configId]
 * Delete a payment configuration
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { configId } = await params;

    const response = await fetch(`${API_BASE_URL}/payments/config/${configId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to delete payment config' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/payments/config/[configId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
