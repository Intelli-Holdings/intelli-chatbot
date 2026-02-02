import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

/**
 * GET /api/payments/transactions/stats
 * Get transaction statistics
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

    const backendParams = new URLSearchParams({
      organization_id: organizationId,
    });

    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    if (dateFrom) backendParams.set('date_from', dateFrom);
    if (dateTo) backendParams.set('date_to', dateTo);

    const response = await fetch(
      `${API_BASE_URL}/payments/transactions/stats/?${backendParams.toString()}`,
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
        { error: errorData.error || errorData.detail || 'Failed to fetch transaction stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/payments/transactions/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
