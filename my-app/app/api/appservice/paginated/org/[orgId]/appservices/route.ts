import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const { orgId } = params;

    // Get authentication token from Clerk
    const { getToken } = auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const response = await fetch(
      `${API_BASE_URL}/appservice/paginated/org/${orgId}/appservices/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
