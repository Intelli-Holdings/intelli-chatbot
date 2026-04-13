import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { logger } from "@/lib/logger";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; instagramAccountId: string }> }
) {
  try {
    const { orgId, instagramAccountId } = await params;
    const { getToken, orgId: authOrgId } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (authOrgId && authOrgId !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('page_size') || '12';

    const response = await fetch(
      `${API_BASE_URL}/appservice/paginated/conversations/instagram/chat_sessions/org/${orgId}/${instagramAccountId}/?page=${page}&page_size=${pageSize}`,
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
    return NextResponse.json({
      ...data,
      meta: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to fetch Instagram chat sessions:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch Instagram chat sessions' }, { status: 500 });
  }
}
