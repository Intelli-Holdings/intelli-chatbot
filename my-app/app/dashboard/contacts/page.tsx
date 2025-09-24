"use client"

import { ContactsHeader } from "@/components/contacts-header"
import { ContactsTable } from "@/components/contacts-table"
import { useCallback, useEffect, useState } from "react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { toast } from "@/hooks/use-toast"

interface AppService {
  id: number
  phone_number: string
  phone_number_id: string
  whatsapp_business_account_id: string
  access_token: string
  created_at: string
}

interface ChatSession {
  customer_name: string
  customer_number: string
  id?: string
  created_at?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const organizationId = useActiveOrganizationId()

  const fetchAppServices = useCallback(async (orgId: string): Promise<AppService[]> => {
    try {
      console.log(`[v0] Fetching app services for organization: ${orgId}`)
      const response = await fetch(`/api/contacts/appservices/${orgId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[v0] App services response:`, data)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("[v0] Failed to fetch app services:", error)
      toast({
        title: "Error",
        description: "Failed to fetch app services",
        variant: "destructive",
      })
      return []
    }
  }, [])

  const fetchChatSessions = useCallback(async (orgId: string, phoneNumber: string): Promise<ChatSession[]> => {
    try {
      console.log(`[v0] Fetching chat sessions for org: ${orgId}, phone: ${phoneNumber}`)
      const response = await fetch(`/api/contacts/chatsessions/${orgId}/${phoneNumber}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[v0] Chat sessions response:`, data)

      if (Array.isArray(data)) {
        return data.map((session: any) => ({
          customer_name: session.customer_name || "",
          customer_number: session.customer_number || "",
          id: session.id,
          created_at: session.created_at,
        }))
      }

      // Fallback for wrapped response format
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((session: any) => ({
          customer_name: session.customer_name || "",
          customer_number: session.customer_number || "",
          id: session.id,
          created_at: session.created_at,
        }))
      }

      return []
    } catch (error) {
      console.error("[v0] Failed to fetch chat sessions:", error)
      return []
    }
  }, [])

  const fetchAllContacts = useCallback(
    async (orgId: string) => {
      try {
        setIsLoading(true)
        console.log(`[v0] Starting contacts fetch for organization: ${orgId}`)

        // Step 1: Fetch app services to get phone numbers
        const appServices = await fetchAppServices(orgId)

        if (appServices.length === 0) {
          console.log("[v0] No app services found")
          setContacts([])
          return
        }

        // Step 2: Fetch chat sessions for each phone number
        const allContacts: ChatSession[] = []

        for (const appService of appServices) {
          if (appService.phone_number) {
            const chatSessions = await fetchChatSessions(orgId, appService.phone_number)
            allContacts.push(...chatSessions)
          }
        }

        // Remove duplicates based on customer_number
        const uniqueContacts = allContacts.filter(
          (contact, index, self) => index === self.findIndex((c) => c.customer_number === contact.customer_number),
        )

        console.log(`[v0] Found ${uniqueContacts.length} unique contacts`)
        setContacts(uniqueContacts)
      } catch (error) {
        console.error("[v0] Error fetching contacts:", error)
        toast({
          title: "Error",
          description: "Failed to fetch contacts",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [fetchAppServices, fetchChatSessions],
  )

  useEffect(() => {
    if (organizationId) {
      fetchAllContacts(organizationId)
    }
  }, [organizationId, fetchAllContacts])

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.customer_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Contacts</h1>
      <div className="flex w-full flex-col space-y-4">
        <ContactsHeader onSearchChange={setSearchTerm} />
        <ContactsTable contacts={filteredContacts} isLoading={isLoading} searchTerm={searchTerm} />
      </div>
    </div>
  )
}
