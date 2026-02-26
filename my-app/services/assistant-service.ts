import { logger } from "@/lib/logger";

export async function fetchAssistantsByOrganization(organizationId: string) {
    try {
      const response = await fetch(`/api/assistants/${organizationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch assistants')
      }
      return await response.json()
    } catch (error) {
      logger.error('Error fetching assistants', { error: error instanceof Error ? error.message : String(error) })
      return []
    }
  }
  
  