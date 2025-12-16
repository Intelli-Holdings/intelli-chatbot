"use client"

import { ContactsHeader } from "@/components/contacts-header"
import { ContactsTable } from "@/components/contacts-table"
import { ContactsFilter } from "@/components/contacts-filter"
import { useCallback, useEffect, useState } from "react"
import useActiveOrganizationId from "@/hooks/use-organization-id"
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
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState(12)
  const organizationId = useActiveOrganizationId()

  const fetchContacts = useCallback(async (orgId: string, page: number = 1, size?: number) => {
    try {
      setIsLoading(true)
      const effectivePageSize = size || pageSize
      const response = await fetch(`/api/contacts/contacts?organization=${orgId}&page=${page}&page_size=${effectivePageSize}`)
      if (!response.ok) throw new Error("Failed to fetch contacts")
      const data = await response.json()

      // Handle paginated response
      if (data.results) {
        setContacts(data.results)
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / effectivePageSize))
      } else {
        setContacts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast.error("Failed to fetch contacts")
    } finally {
      setIsLoading(false)
    }
  }, [pageSize])

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
      fetchContacts(organizationId, currentPage)
      fetchTags(organizationId)
    }
  }, [organizationId, currentPage, fetchContacts, fetchTags])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
    if (organizationId) {
      fetchContacts(organizationId, 1, newPageSize)
    }
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
          onTagsChange={() => fetchTags(organizationId || "")}
          onContactsChange={() => {
            setCurrentPage(1)
            fetchContacts(organizationId || "", 1)
          }}
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
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onContactsChange={() => fetchContacts(organizationId || "", currentPage)}
        />
      </div>
    </div>
  )
}
