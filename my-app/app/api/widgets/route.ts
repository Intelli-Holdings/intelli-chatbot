import { NextResponse } from 'next/server';
import { createWidget } from '@/lib/widgets';
import { CreateWidgetData, convertToBackendFormat, convertToFrontendFormat } from '@/types/widget';

export async function POST(request: Request) {
  try {
    const body: CreateWidgetData = await request.json();
    
    // Basic validation
    const requiredFields = ['organizationId', 'assistantId', 'websiteUrl', 'widgetName'];
    for (const field of requiredFields) {
      if (!body[field as keyof CreateWidgetData]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Convert to backend format before sending to the API
    const backendData = convertToBackendFormat(body);
    
    // Make the API call with converted data
    const response = await createWidget(backendData);
    
    // Convert the response back to frontend format
    const frontendResponse = convertToFrontendFormat(response);

    return NextResponse.json(frontendResponse);
  } catch (error) {
    console.error('Error creating widget:', error);
    return NextResponse.json({ error: 'Failed to create widget' }, { status: 500 });
  }
}