"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { TagInput } from "@/components/contacts-tag-input"
import { Upload, FileSpreadsheet, Download } from 'lucide-react'
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { toast } from "sonner"

interface Tag {
  id: number
  name: string
  slug: string
}

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: () => void
  embedded?: boolean
  availableTags?: Tag[]
}

interface ImportProgress {
  status: "idle" | "uploading" | "processing"
  progress: number
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function FileUploadDialog({ open, onOpenChange, onImportSuccess, embedded, availableTags = [] }: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    status: "idle",
    progress: 0,
  })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const organizationId = useActiveOrganizationId()

  const isLoading = importProgress.status === "uploading" || importProgress.status === "processing"

  const handleCreateTag = async (tagName: string): Promise<Tag> => {
    const response = await fetch("/api/contacts/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tagName,
        organization: organizationId,
      }),
    })

    if (!response.ok) throw new Error("Failed to create tag")
    return await response.json()
  }

  const downloadTemplate = () => {
    const headers = ["fullname", "phone", "email", "information_source"]
    const exampleData = [
      ["John Doe", "+1234567890", "john@example.com", "Website"],
      ["Jane Smith", "+0987654321", "jane@example.com", "Referral"],
    ]

    const csvContent = [headers, ...exampleData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "contacts_import_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("Template downloaded successfully")
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    const validExtensions = [".csv", ".xlsx", ".xls"]

    const hasValidType = validTypes.includes(file.type)
    const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!hasValidType && !hasValidExtension) {
      return { valid: false, error: "Please upload a CSV or XLSX file" }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` }
    }

    return { valid: true }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validation = validateFile(selectedFile)
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file")
      return
    }

    setFile(selectedFile)
    setImportProgress({ status: "idle", progress: 0 })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    const validation = validateFile(droppedFile)
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file")
      return
    }

    setFile(droppedFile)
    setImportProgress({ status: "idle", progress: 0 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !organizationId) return

    try {
      setImportProgress({ status: "uploading", progress: 20 })

      const formData = new FormData()
      formData.append("file", file)
      formData.append("organization", organizationId)

      // Add tag slugs as comma-separated string
      if (selectedTags.length > 0) {
        formData.append("tag_slugs", selectedTags.map((tag) => tag.slug).join(","))
      }

      setImportProgress((prev) => ({ ...prev, status: "processing", progress: 50 }))

      const response = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Import failed")
      }

      // Build success message with details
      const successMessage = [
        `Bulk contacts imported successfully`,
        data.failed > 0 ? `failed` : null,
        data.skipped > 0 ? ` skipped (duplicates)` : null
      ].filter(Boolean).join(', ')

      toast.success(successMessage)

      onImportSuccess()
      resetForm()
      if (!embedded) onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Import failed"
      toast.error(errorMessage)
      resetForm()
    }
  }

  const resetForm = () => {
    setFile(null)
    setSelectedTags([])
    setImportProgress({ status: "idle", progress: 0 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drag and Drop Upload Area */}
      {importProgress.status === "idle" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
            ${file ? "bg-muted/50" : ""}
          `}
        >
          <Input
            ref={fileInputRef}
            id="file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <FileSpreadsheet className="w-12 h-12 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  resetForm()
                }}
              >
                Choose Different File
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <Upload className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-lg">Drop your file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  CSV or XLSX files only, max {MAX_FILE_SIZE / 1024 / 1024}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {(importProgress.status === "uploading" || importProgress.status === "processing") && (
        <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <Spinner className="w-5 h-5" />
            <div className="flex-1">
              <p className="font-medium">
                {importProgress.status === "uploading" ? "Uploading file..." : "Processing contacts..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we import your contacts
              </p>
            </div>
          </div>
          <Progress value={importProgress.progress} className="h-2" />
        </div>
      )}

      {importProgress.status === "idle" && file && (
        <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <TagInput
              selectedTags={selectedTags}
              availableTags={availableTags}
              onTagsChange={setSelectedTags}
              onCreateTag={handleCreateTag}
              placeholder="Type to search or create tags..."
            />
            <p className="text-xs text-muted-foreground">
              Tags will be automatically assigned to all imported contacts
            </p>
          </div>
      )}

      {/* Format Guide */}
      {importProgress.status === "idle" && (
        <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-3">
          <p className="font-medium flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Expected Format
          </p>
          <div className="space-y-2">
            <div>
              <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">Required Fields</p>
              <ul className="space-y-1 text-muted-foreground ml-1">
                <li>• <strong className="text-foreground">fullname</strong> - Contact&apos;s full name</li>
                <li>• <strong className="text-foreground">phone</strong> - Phone number with country code</li>
                <li>• <strong className="text-foreground">email</strong> - Email address</li>
                <li>• <strong className="text-foreground">information_source</strong> - Where the contact came from</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-xs text-muted-foreground bold tracking-wide mb-1">Use template document below to do bulk import.</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {importProgress.status === "idle" && (
        <div className="flex justify-between gap-2 pt-2">
          {/* Download Template Button */}
      <div className="">
        <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>
          
          <Button type="submit" disabled={!file || isLoading} className="gap-2">
            {isLoading && <Spinner className="w-4 h-4" />}
            <Upload className="w-4 h-4" />
            Import Contacts
          </Button>
        </div>
      )}
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
            Upload a CSV or XLSX file to import contacts and assign tags in one go
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}