import { NextRequest, NextResponse } from 'next/server'

// POST /api/assistants/files/[id]/create-version - Create a new version of a file
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id
    const formData = await request.formData()
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${fileId}/create_version/`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || errorData.error || 'Failed to create file version' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating file version:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
