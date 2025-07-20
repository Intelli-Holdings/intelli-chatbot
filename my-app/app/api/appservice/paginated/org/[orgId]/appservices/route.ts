import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_DEV_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const { orgId } = params;
    
    const response = await fetch(
      `${API_BASE_URL}/appservice/paginated/org/${orgId}/appservices/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authentication headers
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch paginated app services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paginated app services' },
      { status: 500 }
    );
  }
}
