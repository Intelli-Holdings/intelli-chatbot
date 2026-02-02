import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.intelliconcierge.com';

interface RouteParams {
  params: Promise<{ provider: string }>;
}

/**
 * Verify Paystack webhook signature
 */
function verifyPaystackSignature(
  body: string,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature) return false;
  const hash = crypto.createHmac('sha512', secretKey).update(body).digest('hex');
  return hash === signature;
}

/**
 * Verify Flutterwave webhook signature
 */
function verifyFlutterwaveSignature(
  signature: string | null,
  secretHash: string
): boolean {
  if (!signature) return false;
  return signature === secretHash;
}

/**
 * POST /api/payments/webhooks/[provider]
 * Handle payment provider webhooks
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { provider } = await params;
    const organizationId = request.nextUrl.searchParams.get('org');
    const body = await request.text();

    if (!organizationId) {
      console.error('Webhook missing organization ID');
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    // Log webhook receipt for debugging
    console.log(`[Webhook] Received ${provider} webhook for org ${organizationId}`);

    // Forward to backend for processing
    // Backend will verify signature and process the event
    const response = await fetch(
      `${API_BASE_URL}/payments/webhooks/${provider}/?organization_id=${organizationId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward signature headers
          'X-Paystack-Signature': request.headers.get('x-paystack-signature') || '',
          'Verif-Hash': request.headers.get('verif-hash') || '',
        },
        body,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Webhook] Backend error for ${provider}:`, errorData);

      // Return 200 to prevent retries for non-recoverable errors
      // Payment providers will retry on 5xx errors
      if (response.status >= 400 && response.status < 500) {
        return NextResponse.json({ received: true, error: 'Invalid webhook' }, { status: 200 });
      }

      return NextResponse.json(
        { error: errorData.error || 'Webhook processing failed' },
        { status: response.status }
      );
    }

    console.log(`[Webhook] Successfully processed ${provider} webhook`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Return 500 so providers will retry
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/webhooks/[provider]
 * Webhook verification endpoint (used by some providers)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { provider } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Handle Flutterwave webhook verification
    if (provider === 'flutterwave') {
      const verificationToken = searchParams.get('token');
      if (verificationToken) {
        return NextResponse.json({ status: 'success' });
      }
    }

    return NextResponse.json({ status: 'ok', provider });
  } catch (error) {
    console.error('Error in webhook GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
