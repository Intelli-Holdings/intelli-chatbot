import { NextRequest, NextResponse } from 'next/server'

// GET /api/assistants/files/test/file-stats - Test file statistics without authentication
export async function GET(request: NextRequest) {
  try {
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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/test/file-stats/?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch test file statistics' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching test file statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
