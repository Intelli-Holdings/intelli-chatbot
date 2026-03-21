import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from "@/lib/logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/whatsapp/media/upload-from-azure
 *
 * Proxy to backend: POST /broadcast/whatsapp/templates/upload_from_azure/
 *
 * Purpose: Transfer media from Azure Blob Storage to Meta's WhatsApp API.
 * This is called after the browser uploads directly to Azure.
 *
 * Part of the Azure Direct Upload flow for large media files.
 * See: /lib/azure-media-upload.ts for full documentation.
 */
export async function POST(request: NextRequest) {
  try {
    const { getToken, orgId } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Add organization ID to the request body (required by backend)
    const bodyWithOrg = {
      ...body,
      organization: orgId,
    };

    const response = await fetch(
      `${BASE_URL}/broadcast/whatsapp/templates/upload_from_azure/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyWithOrg),
      }
    );

    const rawText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { detail: rawText };
    }

    if (!response.ok) {
      const message =
        (data.error as string) ||
        (data.detail as string) ||
        (data.message as string) ||
        rawText ||
        'Failed to upload from Azure';

      logger.error('Backend upload_from_azure failed', { message });
      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error uploading from Azure', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
