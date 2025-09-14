// app/api/whatsapp/upload-media/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const accessToken = formData.get('accessToken') as string;
    const appId = formData.get('appId') as string; // This is the App ID for upload session
    const phoneNumberId = formData.get('phoneNumberId') as string; // Phone number ID for media endpoint

    if (!file || !accessToken || !appId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Create upload session using query parameters (as per Meta docs)
    const createSessionUrl = `https://graph.facebook.com/v23.0/${appId}/uploads?` +
      new URLSearchParams({
        'file_name': file.name,
        'file_length': file.size.toString(),
        'file_type': file.type,
        'access_token': accessToken
      });

    console.log('Creating upload session:', createSessionUrl);

    const sessionResponse = await fetch(createSessionUrl, {
      method: 'POST'
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
    const uploadSessionId = sessionData.id; // This will be like "upload:XXXX"
    
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

    // Step 3: Get the media ID from the uploaded media
    // Use the standard media upload API to get the media ID
    const mediaFormData = new FormData();
    mediaFormData.append('messaging_product', 'whatsapp');
    mediaFormData.append('file', new Blob([buffer], { type: file.type }), file.name);

    // Use phone number ID for the media endpoint if available, otherwise fallback to appId
    const mediaEndpointId = phoneNumberId || appId;
    const mediaResponse = await fetch(`https://graph.facebook.com/v23.0/${mediaEndpointId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: mediaFormData
    });

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      console.error('Media ID fetch error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to get media ID' },
        { status: mediaResponse.status }
      );
    }

    const mediaData = await mediaResponse.json();
    
    console.log('Media ID obtained:', mediaData.id);
    
    // Return both the resumable upload handle and the media ID
    return NextResponse.json({ 
      success: true, 
      handle: uploadData.h, // Resumable upload handle
      mediaId: mediaData.id, // Media ID for template messages
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