import { Assistant } from '@/types/assistant';

import { logger } from "@/lib/logger";
export async function fetchAssistants(organizationId: string): Promise<Assistant[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch assistants');
    }
    return await response.json();
  } catch (error) {
    logger.error('Error fetching assistants:', { error: error instanceof Error ? error.message : String(error) });
    return [];
  }
}

export async function createAssistant(data: { name: string; prompt: string; organization_id: string }): Promise<Assistant | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create assistant');
    }
    return await response.json();
  } catch (error) {
    logger.error('Error creating assistant:', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

