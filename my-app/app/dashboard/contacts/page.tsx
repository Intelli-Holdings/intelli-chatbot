"use client"

import { ContactsHeader } from "@/components/contacts-header"
import { ContactsTable } from "@/components/contacts-table"
import { useCallback, useEffect, useState } from "react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { toast } from "@/hooks/use-toast"

interface Tag {
  id: number
  name: string
  slug: string
}

interface Contact {
  id: number
  fullname: string
  email: string
  phone: string
  tags: Tag[]
  created_at: string
  information_source?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const organizationId = useActiveOrganizationId()

  const fetchContacts = useCallback(async (orgId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/contacts/contacts?organization=${orgId}`)
      if (!response.ok) throw new Error("Failed to fetch contacts")
      const data = await response.json()
      setContacts(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTags = useCallback(async (orgId: string) => {
    try {
      const response = await fetch(`/api/contacts/tags?organization=${orgId}`)
      if (!response.ok) throw new Error("Failed to fetch tags")
      const data = await response.json()
      setTags(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      console.error("Failed to fetch tags:", error)
    }
  }, [])

  useEffect(() => {
    if (organizationId) {
      fetchContacts(organizationId)
      fetchTags(organizationId)
    }
  }, [organizationId, fetchContacts, fetchTags])

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>
      <div className="flex w-full flex-col space-y-4">
        <ContactsHeader
          onSearchChange={setSearchTerm}
          tags={tags}
          onTagsChange={() => fetchTags(organizationId || "")}
          onContactsChange={() => fetchContacts(organizationId || "")}
        />
        <ContactsTable
          contacts={filteredContacts}
          isLoading={isLoading}
          searchTerm={searchTerm}
          tags={tags}
          onContactsChange={() => fetchContacts(organizationId || "")}
        />
      </div>
    </div>
  )
}
