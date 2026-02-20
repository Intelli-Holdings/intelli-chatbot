import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic'

// GET - Get pending and failed files for an assistant
export async function GET(request: NextRequest) {
  try {
    // Get authentication from Clerk
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('assistant_id')

    if (!assistantId) {
      return NextResponse.json(
        { error: 'assistant_id parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/pending_files/?assistant_id=${assistantId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error("Backend error fetching pending files", { error: errorData })
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch pending/failed files' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error fetching pending/failed files", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
