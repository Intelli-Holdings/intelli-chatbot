"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Import, Search, Settings } from "lucide-react"
import { FileUploadDialog } from "./file-upload-dialog"
import { TagManagementDialog } from "./tag-management-dialog"
import { AddContactDialog } from "./add-contact-dialog"
import CustomFieldsManager from "./custom-fields-manager"

interface ContactsHeaderProps {
  onSearchChange: (search: string) => void
  tags: any[]
  onTagsChange: () => void
  onContactsChange: () => void
}

export function ContactsHeader({ onSearchChange, tags, onTagsChange, onContactsChange }: ContactsHeaderProps) {
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [showFileImportDialog, setShowFileImportDialog] = useState(false)
  const [showCustomFieldsDialog, setShowCustomFieldsDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearchChange(value)
  }

  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Type to search your contacts..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AddContactDialog tags={tags} onSuccess={onContactsChange} onTagsChange={onTagsChange} />
        <Dialog open={showCustomFieldsDialog} onOpenChange={setShowCustomFieldsDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Custom Fields
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Custom Fields</DialogTitle>
              <DialogDescription>Create, edit and delete custom fields for your contacts.</DialogDescription>
            </DialogHeader>
            <CustomFieldsManager />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#007fff] text-white hover:bg-[#007fff]/90" size="sm">
              <Import className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Import Contacts</DialogTitle>
              <DialogDescription>Import contacts from a file or manage your tags.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="file" className="w-full">
              <TabsContent value="file" className="mt-4">
                <FileUploadDialog
                  open={true}
                  onOpenChange={() => {}}
                  onImportSuccess={onContactsChange}
                  embedded={true}
                  availableTags={tags}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
