import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

// POST - Bulk upload files
export async function POST(request: NextRequest) {
  try {
    // Get user email from Clerk
    const { userId } = auth()
    const clerkUser = userId ? await clerkClient().users.getUser(userId) : null
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || 'anonymous@example.com'

    const formData = await request.formData()
    
    // Add user email as uploaded_by_name
    formData.append('uploaded_by_name', userEmail)
    
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
