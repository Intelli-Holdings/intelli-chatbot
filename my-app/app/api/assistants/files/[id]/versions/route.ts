import { NextRequest, NextResponse } from 'next/server'

// GET /api/assistants/files/[id]/versions - Get all versions of a file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${fileId}/versions/`,
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
        { error: errorData.detail || 'Failed to fetch file versions' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching file versions:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
