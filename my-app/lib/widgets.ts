import { Widget, CreateWidgetData } from '@/types/widget';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function createWidget(data: CreateWidgetData): Promise<Widget> {
  try {
    const response = await fetch(`${API_BASE_URL}/widgets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create widget');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating widget:', error);
    throw new Error('Failed to create widget');
  }
}

export async function getWidgets(organizationId: string): Promise<Widget[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/widgets/?organization=${organizationId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch widgets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching widgets:', error);
    throw new Error('Failed to fetch widgets');
  }
}
