import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const accessToken = formData.get('accessToken') as string;
    const wabaId = formData.get('wabaId') as string;

    if (!file || !accessToken || !wabaId) {
      return NextResponse.json(
        { error: `Missing required parameters: ${!file ? 'file' : ''} ${!accessToken ? 'accessToken' : ''} ${!wabaId ? 'wabaId' : ''}` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit. Maximum size: 100MB, Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Create upload session using query parameters (as per Meta docs)
    const createSessionUrl = `https://graph.facebook.com/v23.0/${wabaId}/uploads?` +
      new URLSearchParams({
        'file_name': file.name,
        'file_length': file.size.toString(),
        'file_type': file.type,
        'access_token': accessToken
      });

    console.log('Creating upload session:', createSessionUrl);
    console.log('Creating upload session with WABA ID:', wabaId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });


    const sessionResponse = await fetch(createSessionUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(30000),
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.json();
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to create upload session' },
        { status: sessionResponse.status }
      );
    }

    const sessionData = await sessionResponse.json();
    const uploadSessionId = sessionData.id;

    console.log('Upload session created:', uploadSessionId);

    // Step 2: Upload the file to the session
    // Use OAuth format for authorization as per Meta docs
    const uploadUrl = `https://graph.facebook.com/v23.0/${uploadSessionId}`;

    console.log('Uploading file to:', uploadUrl);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${accessToken}`, // OAuth format, not Bearer
        'file_offset': '0'
      },
      body: buffer
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to upload file' },
        { status: uploadResponse.status }
      );
    }

    const uploadData = await uploadResponse.json();

    console.log('Upload successful, handle:', uploadData.h);

    // Return the media handle (h field)
    return NextResponse.json({
      success: true,
      handle: uploadData.h, // This is what will be used in template creation
      sessionId: uploadSessionId,
      fileType: file.type,
      fileName: file.name
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}