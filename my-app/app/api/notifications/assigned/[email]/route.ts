import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  const { email } = params

  try {
    // Get authentication token from Clerk
    const { getToken, orgId: authOrgId } = await auth()
    const searchParams = new URLSearchParams(request.nextUrl.searchParams)
    const requestedOrgId =
      searchParams.get('organizationId') ?? searchParams.get('orgId') ?? authOrgId ?? undefined
    searchParams.delete('organizationId')
    searchParams.delete('orgId')
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (authOrgId && requestedOrgId && authOrgId !== requestedOrgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const queryString = searchParams.toString()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/assigned/to/${encodeURIComponent(email)}/${
        queryString ? `?${queryString}` : ''
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
        { error: 'Failed to fetch notifications' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
