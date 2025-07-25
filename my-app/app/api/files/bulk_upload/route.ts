import { NextRequest, NextResponse } from 'next/server'

// POST - Bulk upload files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/bulk_upload/`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to bulk upload files' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error bulk uploading files:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
