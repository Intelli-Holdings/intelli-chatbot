import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// GET - List assistant files
export async function GET(request: NextRequest) {
  try {
    // Get authentication from Clerk
    const { getToken } = auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('assistant_id')

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistant_id parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/?assistant_id=${assistantId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch files' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST - Upload file
export async function POST(request: NextRequest) {
  try {
    // Get authentication from Clerk
    const { getToken, userId } = auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user email from Clerk
    const clerkUser = userId ? await clerkClient().users.getUser(userId) : null
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || 'anonymous@example.com'

    const formData = await request.formData()

    // Add user email as uploaded_by
    formData.append('uploaded_by', userEmail)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to upload file' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
