// app/api/whatsapp/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  try {
    const response = await fetch(`https://intelli-python-backend-56zq.onrender.com/dashboard/conversations/whatsapp/${id}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}