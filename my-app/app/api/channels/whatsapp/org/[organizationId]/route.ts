import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  const { userId, getToken } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { organizationId } = params;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token = await getToken();

    // Fetch appservices from the backend API
    const response = await fetch(`${API_BASE_URL}/appservice/org/${organizationId}/appservices/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    logger.error("Error fetching WhatsApp app services", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to fetch app services' },
      { status: 500 }
    );
  }
}
