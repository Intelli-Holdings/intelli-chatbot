"use client"

import { useState } from "react"
import { Edit, Eye, MoreHorizontal, Send, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock data for templates
const mockTemplates: Template[] = [
  {
    id: "1",
    name: "order_confirmation",
    category: "UTILITY",
    status: "APPROVED",
    language: "en_US",
    createdAt: "2025-04-15T10:30:00Z",
  },
  {
    id: "2",
    name: "appointment_reminder",
    category: "UTILITY",
    status: "APPROVED",
    language: "en_US",
    createdAt: "2025-04-10T14:20:00Z",
  },
  {
    id: "3",
    name: "special_offer",
    category: "MARKETING",
    status: "PENDING",
    language: "en_US",
    createdAt: "2025-05-01T09:15:00Z",
  },
  {
    id: "4",
    name: "account_verification",
    category: "AUTHENTICATION",
    status: "APPROVED",
    language: "en_US",
    createdAt: "2025-03-22T11:45:00Z",
  },
  {
    id: "5",
    name: "product_launch",
    category: "MARKETING",
    status: "REJECTED",
    language: "en_US",
    createdAt: "2025-04-28T16:10:00Z",
    rejectedReason: "TAG_CONTENT_MISMATCH",
  },
]

type TemplateStatus = "APPROVED" | "PENDING" | "REJECTED"
type TemplateCategory = "UTILITY" | "MARKETING" | "AUTHENTICATION"

interface Template {
  id: string
  name: string
  category: TemplateCategory
  status: TemplateStatus
  language: string
  createdAt: string
  rejectedReason?: string
}

interface TemplateListProps {
  filter: "all" | "approved" | "pending" | "rejected"
}

export default function TemplateList({ filter }: TemplateListProps) {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)

  // Filter templates based on the selected tab
  const filteredTemplates =
    filter === "all" ? templates : templates.filter((template) => template.status.toLowerCase() === filter)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: TemplateStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: TemplateCategory) => {
    switch (category) {
      case "UTILITY":
        return <Badge variant="secondary">Utility</Badge>
      case "MARKETING":
        return <Badge variant="secondary">Marketing</Badge>
      case "AUTHENTICATION":
        return <Badge variant="secondary">Authentication</Badge>
      default:
        return <Badge variant="secondary">{category}</Badge>
    }
  }

  const handleDelete = (id: string) => {
    // In a real app, this would call an API to delete the template
    setTemplates(templates.filter((template) => template.id !== id))
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTemplates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No templates found.
              </TableCell>
            </TableRow>
          ) : (
            filteredTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell>{getCategoryBadge(template.category)}</TableCell>
                <TableCell>{getStatusBadge(template.status)}</TableCell>
                <TableCell>{template.language}</TableCell>
                <TableCell>{formatDate(template.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="mr-2 h-4 w-4" />
                        <span>Send Test</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={template.status === "PENDING"}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(template.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
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
  )
}
