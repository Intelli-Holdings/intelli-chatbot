"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { BulkActionsDialog } from "./bulk-actions-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
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

interface ContactsTableProps {
  contacts: Contact[]
  isLoading: boolean
  searchTerm: string
  tags: Tag[]
  onContactsChange: () => void
}

export function ContactsTable({ contacts, isLoading, searchTerm, tags, onContactsChange }: ContactsTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBulkDialog, setShowBulkDialog] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contacts.map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectContact = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    }
  }

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return

    try {
      const response = await fetch(`/api/contacts/contacts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete contact")

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      })

      onContactsChange()
    } catch (error) {
      console.error("Failed to delete contact:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-blue-300 shadow-sm overflow-x-auto">
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-blue-300 shadow-sm overflow-x-auto bg-white">
        {selectedIds.length > 0 && (
          <div className="p-4 border-b bg-blue-50 flex items-center justify-between">
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <Button
              onClick={() => setShowBulkDialog(true)}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Bulk Actions
            </Button>
          </div>
        )}

        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-blue-50 border-b">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === contacts.length && contacts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(contact.id)}
                      onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${contact.fullname}.png`} />
                        <AvatarFallback>{contact.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contact.fullname}</div>
                        <div className="text-xs text-muted-foreground">{contact.phone}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.email || "-"}</TableCell>
                  <TableCell>+{contact.phone || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200">
                      {contact.information_source || "API"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(contact.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-destructive cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BulkActionsDialog
        open={showBulkDialog}
        onOpenChange={setShowBulkDialog}
        selectedIds={selectedIds}
        tags={tags}
        onSuccess={() => {
          setSelectedIds([])
          onContactsChange()
        }}
      />
    </>
  )
}
