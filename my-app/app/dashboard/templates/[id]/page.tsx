"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Edit, Send, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardHeader from "@/components/dashboard-header"
import TemplatePreview from "@/components/template-preview"

// Mock template data
const mockTemplate = {
  id: "1",
  name: "order_confirmation",
  category: "UTILITY",
  status: "APPROVED",
  language: "en_US",
  createdAt: "2025-04-15T10:30:00Z",
  components: {
    header: {
      type: "TEXT",
      text: "Order Confirmation",
      format: "TEXT",
      example: "",
    },
    body: {
      text: "Thank you for your order, {{1}}! Your order #{{2}} has been confirmed and will be shipped soon. Your estimated delivery date is {{3}}.",
      examples: [["", "", ""]],
    },
    footer: {
      text: "Reply to this message for support",
    },
    buttons: [],
  },
}

export default function TemplateDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [template, setTemplate] = useState(mockTemplate)
  const [isLoading, setIsLoading] = useState(true)

  // Extract variables from template body
  const extractVariables = (text: string) => {
    const matches = text.match(/\{\{[0-9]+\}\}/g) || []
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "")))).sort()
  }

  const variableCount = extractVariables(template.components.body.text).length
  const variables = Array(variableCount).fill("")

  useEffect(() => {
    // In a real app, this would fetch the template data from the API
    const fetchTemplate = async () => {
      try {
        setIsLoading(true)
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // In a real app, this would use the template ID from params
        setTemplate(mockTemplate)
      } catch (error) {
        console.error("Error fetching template:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
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

  const getCategoryBadge = (category: string) => {
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

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Template Details</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading template details...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_350px] gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>Created on {formatDate(template.createdAt)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(template.status)}
                      {getCategoryBadge(template.category)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Language</h3>
                    <p>{template.language}</p>
                  </div>

                  {template.components.header.text && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Header</h3>
                      <p>{template.components.header.text}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium mb-1">Body</h3>
                    <p className="whitespace-pre-wrap">{template.components.body.text}</p>
                  </div>

                  {template.components.footer.text && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Footer</h3>
                      <p>{template.components.footer.text}</p>
                    </div>
                  )}

                  {/* Buttons would be displayed here */}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => router.push(`/templates/${params.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Template
                  </Button>
                  <Button variant="destructive" className="gap-2">
                    <Trash className="h-4 w-4" />
                    Delete Template
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Send Test Message</CardTitle>
                  <CardDescription>Test this template by sending a message to a WhatsApp number</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full gap-2" onClick={() => router.push(`/send?template=${params.id}`)}>
                    <Send className="h-4 w-4" />
                    Send Test
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>How your template appears to recipients</CardDescription>
                </CardHeader>
                <CardContent>
                  <TemplatePreview template={template} variables={variables} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Template Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Current Status</h3>
                      <div className="flex items-center">
                        {getStatusBadge(template.status)}
                        <span className="ml-2 text-sm">
                          {template.status === "APPROVED"
                            ? "Ready to use"
                            : template.status === "PENDING"
                              ? "Awaiting review"
                              : "Needs attention"}
                        </span>
                      </div>
                    </div>

                    {template.status === "REJECTED" && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Rejection Reason</h3>
                        <p className="text-sm text-red-600">Template category does not match content</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
