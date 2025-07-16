import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

// GET /api/assistants/files - List files for an assistant
export async function GET(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = getAuth(request)
    const token = await getToken()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('assistant_id')
    const page = searchParams.get('page') || '1'
    const pageSize = searchParams.get('page_size') || '20'
    
    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistant_id is required' }, 
        { status: 400 }
      )
    }
    
    const queryParams = new URLSearchParams({
      assistant_id: assistantId,
      page,
      page_size: pageSize,
    })
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
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

// POST /api/assistants/files - Upload single file
export async function POST(request: NextRequest) {
  try {
    // Get authentication token from Clerk
    const { getToken } = getAuth(request)
    const token = await getToken()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const formData = await request.formData()
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || errorData.error || 'Failed to upload file' }, 
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
