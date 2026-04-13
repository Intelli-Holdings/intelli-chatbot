import { Widget, CreateWidgetData } from '@/types/widget';
import { logger } from "@/lib/logger";

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
    logger.error('Error creating widget', { error: error instanceof Error ? error.message : String(error) });
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
    logger.error('Error fetching widgets', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to fetch widgets');
  }
}
