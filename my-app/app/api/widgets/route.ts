import { NextResponse } from 'next/server';
import { createWidget } from '@/lib/widgets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      organizationId, 
      assistantId, 
      websiteUrl, 
      widgetName, 
      avatarUrl, 
      brandColor, 
      customInstructions, 
      greetingMessage 
    } = body;

    if (!organizationId || !assistantId || !websiteUrl || !widgetName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const widget = await createWidget({
      organizationId,
      assistantId,
      websiteUrl,
      widgetName,
      avatarUrl,
      brandColor,
      customInstructions,
      greetingMessage
    });

    return NextResponse.json(widget);
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 });
  }
}

