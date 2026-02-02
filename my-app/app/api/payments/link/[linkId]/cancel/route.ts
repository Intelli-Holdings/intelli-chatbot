import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ linkId: string }>;
}

/**
 * POST /api/payments/link/[linkId]/cancel
 * Cancel a payment link
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { linkId } = await params;

    const response = await fetch(`${API_BASE_URL}/payments/link/${linkId}/cancel/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to cancel payment link' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/payments/link/[linkId]/cancel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
