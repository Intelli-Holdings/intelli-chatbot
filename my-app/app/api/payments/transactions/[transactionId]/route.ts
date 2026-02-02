import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ transactionId: string }>;
}

/**
 * GET /api/payments/transactions/[transactionId]
 * Get a specific transaction
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { transactionId } = await params;

    const response = await fetch(
      `${API_BASE_URL}/payments/transactions/${transactionId}/`,
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
        { error: errorData.error || errorData.detail || 'Failed to fetch transaction' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/payments/transactions/[transactionId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
