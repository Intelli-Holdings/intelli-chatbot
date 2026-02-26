import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

import { logger } from "@/lib/logger";
// DELETE - Delete an assistant by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

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
    if (!id) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      )
    }

    logger.info('Deleting assistant ID:', { data: id })

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${id}/`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    logger.info('Backend delete response status:', { data: response.status })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error('Backend delete error:', { error: errorData instanceof Error ? errorData.message : String(errorData) })
      return NextResponse.json(
        { error: errorData.detail || 'Failed to delete assistant' },
        { status: response.status }
      )
    }

    // Handle both JSON and non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If no JSON response, create a success response
      const responseText = await response.text();
      data = {
        success: true,
        message: 'Assistant deleted successfully',
        responseText: responseText || 'No response body'
      };
    }

    logger.info('Assistant deleted successfully:', { data: data })
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Error deleting assistant:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update an assistant by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

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
    if (!id) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    logger.info('Updating assistant ID:', { id: id, arg1: 'with data:', body: body })

    // Remove the id from the body since it's in the URL path
    const { id: bodyId, ...updateData } = body

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${id}/`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    )

    logger.info('Backend update response status:', { data: response.status })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error('Backend update error:', { error: errorData instanceof Error ? errorData.message : String(errorData) })
      return NextResponse.json(
        { error: errorData.detail || 'Failed to update assistant' },
        { status: response.status }
      )
    }

    // Handle both JSON and non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If no JSON response, create a success response
      const responseText = await response.text();
      data = {
        success: true,
        message: 'Assistant updated successfully',
        responseText: responseText || 'No response body'
      };
    }

    logger.info('Assistant updated successfully:', { data: data })
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Error updating assistant:', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
