import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { organizationId } = params

  try {
    // Get authentication token from Clerk
    const { getToken, orgId: authOrgId } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (authOrgId && authOrgId !== organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/org/${organizationId}/${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch org notifications' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching org notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
