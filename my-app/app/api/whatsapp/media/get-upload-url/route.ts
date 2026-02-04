import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/whatsapp/media/get-upload-url
 *
 * Proxy to backend: POST /broadcast/whatsapp/templates/get_upload_url/
 *
 * Purpose: Get a SAS URL for direct browser upload to Azure Blob Storage.
 * This is a small JSON request that bypasses server body size limits.
 *
 * Part of the Azure Direct Upload flow for large media files.
 * See: /lib/azure-media-upload.ts for full documentation.
 */
export async function POST(request: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${BASE_URL}/broadcast/whatsapp/templates/get_upload_url/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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
        'Failed to get upload URL';

      console.error('Backend get_upload_url failed:', message);
      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
