import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// POST - Create file version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

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
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${id}/create_version/`,
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
        { error: errorData.detail || 'Failed to create file version' }, 
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
