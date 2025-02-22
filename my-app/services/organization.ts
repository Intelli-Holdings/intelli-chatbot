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
    console.error("Failed to create organization:", error);
    throw error;
  }
};
