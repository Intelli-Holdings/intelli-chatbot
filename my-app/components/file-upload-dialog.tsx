"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { toast } from "@/hooks/use-toast"

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: () => void
  embedded?: boolean
}

export function FileUploadDialog({ open, onOpenChange, onImportSuccess, embedded }: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const organizationId = useActiveOrganizationId()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or XLSX file",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !organizationId) return

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("organization", organizationId)

      const response = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Import failed")
      }

      toast({
        title: "Success",
        description: "Contacts imported successfully",
      })

      setFile(null)
      if (!embedded) onOpenChange(false)
      onImportSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Import failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select File</Label>
        <Input id="file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} disabled={isLoading} />
      </div>

      <div className="bg-muted/50 p-3 rounded-md text-sm">
        <p className="font-medium mb-2">Expected Format:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Column A: fullname (required)</li>
          <li>• Column B: phone (required)</li>
          <li>• Column C: email (optional)</li>
          <li>• Column D: information_source (optional)</li>
        </ul>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!file || isLoading} className="gap-2">
          {isLoading && <Spinner className="w-4 h-4" />}
          Import
        </Button>
      </div>
    </form>
  )

  if (embedded) {
    return content
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV or XLSX file to import contacts. Make sure your file has columns for: fullname, phone, email
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}