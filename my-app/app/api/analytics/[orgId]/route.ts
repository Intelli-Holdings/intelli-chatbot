import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const { orgId } = params
    
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    
    if (!apiBaseUrl) {
      return NextResponse.json(
        { error: 'API base URL not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${apiBaseUrl}/monitoring/get_metrics_by_organization/${orgId}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch metrics: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
