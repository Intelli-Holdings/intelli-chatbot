import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const accessToken = formData.get('accessToken') as string;
    const appId = formData.get('appId') as string;

    if (!file || !accessToken || !appId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Create upload session
    const createSessionUrl = `https://graph.facebook.com/v22.0/${appId}/uploads`;
    const sessionResponse = await fetch(createSessionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'file_type': file.type,
        'file_length': file.size.toString(),
        'file_name': file.name
      })
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

    // Step 2: Upload the file to the session
    const uploadUrl = `https://graph.facebook.com/v22.0/${uploadSessionId}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'file_offset': '0',
        'Content-Type': file.type,
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
    
    // Return the media handle
    return NextResponse.json({ 
      success: true, 
      handle: uploadData.h,
      sessionId: uploadSessionId 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}
