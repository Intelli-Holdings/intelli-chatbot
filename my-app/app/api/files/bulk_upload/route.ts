import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { logger } from "@/lib/logger";

// POST - Bulk upload files
export async function POST(request: NextRequest) {
  try {
    // Get authentication from Clerk
    const { getToken, userId } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user email from Clerk
    const clerkUser = userId ? await clerkClient.users.getUser(userId) : null
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || 'anonymous@email.com'

    const formData = await request.formData()

    // Add user email as uploaded_by
    formData.append('uploaded_by', userEmail)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/bulk_upload/`,
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
      logger.error("Backend error during bulk upload", { error: errorData })
      return NextResponse.json(
        { error: errorData.detail || 'Failed to bulk upload files' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error bulk uploading files", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
