"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Contact } from "@/types/contact"
import { format } from "date-fns"
import { ContactSkeleton } from "@/components/contact-skeleton"

interface ChatSession {
  customer_name: string
  customer_number: string
  id?: string
  created_at?: string
}

interface ContactsTableProps {
  contacts: ChatSession[]
  isLoading: boolean
  searchTerm?: string
}

export function ContactsTable({ contacts: chatSessions = [], isLoading, searchTerm = "" }: ContactsTableProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])

  useEffect(() => {
    const whatsappContacts = chatSessions.map(
      (session): Contact => ({
        id: session.id?.toString() || session.customer_number,
        name: session.customer_name || "Unknown",
        email: "",
        phone: session.customer_number || "",
        title: "",
        company: "",
        dateAdded: session.created_at || new Date().toISOString(),
        source: "WhatsApp",
        hasMessaged: true,
        lastActive: session.created_at || new Date().toISOString(),
        avatar: `https://avatar.vercel.sh/${session.customer_name || session.customer_number}.png`,
      }),
    )

    setContacts(whatsappContacts)
  }, [chatSessions])

  useEffect(() => {
    const filtered = contacts.filter((contact) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        contact.phone.toLowerCase().includes(searchLower) ||
        contact.company.toLowerCase().includes(searchLower) ||
        contact.title.toLowerCase().includes(searchLower)
      )
    })
    setFilteredContacts(filtered)
  }, [contacts, searchTerm])

  return (
    <div className="overflow-x-auto rounded-xl border border-blue-300 shadow-sm">
      <Table className="min-w-full bg-white-100">
        <TableHeader>
          <TableRow className="bg-blue-50 border-b">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => <ContactSkeleton key={index} />)
            : filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Added {format(new Date(contact.dateAdded), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.email || "-"}</TableCell>
                  <TableCell>+{contact.phone || "-"}</TableCell>
                  <TableCell>{contact.title || "-"}</TableCell>
                  <TableCell>{contact.company || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={contact.source === "WhatsApp" ? "default" : "secondary"}>{contact.source}</Badge>
                      {contact.hasMessaged && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Messaged
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.lastActive ? format(new Date(contact.lastActive), "MMM d, h:mm a") : "-"}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
