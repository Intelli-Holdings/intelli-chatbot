import { logger } from "@/lib/logger";

export const createNewOrganization = async (name: string, userId: string) => {
  try {
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create organization');
    }

    return await response.json();
  } catch (error) {
    logger.error("Failed to create organization", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
};
