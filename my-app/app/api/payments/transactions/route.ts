import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

/**
 * GET /api/payments/transactions
 * Get transactions for an organization
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

    // Build query params for backend
    const backendParams = new URLSearchParams({
      organization_id: organizationId,
    });

    // Forward filter params
    const filterParams = [
      'provider',
      'status',
      'order_id',
      'customer_phone',
      'customer_email',
      'reference',
      'date_from',
      'date_to',
      'min_amount',
      'max_amount',
      'limit',
      'offset',
    ];

    filterParams.forEach((param) => {
      const values = searchParams.getAll(param);
      values.forEach((value) => {
        if (value) backendParams.append(param, value);
      });
    });

    const response = await fetch(
      `${API_BASE_URL}/payments/transactions/?${backendParams.toString()}`,
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
        { error: errorData.error || errorData.detail || 'Failed to fetch transactions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/payments/transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
