'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { importContacts } from '@/app/actions'
import { UploadIcon as FileUpload } from 'lucide-react'
import { toast } from 'sonner'

export function ImportContacts() {
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await importContacts(formData)
      if (result.success) {
       toast.success('Contacts imported successfully')
      }
    } catch (error) {
      console.error('Failed to import contacts:', error)
      toast.error('Failed to import contacts')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="file">Upload File</Label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 gap-2">
          <FileUpload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop your file here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Supports CSV, Excel, and PDF files
          </p>
          <input
            id="file"
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button variant="outline" disabled={isUploading} onClick={() => document.getElementById('file')?.click()}>
            {isUploading ? 'Uploading...' : 'Select File'}
          </Button>
        </div>
      </div>
    </div>
  )
}

