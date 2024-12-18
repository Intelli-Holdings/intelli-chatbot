import { NextResponse, NextFetchEvent } from 'next/server';
import { createAssistant, getAssistants } from '@/lib/assistants'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, prompt, organization_id } = body;

    if (!name || !prompt || !organization_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const assistant = await createAssistant({ name, prompt, organization_id });

    return NextResponse.json(assistant);
  } catch (error) {
    console.error('Error creating assistant:', error);
    return NextResponse.json({ error: 'Failed to create assistant' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organization_id' }, { status: 400 });
    }

    const assistants = await getAssistants(organizationId);
    return NextResponse.json(assistants);
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return NextResponse.json({ error: 'Failed to fetch assistants' }, { status: 500 });
  }
}

export { getAssistants, createAssistant };

