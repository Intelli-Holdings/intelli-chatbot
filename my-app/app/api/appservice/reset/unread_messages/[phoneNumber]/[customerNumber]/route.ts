import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: { phoneNumber: string; customerNumber: string } }
) {
  try {
    const { phoneNumber, customerNumber } = params;
    
    const response = await fetch(
      `${API_BASE_URL}/appservice/reset/unread_messages/${phoneNumber}/${customerNumber}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to reset unread messages:', error);
    return NextResponse.json(
      { error: 'Failed to reset unread messages' },
      { status: 500 }
    );
  }
}
