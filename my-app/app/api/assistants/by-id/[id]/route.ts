import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// DELETE - Delete an assistant by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // Check authentication and get session token
  const { userId, getToken } = auth()

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

    console.log('Deleting assistant ID:', id)

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

    console.log('Backend delete response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend delete error:', errorData)
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

    console.log('Assistant deleted successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting assistant:', error)
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
  const { userId, getToken } = auth()

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

    console.log('Updating assistant ID:', id, 'with data:', body)

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

    console.log('Backend update response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend update error:', errorData)
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

    console.log('Assistant updated successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating assistant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
