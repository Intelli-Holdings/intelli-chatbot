"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { type WhatsAppTemplate } from "@/services/whatsapp"

interface EditTemplateFormProps {
  template: WhatsAppTemplate
  onClose: () => void
  onSubmit: (templateData: any) => Promise<boolean>
  loading?: boolean
}

export default function EditTemplateForm({ template, onClose, onSubmit, loading = false }: EditTemplateFormProps) {
  const [templateData, setTemplateData] = useState({
    name: "",
    language: "en_US",
    category: "UTILITY",
    headerType: "NONE",
    headerText: "",
    body: "",
    footer: "",
    buttonType: "NONE",
    buttons: [] as any[],
    variables: [] as string[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (template) {
      // Parse existing template data
      const headerComponent = template.components?.find(c => c.type === 'HEADER')
      const bodyComponent = template.components?.find(c => c.type === 'BODY')
      const footerComponent = template.components?.find(c => c.type === 'FOOTER')
      const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS')

      setTemplateData({
        name: template.name,
        language: template.language,
        category: template.category,
        headerType: headerComponent ? headerComponent.format || "TEXT" : "NONE",
        headerText: headerComponent?.text || "",
        body: bodyComponent?.text || "",
        footer: footerComponent?.text || "",
        buttonType: buttonsComponent ? 
          (buttonsComponent.buttons?.[0]?.type === 'URL' ? "CALL_TO_ACTION" : "QUICK_REPLY") : "NONE",
        buttons: buttonsComponent?.buttons || [],
        variables: [] // Extract from body text if needed
      })
    }
  }, [template])

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

    setIsSubmitting(true)
    
    try {
      const components: any[] = []
      
      // Add header component if specified
      if (templateData.headerType !== "NONE" && templateData.headerText) {
        components.push({
          type: "HEADER",
          format: "TEXT",
          text: templateData.headerText
        })
      }
      
      // Add body component (required)
      components.push({
        type: "BODY",
        text: templateData.body,
        example: templateData.variables.length > 0 ? {
          body_text: [templateData.variables]
        } : undefined
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
        name: templateData.name,
        language: templateData.language,
        category: templateData.category,
        components
      }

      const success = await onSubmit(payload)
      
      if (success) {
        toast.success("Template updated successfully!")
        onClose()
      }
    } catch (error) {
      console.error('Template update error:', error)
      toast.error("Failed to update template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addVariable = () => {
    const newVar = `{{${templateData.variables.length + 1}}}`
    setTemplateData({
      ...templateData,
      variables: [...templateData.variables, newVar]
    })
  }

  const removeVariable = (index: number) => {
    setTemplateData({
      ...templateData,
      variables: templateData.variables.filter((_, i) => i !== index)
    })
  }

  const addButton = () => {
    if (templateData.buttonType === "CALL_TO_ACTION") {
      setTemplateData({
        ...templateData,
        buttons: [
          ...templateData.buttons,
          {
            type: "URL",
            text: "Visit Website",
            url: "https://example.com"
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
            text: "Yes"
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

  // Show warning if template is approved
  if (template.status === 'APPROVED') {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Template Cannot Be Modified</h3>
        <p className="text-muted-foreground mb-4">
          Approved templates cannot be edited. To make changes, you&apos;ll need to create a new template.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => {
            // This would create a copy for editing
            toast.info("Create copy functionality coming soon!")
          }}>
            Create Copy
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-xs font-medium text-muted-foreground">
              TEMPLATE NAME *
            </Label>
            <Input
              id="template-name"
              placeholder="Use a name to track it later"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              required
              disabled // Template names cannot be changed after creation
            />
            <p className="text-xs text-muted-foreground">
              Template names cannot be changed after creation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-xs font-medium text-muted-foreground">
              LANGUAGE *
            </Label>
            <Select 
              value={templateData.language} 
              onValueChange={(value) => setTemplateData({ ...templateData, language: value })}
              disabled // Language cannot be changed after creation
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_US">English (US)</SelectItem>
                <SelectItem value="es_ES">Spanish (Spain)</SelectItem>
                <SelectItem value="pt_BR">Portuguese (Brazil)</SelectItem>
                <SelectItem value="fr_FR">French (France)</SelectItem>
                <SelectItem value="de_DE">German</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="zh_CN">Chinese (Simplified)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Language cannot be changed after creation
            </p>
          </div>
        </div>

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
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">HEADER TYPE</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={templateData.headerType === "NONE" ? "default" : "outline"}
              className={templateData.headerType === "NONE" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "NONE", headerText: "" })}
            >
              No Header
            </Button>
            <Button
              type="button"
              variant={templateData.headerType === "TEXT" ? "default" : "outline"}
              className={templateData.headerType === "TEXT" ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => setTemplateData({ ...templateData, headerType: "TEXT" })}
            >
              Text Header
            </Button>
          </div>
          
          {templateData.headerType === "TEXT" && (
            <div className="mt-2">
              <Input
                placeholder="Enter header text"
                value={templateData.headerText}
                onChange={(e) => setTemplateData({ ...templateData, headerText: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="message-body" className="text-xs font-medium text-muted-foreground">
              MESSAGE BODY (1024)*
            </Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={addVariable}>
                <Plus className="h-3 w-3" />
                Variables
              </Button>
            </div>
          </div>
          
          {templateData.variables.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {templateData.variables.map((variable, index) => (
                <div key={index} className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded text-sm">
                  <span>{variable}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeVariable(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Textarea
            id="message-body"
            className="min-h-[200px]"
            placeholder="Type your message here... Use {{1}}, {{2}}, etc. for variables"
            value={templateData.body}
            onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footer-text" className="text-xs font-medium text-muted-foreground">
            FOOTER TEXT
          </Label>
          <Input
            id="footer-text"
            placeholder="Provide text for footer (60 characters max)"
            value={templateData.footer}
            onChange={(e) => setTemplateData({ ...templateData, footer: e.target.value })}
            maxLength={60}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">BUTTON</Label>
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
                <div key={index} className="border rounded-lg p-3 space-y-2">
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
                    placeholder="Button text"
                    value={button.text}
                    onChange={(e) => updateButton(index, 'text', e.target.value)}
                  />
                  
                  {button.type === "URL" && (
                    <Input
                      placeholder="URL (https://example.com)"
                      value={button.url}
                      onChange={(e) => updateButton(index, 'url', e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || loading}>
            {isSubmitting ? "Updating..." : "Update Template"}
          </Button>
        </div>
      </form>
    </div>
  )
}
