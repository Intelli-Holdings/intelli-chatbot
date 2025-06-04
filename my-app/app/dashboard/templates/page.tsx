"use client"

import { useState } from "react"
import { Search, Settings, ChevronDown, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CreateTemplateForm from "@/components/create-template-form"
import DashboardHeader from "@/components/dashboard-header"

// Mock data for templates
const mockTemplates = [
  {
    id: "1",
    name: "intelli_escalations",
    category: "UTILITY",
    status: "ACTIVE",
    language: "English (US)",
    languageDetails: "Hi {{first_name}}, An agent will assist you shortly.",
    deliveries: 0,
    reads: 0,
    blocks: "--",
    lastEdited: "Feb 22, 2025",
  },
  {
    id: "2",
    name: "statement_available_4",
    category: "MARKETING",
    status: "ACTIVE",
    language: "English (US)",
    languageDetails: "Welcome {{1}} and Congratulations!",
    deliveries: 0,
    reads: 0,
    blocks: "--",
    lastEdited: "Nov 14, 2024",
  },
  {
    id: "3",
    name: "customer_support_chat",
    category: "MARKETING",
    status: "ACTIVE",
    language: "English",
    languageDetails: "Congratulations {{1}} on your purchase!",
    deliveries: 0,
    reads: 0,
    blocks: "--",
    lastEdited: "Nov 13, 2024",
  },
  {
    id: "4",
    name: "hello_world",
    category: "UTILITY",
    status: "ACTIVE",
    language: "English (US)",
    languageDetails: "Welcome and congratulations on your purchase!",
    deliveries: 0,
    reads: 0,
    blocks: "--",
    lastEdited: "Oct 9, 2024",
  },
]

export default function TemplatesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <DashboardHeader />

        <main className="p-6">
          <Tabs defaultValue="templates">
            <TabsList className="mb-6">
              <TabsTrigger value="templates" className="px-6">
                Templates
              </TabsTrigger>
              <TabsTrigger value="template-groups" className="px-6">
                Template groups
              </TabsTrigger>
            </TabsList>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search" className="pl-9" />
              </div>

              <Button variant="outline" className="gap-2">
                Category <ChevronDown className="h-4 w-4" />
              </Button>              

              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" /> Namespace
              </Button>

            

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700">Create template</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Message Template</DialogTitle>
                  </DialogHeader>
                  <CreateTemplateForm onClose={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Template name
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 15L12 20L17 15M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Category
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 15L12 20L17 15M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Language
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 15L12 20L17 15M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Status
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 15L12 20L17 15M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Message deliveries
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 15L12 20L17 15M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Message reads
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 15L12 20L17 15M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Top blocks
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Last edited
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 15L12 20L17 15M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockTemplates.map((template) => (
                    <tr key={template.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3">{template.name}</td>
                      <td className="px-4 py-3">{template.category}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div>{template.language}</div>
                          <div className="text-xs text-muted-foreground">{template.languageDetails}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active - Qualified</Badge>
                      </td>
                      <td className="px-4 py-3">{template.deliveries}</td>
                      <td className="px-4 py-3">{template.reads}</td>
                      <td className="px-4 py-3">{template.blocks}</td>
                      <td className="px-4 py-3">{template.lastEdited}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t p-4 text-sm text-muted-foreground">
                4 message templates shown (total active templates: 4 of 6000)
              </div>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
