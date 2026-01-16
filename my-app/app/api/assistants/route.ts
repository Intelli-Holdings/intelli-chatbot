import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// POST - Create a new assistant
export async function POST(request: NextRequest) {
  // Check authentication and get session token
  const { userId, getToken } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get Clerk JWT token to forward to backend
  const token = await getToken()

  if (!token) {
    return NextResponse.json(
      { error: 'Unable to get authentication token' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
