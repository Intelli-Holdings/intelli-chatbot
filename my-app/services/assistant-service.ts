export async function fetchAssistantsByOrganization(organizationId: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${organizationId}/`)
      if (!response.ok) {
        throw new Error('Failed to fetch assistants')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching assistants:', error)
      return []
    }
  }
  
  