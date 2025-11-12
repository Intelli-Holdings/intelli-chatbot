import { NextRequest, NextResponse } from 'next/server'

// POST - Create a new assistant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )
    
    console.log('Backend response status')
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create assistant' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Assistant created successfully')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating assistant:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
