import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const accessToken = formData.get('accessToken') as string;
    
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

    console.log('Starting Resumable Upload for:', { 
      name: file.name, 
      size: file.size, 
      type: file.type,
      appId 
    });

    //Step 1: Start upload session using APP_ID
    const sessionUrl = `https://graph.facebook.com/v23.0/${appId}/uploads`;
    
    const sessionParams = new URLSearchParams({
      file_name: file.name,
      file_length: file.size.toString(),
      file_type: file.type,
      access_token: accessToken
    });

    console.log('Creating upload session...');
    const sessionResponse = await fetch(`${sessionUrl}?${sessionParams}`, {
      method: 'POST'
    });

    if (!sessionResponse.ok) {
      const sessionError = await sessionResponse.json();
      console.error('Session creation failed:', sessionError);
      return NextResponse.json(
        { error: sessionError.error?.message || 'Failed to create upload session' },
        { status: sessionResponse.status }
      );
    }

    const sessionData = await sessionResponse.json();
    const uploadSessionId = sessionData.id;

    console.log('Upload session created:', uploadSessionId);

    //Step 2: Upload file data using the upload session ID
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadUrl = `https://graph.facebook.com/v23.0/${uploadSessionId}`;

    console.log('Uploading file data...');
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
      console.error('File upload failed:', uploadError);
      return NextResponse.json(
        { error: uploadError.error?.message || 'Failed to upload file data' },
        { status: uploadResponse.status }
      );
    }

    const uploadResult = await uploadResponse.json();
    const mediaHandle = uploadResult.h;

    if (!mediaHandle) {
      console.error('No handle returned:', uploadResult);
      return NextResponse.json(
        { error: 'No media handle returned from upload' },
        { status: 500 }
      );
    }

    console.log('Upload to META successful! Media handle:', mediaHandle);

    // Return the handle
    return NextResponse.json({
      success: true,
      handle: mediaHandle,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}