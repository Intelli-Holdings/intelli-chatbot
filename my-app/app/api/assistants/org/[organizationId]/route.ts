import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// GET - List assistants for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { organizationId } = params
  
  try {
    
    // Get authentication from Clerk (for same-origin requests)
    const { getToken } = auth()
    const token = await getToken()
    
    if (!token) {
      console.log('=== RETURNING 401 - No token ===')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`,
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
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch assistants' }, 
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching assistants:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST - Create a new assistant for an organization
export async function POST(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { organizationId } = params
  
  try {
    // Get authentication token from Clerk
    const { getToken } = auth()
    const token = await getToken()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Ensure the organization ID is in the request body
    const assistantData = {
      ...body,
      organization: organizationId
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${organizationId}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(assistantData),
      }
    )
    
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create assistant' }, 
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Assistant created successfully')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating assistant:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// PUT - Update an assistant in an organization
export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { organizationId } = params
  
  try {
    // Get authentication token from Clerk
    const { getToken } = auth()
    const token = await getToken()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { id, ...updateData } = body
    
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assistant ID is required' }, 
        { status: 400 }
      )
    }
    
    // Ensure the organization ID is in the request body
    const assistantData = {
      ...updateData,
      organization: organizationId
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${organizationId}/`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...assistantData }),
      }
    )
    
    console.log('Backend update response status')
    
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
      const responseText = await response.text();
      data = { 
        success: true, 
        message: 'Assistant updated successfully',
        responseText: responseText || 'No response body'
      };
    }
    
    console.log('Assistant updated successfully')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating assistant:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete an assistant from an organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { organizationId } = params
  
  try {
    // Get authentication token from Clerk
    const { getToken } = auth()
    const token = await getToken()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const url = new URL(request.url)
    const assistantId = url.searchParams.get('assistantId')
    
    
    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required' }, 
        { status: 400 }
      )
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${organizationId}/`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: assistantId }),
      }
    )
    
    console.log('Backend delete response status')
    
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
      const responseText = await response.text();
      data = { 
        success: true, 
        message: 'Assistant deleted successfully',
        responseText: responseText || 'No response body'
      };
    }
    
    console.log('Assistant deleted successfully')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting assistant:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
