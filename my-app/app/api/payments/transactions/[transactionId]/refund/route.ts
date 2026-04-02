import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ transactionId: string }>;
}

/**
 * POST /api/payments/transactions/[transactionId]/refund
 * Refund a transaction
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { transactionId } = await params;
    const body = await request.json().catch(() => ({}));

    const response = await fetch(
      `${API_BASE_URL}/payments/transactions/${transactionId}/refund/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: body.amount,
          reason: body.reason,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to refund transaction' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/payments/transactions/[transactionId]/refund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
