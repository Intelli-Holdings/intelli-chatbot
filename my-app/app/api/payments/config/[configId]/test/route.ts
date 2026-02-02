import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ configId: string }>;
}

/**
 * POST /api/payments/config/[configId]/test
 * Test a payment configuration
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { configId } = await params;

    const response = await fetch(`${API_BASE_URL}/payments/config/${configId}/test/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.error || errorData.detail || 'Failed to test payment config',
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.message || 'Configuration test successful',
      details: data.details,
    });
  } catch (error) {
    console.error('Error in POST /api/payments/config/[configId]/test:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
