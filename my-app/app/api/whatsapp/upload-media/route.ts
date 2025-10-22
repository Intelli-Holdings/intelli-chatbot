import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const accessToken = formData.get('accessToken') as string;
    const phoneNumberId = formData.get('phoneNumberId') as string; // For Media API
    const uploadType = formData.get('uploadType') as string || 'resumable'; // 'resumable' or 'media'

    // Get APP_ID from environment variable
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

    // 🔒 Validate parameters
    if (!file || !accessToken) {
      return NextResponse.json(
        {
          error: `Missing required parameters: ${
            !file ? 'file ' : ''
          }${!accessToken ? 'accessToken' : ''}`,
        },
        { status: 400 }
      );
    }

    if (!appId) {
      return NextResponse.json(
        { error: 'Facebook APP_ID not configured. ' },
        { status: 500 }
      );
    }

    // ✅ Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // ✅ Validate size
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds limit. Maximum size: 100MB, Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 }
      );
    }

    // Use Media API for carousel sending (returns media ID)
    if (uploadType === 'media') {
      if (!phoneNumberId) {
        return NextResponse.json(
          { error: 'Phone number ID required for Media API upload' },
          { status: 400 }
        );
      }

      // Use multipart/form-data with proper boundary
      const buffer = Buffer.from(await file.arrayBuffer());
      const boundary = `----WebKitFormBoundary${Date.now()}`;
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

      // Build multipart form data manually
      const parts = [];
      parts.push(`--${boundary}\r\n`);
      parts.push(`Content-Disposition: form-data; name="messaging_product"\r\n\r\n`);
      parts.push(`whatsapp\r\n`);
      parts.push(`--${boundary}\r\n`);
      parts.push(`Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n`);
      parts.push(`Content-Type: ${file.type}\r\n\r\n`);

      const header = Buffer.from(parts.join(''), 'utf-8');
      const footer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
      const body = Buffer.concat([header, buffer, footer]);

      const mediaResponse = await fetch(
        `https://graph.facebook.com/v23.0/${phoneNumberId}/media`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
          },
          body: body
        }
      );

      if (!mediaResponse.ok) {
        const mediaError = await mediaResponse.json();
        console.error('Media API Error:', mediaError);
        return NextResponse.json(
          { error: mediaError.error?.message || 'Failed to upload via Media API' },
          { status: mediaResponse.status }
        );
      }

      const mediaResult = await mediaResponse.json();
      console.log('Media API Success:', mediaResult);

      return NextResponse.json({
        success: true,
        id: mediaResult.id,  // Media ID for sending messages
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
      });
    }

    //Step 1: Start upload session using APP_ID (Resumable Upload for template creation)
    const sessionUrl = `https://graph.facebook.com/v23.0/${appId}/uploads`;

    const sessionParams = new URLSearchParams({
      file_name: file.name,
      file_length: file.size.toString(),
      file_type: file.type,
      access_token: accessToken
    });

    const sessionResponse = await fetch(`${sessionUrl}?${sessionParams}`, {
      method: 'POST'
    });

    if (!sessionResponse.ok) {
      const sessionError = await sessionResponse.json();
      return NextResponse.json(
        { error: sessionError.error?.message || 'Failed to create upload session' },
        { status: sessionResponse.status }
      );
    }

    const sessionData = await sessionResponse.json();
    const uploadSessionId = sessionData.id;

    //Step 2: Upload file data using the upload session ID
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadUrl = `https://graph.facebook.com/v23.0/${uploadSessionId}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${accessToken}`,
        'file_offset': '0'
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const uploadError = await uploadResponse.json();
      return NextResponse.json(
        { error: uploadError.error?.message || 'Failed to upload file data' },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();
    const mediaHandle = uploadResult.h;

    if (!mediaHandle) {
      return NextResponse.json(
        { error: 'No media handle returned from upload' },
        { status: 500 }
      );
    }

    // Return the handle
    return NextResponse.json({
      success: true,
      handle: mediaHandle,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size,
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}