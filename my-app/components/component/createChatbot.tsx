"use client"

import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Globe, File, Type, Upload } from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { createChatbotSchema, type CreateChatbotFormData } from "@/lib/validations/forms"

const CreateChatbot = () => {
  const [step, setStep] = useState(1)
  const [manualLink, setManualLink] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<CreateChatbotFormData>({
    resolver: zodResolver(createChatbotSchema),
    defaultValues: {
      name: "",
      description: "",
      websiteUrl: "",
      customText: "",
    },
  })

  const handleWebsiteCrawl = () => {
    const websiteUrl = form.getValues("websiteUrl")
    if (!websiteUrl) {
      form.setError("websiteUrl", { message: "Enter a URL to crawl" })
      return
    }
    logger.info("Crawling website", { websiteUrl })
  }

  const handleAddLink = () => {
    logger.info("Adding manual link", { manualLink })
    setManualLink("")
  }

  const handleFileUpload = (files: FileList) => {
    const fileArray = Array.from(files)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validTypes = [".pdf", ".doc", ".docx", ".txt"]

    const validFiles = fileArray.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 5MB limit`)
        return false
      }
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      if (!validTypes.includes(ext)) {
        toast.error(`${file.name} has an unsupported file type`)
        return false
      }
      return true
    })

    setUploadedFiles((prev) => [...prev, ...validFiles])
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer.files) {
      handleFileUpload(event.dataTransfer.files)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  const handleCreateChatbot = async () => {
    const isValid = await form.trigger(["name"])
    if (!isValid) {
      toast.error("Please fill in the chatbot name")
      return
    }

    const values = form.getValues()

    try {
      const formData = new FormData()
      formData.append("name", values.name)
      if (values.description) formData.append("description", values.description)
      if (values.websiteUrl) formData.append("websiteUrl", values.websiteUrl)
      if (values.customText) formData.append("customText", values.customText)
      uploadedFiles.forEach((file) => formData.append("files", file))

      const response = await fetch("/api/create-chatbot", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Chatbot created successfully")
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error creating chatbot")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your Chatbot - step {step}/3</CardTitle>
        <p className="text-sm text-muted-foreground">
          Here you can add the sources that your AI Chatbot will be trained on.
        </p>
        <Form {...form}>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chatbot Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Chatbot Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Chatbot Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="website" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="website" onClick={() => setStep(1)}>
              <Globe className="mr-2 h-4 w-4" />
              Website Links
            </TabsTrigger>
            <TabsTrigger value="files" onClick={() => setStep(2)}>
              <File className="mr-2 h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="text" onClick={() => setStep(3)}>
              <Type className="mr-2 h-4 w-4" />
              Text
            </TabsTrigger>
          </TabsList>
          <TabsContent value="website">
            <div className="space-y-4">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Website</FormLabel>
                      <div className="flex rounded-md shadow-sm">
                        <FormControl>
                          <Input
                            type="url"
                            className="flex-1 rounded-none rounded-l-md"
                            placeholder="https://"
                            {...field}
                          />
                        </FormControl>
                        <Button type="button" className="rounded-none rounded-r-md" onClick={handleWebsiteCrawl}>
                          Crawl
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
              <div>
                <label htmlFor="manual-link" className="block text-sm font-medium text-gray-700">
                  Additional links
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    type="url"
                    name="manual-link"
                    id="manual-link"
                    className="flex-1 rounded-none rounded-l-md"
                    placeholder="https://"
                    value={manualLink}
                    onChange={(e) => setManualLink(e.target.value)}
                  />
                  <Button type="button" className="rounded-none rounded-r-md" onClick={handleAddLink}>
                    + Add Link
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="files">
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleClickUpload}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">Click to upload files or Drag & Drop</p>
                <p className="text-xs text-gray-500">.pdf, .doc, .docx or .txt (max. 5MB)</p>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Uploaded files:</h4>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="py-2 text-sm text-gray-600">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button type="button" className="w-full" onClick={handleCreateChatbot}>
                Initiate Training with Files
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="text">
            <div className="space-y-4">
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="customText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Write here any extra text that you consider relevant for your audience
                      </FormLabel>
                      <FormControl>
                        <Textarea className="mt-1" rows={6} placeholder="Write your text here..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Total Characters: {form.watch("customText")?.length || 0}</p>
                <Button type="button" onClick={handleCreateChatbot}>
                  Create Chatbot
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700">Usage Overview</h3>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Links</dt>
              <dd className="mt-1 text-sm text-gray-900">0/5</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Files</dt>
              <dd className="mt-1 text-sm text-gray-900">{uploadedFiles.length}/20</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Characters</dt>
              <dd className="mt-1 text-sm text-gray-900">{form.watch("customText")?.length || 0}/100K</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}

export default CreateChatbot
