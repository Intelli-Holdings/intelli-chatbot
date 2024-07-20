// app/api/whatsapp/route.ts
import { NextResponse } from 'next/server';
import { currentUser, auth } from "@clerk/nextjs/server";
import { getUserOrganizationMemberships } from '../../services/clerkService';

export async function GET() {
  const { userId, getToken } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const memberships = await getUserOrganizationMemberships(userId);
    if (!memberships.data.length) {
      return NextResponse.json({ error: 'No organization memberships found' }, { status: 404 });
    }

    const orgId = memberships.data[0].organization_id; // Assuming the user belongs to one organization
    const token = await getToken();

    const response = await fetch(`https://intelli-python-backend-lxui.onrender.com/dashboard/conversations/whatsapp/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Org-ID': orgId,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
