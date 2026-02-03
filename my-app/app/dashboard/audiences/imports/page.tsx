"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle2, AlertCircle, X, Download } from "lucide-react"
import { toast } from "sonner"

type ImportHistory = {
  id: string
  name: string
  fileName: string
  contactCount: number
  validCount: number
  invalidCount: number
  status: "completed" | "failed" | "processing"
  createdAt: string
}

type ColumnMapping = {
  csvColumn: string
  mappedTo: string
}

export default function ImportsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [step, setStep] = useState<"upload" | "mapping" | "confirm">("upload")
  const [listName, setListName] = useState("")
  const [csvData, setCsvData] = useState<string[][]>([])
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [validationResults, setValidationResults] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
  })

  // Mock import history
  const [importHistory] = useState<ImportHistory[]>([
    {
      id: "1",
      name: "Black Friday 2025",
      fileName: "bf_customers.csv",
      contactCount: 2145,
      validCount: 2098,
      invalidCount: 47,
      status: "completed",
      createdAt: "2024-03-15",
    },
    {
      id: "2",
      name: "Webinar Q4 Attendees",
      fileName: "webinar_contacts.csv",
      contactCount: 567,
      validCount: 567,
      invalidCount: 0,
      status: "completed",
      createdAt: "2024-03-10",
    },
    {
      id: "3",
      name: "Newsletter Subscribers",
      fileName: "subscribers.csv",
      contactCount: 1203,
      validCount: 1187,
      invalidCount: 16,
      status: "completed",
      createdAt: "2024-03-05",
    },
  ])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file")
        return
      }

      setFile(selectedFile)
      setListName(selectedFile.name.replace(".csv", ""))

      // Parse CSV (simplified)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const rows = text.split("\n").map((row) => row.split(","))
        setCsvData(rows)

        // Auto-detect column mappings
        const headers = rows[0]
        const mappings: ColumnMapping[] = headers.map((header) => {
          const normalized = header.toLowerCase().trim()
          let mappedTo = "skip"

          if (normalized.includes("name") || normalized === "nom") {
            mappedTo = "name"
          } else if (normalized.includes("phone") || normalized.includes("tel")) {
            mappedTo = "phone"
          } else if (normalized.includes("email") || normalized.includes("mail")) {
            mappedTo = "email"
          } else if (normalized.includes("company") || normalized.includes("entreprise")) {
            mappedTo = "company"
          }

          return { csvColumn: header, mappedTo }
        })

        setColumnMappings(mappings)
        setStep("mapping")
      }
      reader.readAsText(selectedFile)
    }
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      const fakeEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(fakeEvent)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const handleMappingChange = (csvColumn: string, mappedTo: string) => {
    setColumnMappings(
      columnMappings.map((m) =>
        m.csvColumn === csvColumn ? { ...m, mappedTo } : m
      )
    )
  }

  const handleValidate = () => {
    // Simulate validation
    const total = csvData.length - 1 // Exclude header
    const valid = Math.floor(total * 0.97)
    const invalid = total - valid

    setValidationResults({ total, valid, invalid })
    setStep("confirm")
  }

  const handleImport = async () => {
    if (!listName) {
      toast.error("Please enter a list name")
      return
    }

    setImporting(true)
    try {
      // Simulate import
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(`Successfully imported ${validationResults.valid} contacts`)

      // Reset
      setFile(null)
      setStep("upload")
      setListName("")
      setCsvData([])
      setColumnMappings([])
    } catch (error) {
      toast.error("Failed to import contacts")
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setStep("upload")
    setListName("")
    setCsvData([])
    setColumnMappings([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Lists</h1>
          <p className="text-muted-foreground">
            Import contacts from CSV files with smart auto-mapping
          </p>
        </div>
      </div>

      {/* Upload Section */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Import Contacts from CSV</CardTitle>
            <CardDescription>
              Upload a CSV file to import contacts into your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Drop your CSV file here
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                or click to browse
              </p>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>First row must contain column headers</li>
                <li>Phone numbers should include country code (e.g., +1234567890)</li>
                <li>Supported columns: name, phone, email, company, tags</li>
                <li>Maximum file size: 10 MB</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column Mapping */}
      {step === "mapping" && file && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Map CSV Columns</CardTitle>
                <CardDescription>
                  Verify or adjust the column mappings
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>{file.name}</strong> ({csvData.length - 1} rows detected)
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>List Name</Label>
              <Input
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="e.g., Black Friday 2025"
              />
            </div>

            <div className="space-y-3">
              <Label>Column Mappings</Label>
              <div className="space-y-2">
                {columnMappings.map((mapping, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Badge variant="outline">{mapping.csvColumn}</Badge>
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="flex-1">
                      <Select
                        value={mapping.mappedTo}
                        onValueChange={(value) =>
                          handleMappingChange(mapping.csvColumn, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="tags">Tags</SelectItem>
                          <SelectItem value="skip">Skip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 text-right">
                      {mapping.mappedTo !== "skip" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 inline" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handleValidate}>
                Continue to Validation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Import */}
      {step === "confirm" && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Import</CardTitle>
            <CardDescription>Review and confirm your import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{validationResults.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valid Contacts</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {validationResults.valid}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Invalid Rows</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {validationResults.invalid}
                  </div>
                  <p className="text-xs text-muted-foreground">Will be skipped</p>
                </CardContent>
              </Card>
            </div>

            {validationResults.invalid > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResults.invalid} rows have invalid phone numbers and will be skipped during import
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Import as List</Label>
              <Input value={listName} readOnly />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back to Mapping
              </Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? "Importing..." : `Import ${validationResults.valid} Contacts`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Your recent CSV imports</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List Name</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Valid</TableHead>
                <TableHead>Invalid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {item.fileName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{item.contactCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="text-green-600">{item.validCount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-orange-600">{item.invalidCount}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "completed"
                          ? "default"
                          : item.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
