"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import {
  Plus, Loader2, Paperclip, X, FileText, Image as ImageIcon,
  Music, Video, AlertCircle, Clock, CheckCircle2, CircleDot,
  ChevronRight
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Ticket {
  id: string
  subject: string
  description?: string
  category: string
  priority: string
  status: string
  submitted_by_name: string
  submitted_by_email: string
  attachment_count: number
  reply_count: number
  created_at: string
  updated_at: string
  resolved_at: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open: { label: "Open", color: "bg-blue-100 text-blue-800", icon: CircleDot },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-800", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-800", icon: CheckCircle2 },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug Report",
  feature: "Feature Request",
  billing: "Billing Issue",
  integration: "Integration Problem",
  general: "General Support",
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
  if (fileType.startsWith("video/")) return <Video className="h-4 w-4" />
  if (fileType.startsWith("audio/")) return <Music className="h-4 w-4" />
  return <FileText className="h-4 w-4" />
}

export default function TicketsPage() {
  const { user } = useUser()
  const organizationId = useActiveOrganizationId()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Create form state
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("general")
  const [priority, setPriority] = useState("medium")
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const fetchTickets = useCallback(async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ organization: organizationId })
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/support/tickets?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch tickets")

      const data = await response.json()
      setTickets(data.results || [])
    } catch (error) {
      logger.error("Failed to fetch tickets", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to load tickets")
    } finally {
      setLoading(false)
    }
  }, [organizationId, statusFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleCreateTicket = async () => {
    if (!organizationId || !user) return
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required")
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("organization", organizationId)
      formData.append("subject", subject.trim())
      formData.append("description", description.trim())
      formData.append("category", category)
      formData.append("priority", priority)
      formData.append("submitted_by_clerk_id", user.id)
      formData.append("submitted_by_name", user.fullName || user.firstName || "")
      formData.append("submitted_by_email", user.primaryEmailAddress?.emailAddress || "")

      files.forEach((file) => {
        formData.append("attachments", file)
      })

      const response = await fetch("/api/support/tickets", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create ticket")
      }

      toast.success("Ticket submitted successfully")
      setShowCreateDialog(false)
      resetForm()
      fetchTickets()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create ticket")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubject("")
    setDescription("")
    setCategory("general")
    setPriority("medium")
    setFiles([])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const maxSize = 25 * 1024 * 1024 // 25MB
      for (const file of newFiles) {
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds 25MB limit`)
          return
        }
      }
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Support Tickets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Submit and track issues with your account or integrations.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {statusFilter !== "all" ? "No tickets match this filter." : "No tickets yet. Create one to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => {
            const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
            const priorityConf = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium
            const StatusIcon = statusConf.icon

            return (
              <Card key={ticket.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConf.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConf.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityConf.color}`}>
                          {priorityConf.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                        <span>by {ticket.submitted_by_name || ticket.submitted_by_email}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        {ticket.attachment_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            {ticket.attachment_count}
                          </span>
                        )}
                        {ticket.reply_count > 0 && (
                          <span>{ticket.reply_count} {ticket.reply_count === 1 ? 'reply' : 'replies'}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create ticket dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit a Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and attach any proof (screenshots, audio, video).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Subject</label>
              <Input
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="billing">Billing Issue</SelectItem>
                    <SelectItem value="integration">Integration Problem</SelectItem>
                    <SelectItem value="general">General Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea
                placeholder="Describe the issue in detail. What happened? What did you expect? Steps to reproduce..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* File attachments */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Attachments</label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload screenshots, audio recordings, or video proof (max 25MB each).
              </p>

              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-muted rounded-md px-2 py-1 text-xs">
                      {getFileIcon(file.type)}
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <span className="text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                      <button onClick={() => removeFile(index)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("ticket-file-input")?.click()}
              >
                <Paperclip className="mr-2 h-3.5 w-3.5" />
                Add Files
              </Button>
              <input
                id="ticket-file-input"
                type="file"
                multiple
                accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket} disabled={submitting || !subject.trim() || !description.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Ticket"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
