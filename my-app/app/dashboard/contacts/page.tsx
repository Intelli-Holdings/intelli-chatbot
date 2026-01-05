"use client"

import { ContactsHeader } from "@/components/contacts-header"
import { ContactsTable } from "@/components/contacts-table"
import { ContactsFilter } from "@/components/contacts-filter"
import { useEffect, useState } from "react"
import { useQueryClient } from "react-query"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useContactTags } from "@/hooks/use-contact-tags"
import { usePaginatedContacts } from "@/hooks/use-contacts"
import { toast } from "sonner"

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
  custom_fields?: {
    field_id: string
    key: string
    name?: string
    value: any
  }[]
}

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12
  const organizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  const {
    contacts,
    totalCount,
    totalPages,
    isLoading,
    error: contactsError,
  } = usePaginatedContacts<Contact>(organizationId || undefined, currentPage, pageSize)

  const {
    tags,
    error: tagsError,
  } = useContactTags(organizationId || undefined)

  useEffect(() => {
    if (contactsError) {
      toast.error("Failed to fetch contacts")
    }
  }, [contactsError])

  useEffect(() => {
    if (tagsError) {
      toast.error("Failed to fetch tags")
    }
  }, [tagsError])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const refreshTags = () => {
    if (!organizationId) return
    queryClient.invalidateQueries(["contact-tags", organizationId])
  }

  const refreshContacts = (page: number = currentPage) => {
    if (!organizationId) return
    setCurrentPage(page)
    queryClient.invalidateQueries(["contacts", organizationId])
  }

  const filteredContacts = contacts.filter((contact) => {
    // Filter by search term
    const matchesSearch =
      !searchTerm ||
      contact.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by selected tags
    const matchesTags =
      selectedTagSlugs.length === 0 ||
      contact.tags?.some((tag) => selectedTagSlugs.includes(tag.slug))

    return matchesSearch && matchesTags
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>
      <div className="flex w-full flex-col space-y-4">
        <ContactsHeader
          onSearchChange={setSearchTerm}
          tags={tags}
          onTagsChange={refreshTags}
          onContactsChange={() => refreshContacts(1)}
        />
        <ContactsFilter
          tags={tags}
          selectedTags={selectedTagSlugs}
          onTagsChange={setSelectedTagSlugs}
        />
        <ContactsTable
          contacts={filteredContacts}
          isLoading={isLoading}
          searchTerm={searchTerm}
          tags={tags}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onContactsChange={() => refreshContacts(currentPage)}
        />
      </div>
    </div>
  )
}
