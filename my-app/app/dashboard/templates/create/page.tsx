"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import CreateTemplateForm from "@/components/create-template-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/dashboard-header"
import TemplatePreview from "@/components/template-preview"

export default function CreateTemplatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [templateData, setTemplateData] = useState({
    name: "",
    category: "UTILITY",
    language: "en_US",
    components: {
      header: {
        type: "TEXT",
        text: "",
        format: "TEXT",
        example: "",
      },
      body: {
        text: "",
        examples: [["", "", ""]],
      },
      footer: {
        text: "",
      },
      buttons: [],
    },
  })

  const [bodyVariables, setBodyVariables] = useState<string[]>([])

  const handleAddBodyVariable = () => {
    setBodyVariables([...bodyVariables, ""])
  }

  const handleRemoveBodyVariable = (index: number) => {
    const newVariables = [...bodyVariables]
    newVariables.splice(index, 1)
    setTemplateData({
      ...templateData,
      components: {
        ...templateData.components,
        body: {
          ...templateData.components.body,
          text: updateTextWithVariables(templateData.components.body.text, newVariables.length),
        },
      },
    })
    setBodyVariables(newVariables)
  }

  const updateTextWithVariables = (text: string, count: number) => {
    // This is a simplified implementation
    // In a real app, you'd need more sophisticated variable handling
    const regex = /\{\{[0-9]+\}\}/g
    const cleanText = text.replace(regex, "")

    let newText = cleanText
    for (let i = 1; i <= count; i++) {
      newText += ` {{${i}}}`
    }

    return newText.trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // In a real app, this would call the Meta Business Management API
      console.log("Submitting template:", templateData)

      // Mock successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to templates list
      router.push("/templates")
    } catch (error) {
      console.error("Error creating template:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create New Template</h1>
        </div>
        <CreateTemplateForm 
          onClose={() => router.back()} 
          onSubmit={async (templateData) => {
            // This would normally be handled by the parent component
            // For now, just return false to indicate it needs to be implemented
            toast.error("Template creation needs to be connected to your WhatsApp Business API");
            return false;
          }}
        />
      </main>
    </div>
  )
}
