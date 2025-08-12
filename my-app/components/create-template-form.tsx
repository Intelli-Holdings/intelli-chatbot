"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, X, Image, Video, FileText, MapPin, Copy, Phone, Link, MessageSquare, Info } from "lucide-react"

interface CreateTemplateFormProps {
  onClose: () => void
  onSubmit: (templateData: any) => Promise<boolean>
  loading?: boolean
}

interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION'
  text?: string
  example?: any
  buttons?: any[]
}

// Available languages with their codes
const LANGUAGES = [
  { code: "en_US", name: "English (US)" },
  { code: "en_GB", name: "English (UK)" },
  { code: "es", name: "Spanish" },
  { code: "es_ES", name: "Spanish (Spain)" },
  { code: "es_MX", name: "Spanish (Mexico)" },
  { code: "pt_BR", name: "Portuguese (Brazil)" },
  { code: "pt_PT", name: "Portuguese (Portugal)" },
  { code: "fr", name: "French" },
  { code: "fr_FR", name: "French (France)" },
  { code: "de", name: "German" },
  { code: "de_DE", name: "German (Germany)" },
  { code: "it", name: "Italian" },
  { code: "it_IT", name: "Italian (Italy)" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "zh_CN", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" }
]

export default function CreateTemplateForm({ onClose, onSubmit, loading = false }: CreateTemplateFormProps) {
  const [templateData, setTemplateData] = useState({
    name: "",
    language: "en_US",
    category: "UTILITY",
    headerType: "NONE",
    headerText: "",
    headerMediaUrl: "",
    body: "",
    footer: "",
    buttonType: "NONE",
    buttons: [] as any[],
    bodyVariables: [] as string[],
    headerVariables: [] as string[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Extract variables from text
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\d+)\}\}/g) || []
    return matches.map(match => match)
  }

  // Update body text and extract variables
  const handleBodyChange = (text: string) => {
    setTemplateData({
      ...templateData,
      body: text,
      bodyVariables: extractVariables(text)
    })
  }

  // Update header text and extract variables
  const handleHeaderTextChange = (text: string) => {
    setTemplateData({
      ...templateData,
      headerText: text,
      headerVariables: extractVariables(text)
    })
  }

  // Insert variable at cursor position
  const insertVariable = (field: 'body' | 'header') => {
    const variables = field === 'body' ? templateData.bodyVariables : templateData.headerVariables
    const nextIndex = variables.length + 1
    const variable = `{{${nextIndex}}}`
    
    if (field === 'body') {
      setTemplateData({
        ...templateData,
        body: templateData.body + variable,
        bodyVariables: [...variables, variable]
      })
    } else {
      setTemplateData({
        ...templateData,
        headerText: templateData.headerText + variable,
        headerVariables: [...variables, variable]
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!templateData.name.trim()) {
      toast.error("Template name is required")
      return
    }
    
    if (!templateData.body.trim()) {
      toast.error("Message body is required")
      return
    }

    // Validate template name
    if (!/^[a-z0-9_]+$/.test(templateData.name.toLowerCase())) {
      toast.error("Template name can only contain lowercase letters, numbers, and underscores")
      return
    }

    setIsSubmitting(true)
    
    try {
      const components: TemplateComponent[] = []
      
      // Add header component if specified
      if (templateData.headerType !== "NONE") {
        if (templateData.headerType === "TEXT" && templateData.headerText) {
          components.push({
            type: "HEADER",
            format: "TEXT",
            text: templateData.headerText
          })
        } else if (['IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION'].includes(templateData.headerType)) {
          components.push({
            type: "HEADER",
            format: templateData.headerType as any
          })
        }
      }
      
      // Add body component (required)
      components.push({
        type: "BODY",
        text: templateData.body
      })
      
      // Add footer component if specified
      if (templateData.footer) {
        components.push({
          type: "FOOTER",
          text: templateData.footer
        })
      }
      
      // Add buttons if specified
      if (templateData.buttonType !== "NONE" && templateData.buttons.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: templateData.buttons
        })
      }

      const payload = {
        name: templateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        language: templateData.language,
        category: templateData.category,
        components
      }

      const success = await onSubmit(payload)
      
      if (success) {
        toast.success("Template created successfully!")
        onClose()
      }
    } catch (error) {
      console.error('Template creation error:', error)
      toast.error("Failed to create template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addButton = () => {
    const maxButtons = templateData.buttonType === "QUICK_REPLY" ? 3 : 2
    
    if (templateData.buttons.length >= maxButtons) {
      toast.error(`Maximum ${maxButtons} buttons allowed for ${templateData.buttonType}`)
      return
    }

    if (templateData.buttonType === "CALL_TO_ACTION") {
      setTemplateData({
        ...templateData,
        buttons: [
          ...templateData.buttons,
          {
            type: "URL",
            text: "",
            url: "https://"
          }
        ]
      })
    } else if (templateData.buttonType === "QUICK_REPLY") {
      setTemplateData({
        ...templateData,
        buttons: [
          ...templateData.buttons,
          {
            type: "QUICK_REPLY",
            text: ""
          }
        ]
      })
    }
  }

  const removeButton = (index: number) => {
    setTemplateData({
      ...templateData,
      buttons: templateData.buttons.filter((_, i) => i !== index)
    })
  }

  const updateButton = (index: number, field: string, value: string) => {
    const updatedButtons = [...templateData.buttons]
    updatedButtons[index][field] = value
    setTemplateData({
      ...templateData,
      buttons: updatedButtons
    })
  }

  const updateButtonType = (index: number, type: string) => {
    const updatedButtons = [...templateData.buttons]
    if (type === 'PHONE_NUMBER') {
      updatedButtons[index] = {
        type: "PHONE_NUMBER",
        text: updatedButtons[index].text || "",
        phone_number: ""
      }
    } else if (type === 'URL') {
      updatedButtons[index] = {
        type: "URL",
        text: updatedButtons[index].text || "",
        url: "https://"
      }
    }
    setTemplateData({
      ...templateData,
      buttons: updatedButtons
    })
  }

  // Render template preview
  const renderPreview = () => {
    const replaceVariables = (text: string, variables: string[]) => {
      let result = text
      variables.forEach((_, index) => {
        result = result.replace(`{{${index + 1}}}`, `[Variable ${index + 1}]`)
      })
      return result
    }

    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            Template Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 space-y-2">
            {/* Header */}
            {templateData.headerType !== "NONE" && (
              <div className="font-medium">
                {templateData.headerType === "TEXT" && templateData.headerText && (
                  <div className="text-sm font-semibold">
                    {replaceVariables(templateData.headerText, templateData.headerVariables)}
                  </div>
                )}
                {templateData.headerType === "IMAGE" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Image className="h-4 w-4" />
                    <span className="text-xs">[Image]</span>
                  </div>
                )}
                {templateData.headerType === "VIDEO" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Video className="h-4 w-4" />
                    <span className="text-xs">[Video]</span>
                  </div>
                )}
                {templateData.headerType === "DOCUMENT" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs">[Document]</span>
                  </div>
                )}
                {templateData.headerType === "LOCATION" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs">[Location]</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className="text-sm whitespace-pre-wrap">
              {replaceVariables(templateData.body, templateData.bodyVariables)}
            </div>
            
            {/* Footer */}
            {templateData.footer && (
              <div className="text-xs text-muted-foreground mt-2">
                {templateData.footer}
              </div>
            )}
            
            {/* Buttons */}
            {templateData.buttons.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {templateData.buttons.map((button, index) => (
                  <div key={index} className="border rounded-md px-3 py-2 text-center text-sm bg-white dark:bg-gray-900">
                    {button.type === "PHONE_NUMBER" && <Phone className="inline h-3 w-3 mr-1" />}
                    {button.type === "URL" && <Link className="inline h-3 w-3 mr-1" />}
                    {button.type === "QUICK_REPLY" && <MessageSquare className="inline h-3 w-3 mr-1" />}
                    {button.text || "[Button Text]"}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-xs font-medium text-muted-foreground">
              TEMPLATE NAME *
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., order_confirmation"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              required
              pattern="[a-z0-9_]+"
              title="Only lowercase letters, numbers, and underscores"
            />
            <p className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, and underscores only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-xs font-medium text-muted-foreground">
              LANGUAGE *
            </Label>
            <Select 
              value={templateData.language} 
              onValueChange={(value) => setTemplateData({ ...templateData, language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">TEMPLATE CATEGORY *</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={templateData.category === "UTILITY" ? "default" : "outline"}
              className={templateData.category === "UTILITY" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, category: "UTILITY" })}
            >
              Utility
            </Button>
            <Button
              type="button"
              variant={templateData.category === "MARKETING" ? "default" : "outline"}
              className={templateData.category === "MARKETING" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, category: "MARKETING" })}
            >
              Marketing
            </Button>
            <Button
              type="button"
              variant={templateData.category === "AUTHENTICATION" ? "default" : "outline"}
              className={templateData.category === "AUTHENTICATION" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, category: "AUTHENTICATION" })}
            >
              Authentication
            </Button>
          </div>
          {templateData.category === "MARKETING" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Marketing templates must include opt-out instructions in the footer
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Header Configuration */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">HEADER (OPTIONAL)</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant={templateData.headerType === "NONE" ? "default" : "outline"}
              size="sm"
              className={templateData.headerType === "NONE" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "NONE", headerText: "", headerMediaUrl: "" })}
            >
              None
            </Button>
            <Button
              type="button"
              variant={templateData.headerType === "TEXT" ? "default" : "outline"}
              size="sm"
              className={templateData.headerType === "TEXT" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "TEXT" })}
            >
              <FileText className="h-3 w-3 mr-1" />
              Text
            </Button>
            <Button
              type="button"
              variant={templateData.headerType === "IMAGE" ? "default" : "outline"}
              size="sm"
              className={templateData.headerType === "IMAGE" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "IMAGE" })}
            >
              <Image className="h-3 w-3 mr-1" />
              Image
            </Button>
            <Button
              type="button"
              variant={templateData.headerType === "VIDEO" ? "default" : "outline"}
              size="sm"
              className={templateData.headerType === "VIDEO" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "VIDEO" })}
            >
              <Video className="h-3 w-3 mr-1" />
              Video
            </Button>
            <Button
              type="button"
              variant={templateData.headerType === "DOCUMENT" ? "default" : "outline"}
              size="sm"
              className={templateData.headerType === "DOCUMENT" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "DOCUMENT" })}
            >
              <FileText className="h-3 w-3 mr-1" />
              Document
            </Button>
            <Button
              type="button"
              variant={templateData.headerType === "LOCATION" ? "default" : "outline"}
              size="sm"
              className={templateData.headerType === "LOCATION" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "LOCATION" })}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Location
            </Button>
          </div>
          
          {templateData.headerType === "TEXT" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Header Text (60 chars max)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertVariable('header')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Variable
                </Button>
              </div>
              <Input
                placeholder="Enter header text"
                value={templateData.headerText}
                onChange={(e) => handleHeaderTextChange(e.target.value)}
                maxLength={60}
              />
              {templateData.headerVariables.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Variables: {templateData.headerVariables.join(', ')}
                </div>
              )}
            </div>
          )}

          {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateData.headerType) && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Media will need to be provided when submitting the template for approval
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Body Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="message-body" className="text-xs font-medium text-muted-foreground">
              MESSAGE BODY * (1024 chars max)
            </Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => insertVariable('body')}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Variable
            </Button>
          </div>
          
          <Textarea
            id="message-body"
            className="min-h-[150px]"
            placeholder="Type your message here... Use {{1}}, {{2}}, etc. for variables"
            value={templateData.body}
            onChange={(e) => handleBodyChange(e.target.value)}
            required
            maxLength={1024}
          />
          
          {templateData.bodyVariables.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Variables found: {templateData.bodyVariables.join(', ')}
            </div>
          )}
        </div>

        {/* Footer Text */}
        <div className="space-y-2">
          <Label htmlFor="footer-text" className="text-xs font-medium text-muted-foreground">
            FOOTER TEXT (OPTIONAL, 60 chars max)
          </Label>
          <Input
            id="footer-text"
            placeholder="e.g., Reply STOP to unsubscribe"
            value={templateData.footer}
            onChange={(e) => setTemplateData({ ...templateData, footer: e.target.value })}
            maxLength={60}
          />
        </div>

        {/* Button Configuration */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">BUTTONS (OPTIONAL)</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={templateData.buttonType === "NONE" ? "default" : "outline"}
              className={templateData.buttonType === "NONE" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, buttonType: "NONE", buttons: [] })}
            >
              None
            </Button>
            <Button
              type="button"
              variant={templateData.buttonType === "CALL_TO_ACTION" ? "default" : "outline"}
              className={templateData.buttonType === "CALL_TO_ACTION" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, buttonType: "CALL_TO_ACTION", buttons: [] })}
            >
              Call To Action
            </Button>
            <Button
              type="button"
              variant={templateData.buttonType === "QUICK_REPLY" ? "default" : "outline"}
              className={templateData.buttonType === "QUICK_REPLY" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, buttonType: "QUICK_REPLY", buttons: [] })}
            >
              Quick Reply
            </Button>
          </div>

          {templateData.buttonType !== "NONE" && (
            <div className="space-y-3">
              <Button type="button" variant="outline" size="sm" onClick={addButton}>
                <Plus className="h-4 w-4 mr-2" />
                Add Button
              </Button>
              
              {templateData.buttons.map((button, index) => (
                <Card key={index} className="p-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Button {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeButton(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Input
                      placeholder="Button text (25 chars max)"
                      value={button.text}
                      onChange={(e) => updateButton(index, 'text', e.target.value)}
                      maxLength={25}
                    />
                    
                    {templateData.buttonType === "CALL_TO_ACTION" && (
                      <>
                        <Select
                          value={button.type}
                          onValueChange={(value) => updateButtonType(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="URL">
                              <Link className="inline h-3 w-3 mr-1" />
                              Website URL
                            </SelectItem>
                            <SelectItem value="PHONE_NUMBER">
                              <Phone className="inline h-3 w-3 mr-1" />
                              Phone Number
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {button.type === "URL" && (
                          <Input
                            placeholder="https://example.com (use {{1}} for variables)"
                            value={button.url}
                            onChange={(e) => updateButton(index, 'url', e.target.value)}
                          />
                        )}
                        
                        {button.type === "PHONE_NUMBER" && (
                          <Input
                            placeholder="+1234567890 (include country code)"
                            value={button.phone_number}
                            onChange={(e) => updateButton(index, 'phone_number', e.target.value)}
                          />
                        )}
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>

        {/* Preview */}
        {previewMode && renderPreview()}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700" 
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  )
}