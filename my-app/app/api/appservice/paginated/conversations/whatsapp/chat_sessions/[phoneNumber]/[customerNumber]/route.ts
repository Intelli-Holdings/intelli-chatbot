import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { phoneNumber: string; customerNumber: string } }
) {
  try {
    const { phoneNumber, customerNumber } = params;

    // Get authentication token from Clerk
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '50';

    // Add timing for progress calculation
    const startTime = Date.now();

    const response = await fetch(
      `${API_BASE_URL}/appservice/paginated/conversations/whatsapp/chat_sessions/${phoneNumber}/${customerNumber}/?page=${page}&page_size=${pageSize}`,
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
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Add metadata for client-side progress tracking
    return NextResponse.json({
      ...data,
      meta: {
        loadTime,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch messages for customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages for customer' },
      { status: 500 }
    );
  }
}
