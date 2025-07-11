// app/api/whatsapp/[id]/route.ts
import { NextResponse } from 'next/server';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/conversations/whatsapp/${id}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}