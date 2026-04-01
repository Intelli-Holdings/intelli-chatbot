import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/commerce/upload-image
 *
 * Proxies image upload to the backend which stores it in Azure Blob Storage.
 * Returns a publicly accessible URL.
 *
 * This avoids CORS issues with direct browser-to-Azure uploads.
 */
export async function POST(request: NextRequest) {
  try {
    const { getToken, orgId } = await auth();
    const token = await getToken();

    if (!token || !orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be under 5MB' },
        { status: 400 }
      );
    }

    // Upload to backend as a product image
    // Use the commerce product image endpoint — create a temp product or use direct Azure upload
    // For simplicity, proxy to the get_upload_url + server-side Azure upload
    const sasResponse = await fetch(
      `${BASE_URL}/broadcast/whatsapp/templates/get_upload_url/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          organization: orgId,
        }),
      }
    );

    if (!sasResponse.ok) {
      const err = await sasResponse.json().catch(() => ({}));
      logger.error('Failed to get upload URL', { error: err });
      return NextResponse.json(
        { error: 'Failed to prepare upload' },
        { status: 502 }
      );
    }

    const { upload_url, blob_url } = await sasResponse.json();

    // Upload to Azure from the server (no CORS issues)
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const azureResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
      body: fileBuffer,
    });

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text().catch(() => '');
      logger.error('Azure upload failed', { status: azureResponse.status, error: errorText });
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: blob_url });
  } catch (error) {
    logger.error('Image upload error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
