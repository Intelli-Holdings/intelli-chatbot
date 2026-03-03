import { Assistant, CreateAssistantData } from '@/types/assistant';
import { logger } from "@/lib/logger";

export async function createAssistant(data: CreateAssistantData): Promise<Assistant> {
  try {
    const response = await fetch(`/api/assistants/${data.organizationId}`, {
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
    logger.error('Error creating assistant', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to create assistant');
  }
}

export async function getAssistants(organizationId: string): Promise<Assistant[]> {
  try {
    const response = await fetch(`/api/assistants/org/${organizationId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch assistants');
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching assistants', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Failed to fetch assistants');
  }
}

