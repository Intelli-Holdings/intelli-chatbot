import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// POST - Bulk delete assistants
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
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No assistant IDs provided' },
        { status: 400 }
      )
    }

    console.log('Bulk deleting assistants:', ids)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/bulk-delete/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      }
    )

    console.log('Backend bulk delete response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend bulk delete error:', errorData)
      return NextResponse.json(
        { error: errorData.error || errorData.detail || 'Failed to bulk delete assistants' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Assistants bulk deleted successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error bulk deleting assistants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
