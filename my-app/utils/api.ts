import { Assistant } from '@/types/assistant';

export async function fetchAssistants(organizationId: string): Promise<Assistant[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${organizationId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch assistants');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assistants:', error);
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
    console.error('Error creating assistant:', error);
    return null;
  }
}

