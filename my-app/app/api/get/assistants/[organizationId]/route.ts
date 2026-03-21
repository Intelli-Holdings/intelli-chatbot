import { NextRequest, NextResponse } from 'next/server'
import { logger } from "@/lib/logger";

// GET - List assistants for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { organizationId } = params
  
  try {
    logger.debug("API route called", { organizationId })
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error("Backend error fetching assistants", { error: errorData })
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch assistants' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error fetching assistants", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
