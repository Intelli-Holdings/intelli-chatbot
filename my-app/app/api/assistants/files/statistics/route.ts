import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

// GET /api/assistants/files/statistics - Get file statistics for an assistant
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
    
    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistant_id is required' }, 
        { status: 400 }
      )
    }
    
    const queryParams = new URLSearchParams({
      assistant_id: assistantId,
    })
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/statistics/?${queryParams}`,
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
        { error: errorData.detail || 'Failed to fetch file statistics' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching file statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
