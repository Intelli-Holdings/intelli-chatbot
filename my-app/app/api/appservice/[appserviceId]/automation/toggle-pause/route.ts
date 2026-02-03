import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { appserviceId: string } }
) {
  try {
    const { appserviceId } = params;

    // Get authentication token from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const response = await fetch(
      `${API_BASE_URL}/appservice/${appserviceId}/automation/toggle-pause/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to toggle automation pause' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to toggle automation pause:', error);
    return NextResponse.json(
      { error: 'Failed to toggle automation pause' },
      { status: 500 }
    );
  }
}
