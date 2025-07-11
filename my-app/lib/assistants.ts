import { Assistant, CreateAssistantData } from '@/types/assistant';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function createAssistant(data: CreateAssistantData): Promise<Assistant> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assistants/`, {
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
    console.error('Error creating assistant:', error);
    throw new Error('Failed to create assistant');
  }
}

export async function getAssistants(organizationId: string): Promise<Assistant[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assistants/?organization_id=${organizationId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch assistants');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching assistants:', error);
    throw new Error('Failed to fetch assistants');
  }
}

