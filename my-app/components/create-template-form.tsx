"use client"

import type React from "react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { TemplateCreationHandler } from "@/utils/template-creator"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, X, Image as ImageIcon, Video, FileText, MapPin, Phone, Link, MessageSquare, Info, Upload, File, ChevronLeft, Loader2, AlertCircle } from "lucide-react"

interface CreateTemplateFormProps {
  onClose: () => void
  onSubmit: (templateData: any) => Promise<boolean>
  loading?: boolean
  appService?: any
}

const LANGUAGES = [
  { code: "en_US", name: "English (US)" },
  { code: "en_GB", name: "English (UK)" },
  { code: "es", name: "Spanish" },
  { code: "es_ES", name: "Spanish (Spain)" },
  { code: "es_MX", name: "Spanish (Mexico)" },
  { code: "pt_BR", name: "Portuguese (Brazil)" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "zh_CN", name: "Chinese (Simplified)" },
]

const MEDIA_LIMITS = {
  IMAGE: { maxSize: 5 * 1024 * 1024, formats: ['.jpg', '.jpeg', '.png'], accept: 'image/jpeg,image/png' },
  VIDEO: { maxSize: 16 * 1024 * 1024, formats: ['.mp4'], accept: 'video/mp4' },
  DOCUMENT: { maxSize: 100 * 1024 * 1024, formats: ['.pdf'], accept: 'application/pdf' }
}

export default function CreateTemplateForm({ onClose, onSubmit, loading = false, appService }: CreateTemplateFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [templateData, setTemplateData] = useState({
    name: "",
    language: "en_US", // DEFAULT LANGUAGE
    category: "UTILITY" as "MARKETING" | "UTILITY" | "AUTHENTICATION",
    subcategory: "custom" as "custom" | "catalogue" | "flows" | "otp",
    headerType: "NONE" as "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION",
    headerText: "",
    headerMediaFile: null as File | null,
    headerMediaPreview: "",
    body: "",
    footer: "",
    buttonType: "NONE" as "NONE" | "CALL_TO_ACTION" | "QUICK_REPLY",
    buttons: [] as any[],
    bodyVariables: [] as string[],
    headerVariables: [] as string[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Category configurations
  const categoryConfig = {
    MARKETING: { subcategories: ["custom", "catalogue", "flows"], label: "Marketing" },
    UTILITY: { subcategories: ["custom", "flows"], label: "Utility" },
    AUTHENTICATION: { subcategories: ["otp"], label: "Authentication" }
  }

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\d+)\}\}/g) || []
    return matches.map(match => match)
  }

  const handleBodyChange = (text: string) => {
    setTemplateData({
      ...templateData,
      body: text,
      bodyVariables: extractVariables(text)
    })
  }

  const handleHeaderTextChange = (text: string) => {
    setTemplateData({
      ...templateData,
      headerText: text,
      headerVariables: extractVariables(text)
    })
  }

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const mediaType = templateData.headerType as 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    const limits = MEDIA_LIMITS[mediaType]
    
    if (!limits) {
      toast.error("Invalid media type selected")
      return
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!limits.formats.includes(fileExtension)) {
      toast.error(`Invalid file format. Accepted formats: ${limits.formats.join(', ')}`)
      return
    }

    if (file.size > limits.maxSize) {
      const maxSizeMB = limits.maxSize / (1024 * 1024)
      toast.error(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    let previewUrl = ""
    if (mediaType === 'IMAGE') {
      previewUrl = URL.createObjectURL(file)
    }

    setTemplateData({
      ...templateData,
      headerMediaFile: file,
      headerMediaPreview: previewUrl
    })

    toast.success(`${file.name} added successfully`)
  }

  const uploadMediaToMeta = async (file: File, appService: any): Promise<string> => {
    if (!appService) {
      throw new Error('App service not provided');
    }

    if (!appService.access_token || appService.access_token === 'undefined') {
      throw new Error('Valid access token not available');
    }

    try {
      setIsUploadingMedia(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', appService.access_token);

      const response = await fetch('/api/whatsapp/upload-media', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText };
        }
        throw new Error(error.error || 'Failed to upload media');
      }

      const data = await response.json();
      
      if (!data.handle) {
        throw new Error('No media handle received from upload');
      }
      
      return data.handle;
    } catch (error) {
      console.error('Meta upload error:', error);
      throw error;
    } finally {
      setIsUploadingMedia(false);
    }
  }

  const handleCategoryChange = (category: "MARKETING" | "UTILITY" | "AUTHENTICATION") => {
    const config = categoryConfig[category]
    setTemplateData({
      ...templateData,
      category,
      subcategory: config.subcategories[0] as any
    })
  }

  const validateStep1 = (): boolean => {
    if (!templateData.name.trim()) {
      toast.error("Template name is required")
      return false
    }
    
    if (!/^[a-z0-9_]+$/.test(templateData.name.toLowerCase())) {
      toast.error("Template name can only contain lowercase letters, numbers, and underscores")
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const addButton = () => {
    const maxButtons = templateData.buttonType === "QUICK_REPLY" ? 3 : 3; // Max 3 total: 2 URL + 1 Phone
    
    if (templateData.buttons.length >= maxButtons) {
      toast.error(`Maximum ${maxButtons} buttons allowed`);
      return;
    }

    // Check URL button limit (max 2)
    const urlButtonCount = templateData.buttons.filter(b => b.type === 'URL').length;
    const phoneButtonCount = templateData.buttons.filter(b => b.type === 'PHONE_NUMBER').length;

    if (templateData.buttonType === "CALL_TO_ACTION") {
      if (templateData.category === "AUTHENTICATION") {
        setTemplateData({
          ...templateData,
          buttons: [{
            type: "OTP",
            otp_type: "COPY_CODE",
            text: "Copy Code"
          }]
        });
      } else {
        // Default to URL if less than 2 URL buttons exist
        if (urlButtonCount < 2) {
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
          });
        } else if (phoneButtonCount < 1) {
          // Add phone button if URL limit reached
          setTemplateData({
            ...templateData,
            buttons: [
              ...templateData.buttons,
              {
                type: "PHONE_NUMBER",
                text: "",
                phone_number: ""
              }
            ]
          });
        } else {
          toast.error("Maximum buttons reached: 2 URL + 1 Phone");
        }
      }
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
      });
    }
  };

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

  const handleSubmit = async () => {
    if (!templateData.body.trim()) {
      toast.error("Message body is required")
      return
    }

    setIsSubmitting(true)
    
    try {
      let headerMediaHandle = null
      
      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateData.headerType) && templateData.headerMediaFile) {
        if (!appService) {
          toast.error("App service is required for media upload")
          setIsSubmitting(false)
          return
        }
        
        try {
          toast.info("Uploading media to Meta...")
          headerMediaHandle = await uploadMediaToMeta(templateData.headerMediaFile, appService)
          
          if (!headerMediaHandle) {
            throw new Error('No media handle received from upload')
          }
          
          toast.success("Media uploaded successfully!");
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error(`Failed to upload media: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
          setIsSubmitting(false)
          return
        }
      }
  
      const templateDataWithMedia = {
        ...templateData,
        headerMediaHandle: headerMediaHandle
      }
  
      const formattedTemplate = TemplateCreationHandler.createTemplate(templateDataWithMedia)
  
      const success = await onSubmit(formattedTemplate)
      
      if (success) {
        toast.success("Template created successfully!")
        if (templateData.headerMediaPreview) {
          URL.revokeObjectURL(templateData.headerMediaPreview)
        }
        onClose()
      }
    } catch (error) {
      console.error('Template creation error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPreview = () => {
    const replaceVariables = (text: string, variables: string[]) => {
      let result = text
      variables.forEach((_, index) => {
        result = result.replace(`{{${index + 1}}}`, `[Var${index + 1}]`)
      })
      return result
    }

    return (
      <div className="sticky top-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#E5DDD5] p-4 rounded-lg">
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[280px] space-y-2">
                {/* Header */}
                {templateData.headerType !== "NONE" && (
                  <div>
                    {templateData.headerType === "TEXT" && templateData.headerText && (
                      <div className="text-sm font-semibold text-gray-900">
                        {replaceVariables(templateData.headerText, templateData.headerVariables)}
                      </div>
                    )}
                    {templateData.headerType === "IMAGE" && templateData.headerMediaPreview && (
                      <Image 
                        src={templateData.headerMediaPreview} 
                        alt="Header" 
                        className="w-full rounded-md"
                        height={128}
                        width={256}
                      />
                    )}
                    {templateData.headerType === "IMAGE" && !templateData.headerMediaPreview && (
                      <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {templateData.headerType === "VIDEO" && (
                      <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {templateData.headerType === "DOCUMENT" && (
                      <div className="bg-gray-200 p-3 rounded flex items-center gap-2">
                        <FileText className="h-6 w-6 text-gray-600" />
                        <span className="text-xs">[Document]</span>
                      </div>
                    )}
                    {templateData.headerType === "LOCATION" && (
                      <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Body */}
                {templateData.body && (
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {replaceVariables(templateData.body, templateData.bodyVariables)}
                  </div>
                )}
                
                {/* Footer */}
                {templateData.footer && (
                  <div className="text-xs text-gray-500">
                    {templateData.footer}
                  </div>
                )}
                
                {/* Buttons */}
                {templateData.buttons.length > 0 && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    {templateData.buttons.map((button, index) => (
                      <div key={index} className="text-center text-sm text-blue-600 font-medium py-1">
                        {button.type === "PHONE_NUMBER" && <Phone className="inline h-3 w-3 mr-1" />}
                        {button.type === "URL" && <Link className="inline h-3 w-3 mr-1" />}
                        {button.type === "QUICK_REPLY" && <MessageSquare className="inline h-3 w-3 mr-1" />}
                        {button.text || "[Button]"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-center text-gray-500">
                WhatsApp Preview
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
            1
          </div>
          <div className="w-16 h-0.5 bg-gray-300" />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
            2
          </div>
        </div>
      </div>

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Create Template</h2>
            <p className="text-muted-foreground">Choose category and provide basic information</p>
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-sm font-medium">
              Template Name *
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., order_confirmation"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              required
              pattern="[a-z0-9_]+"
            />
            <p className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, and underscores only
            </p>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Language *
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

          {/* Category */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Category *</Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Button
                  key={key}
                  type="button"
                  variant={templateData.category === key ? "default" : "outline"}
                  className={`h-auto py-4 ${templateData.category === key ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  onClick={() => handleCategoryChange(key as any)}
                >
                  <div className="text-center">
                    <div className="font-semibold">{config.label}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type *</Label>
            <RadioGroup 
              value={templateData.subcategory} 
              onValueChange={(value) => setTemplateData({ ...templateData, subcategory: value as any })}
            >
              <div className="space-y-2">
                {categoryConfig[templateData.category].subcategories.map((sub) => (
                  <div key={sub} className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value={sub} id={sub} />
                    <Label htmlFor={sub} className="flex-1 cursor-pointer capitalize">
                      {sub === "otp" ? "One-time Passcode" : sub}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Next Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Template Body Composition */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Panel: Editor */}
          <div className="space-y-6">
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="mb-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Category
              </Button>
              <h3 className="text-xl font-semibold">Compose Your Template</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {templateData.name} • {categoryConfig[templateData.category].label}
              </p>
            </div>

            {/* Header */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Header (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {["NONE", "TEXT", "IMAGE", "VIDEO", "DOCUMENT", "LOCATION"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={templateData.headerType === type ? "default" : "outline"}
                    size="sm"
                    className={templateData.headerType === type ? "bg-blue-600 hover:bg-blue-700" : ""}
                    onClick={() => setTemplateData({ 
                      ...templateData, 
                      headerType: type as any,
                      headerText: type === "TEXT" ? templateData.headerText : "",
                      headerMediaFile: ["IMAGE", "VIDEO", "DOCUMENT"].includes(type) ? templateData.headerMediaFile : null
                    })}
                  >
                    {type === "IMAGE" && <ImageIcon className="h-3 w-3 mr-1" />}
                    {type === "VIDEO" && <Video className="h-3 w-3 mr-1" />}
                    {type === "DOCUMENT" && <FileText className="h-3 w-3 mr-1" />}
                    {type === "LOCATION" && <MapPin className="h-3 w-3 mr-1" />}
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
              
              {templateData.headerType === "TEXT" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs">Header Text (60 chars, 1 variable max)</Label>
                    {templateData.headerVariables.length === 0 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => insertVariable('header')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Variable
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Enter header text"
                    value={templateData.headerText}
                    onChange={(e) => handleHeaderTextChange(e.target.value)}
                    maxLength={60}
                  />
                  {templateData.headerVariables.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Header can only have 1 variable. Variable: {templateData.headerVariables[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateData.headerType) && (
                <div className="space-y-2">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Upload a sample {templateData.headerType.toLowerCase()} file for template approval
                    </AlertDescription>
                  </Alert>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={MEDIA_LIMITS[templateData.headerType as keyof typeof MEDIA_LIMITS]?.accept}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {templateData.headerMediaFile ? (
                    <Card className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{templateData.headerMediaFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(templateData.headerMediaFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTemplateData({ ...templateData, headerMediaFile: null, headerMediaPreview: "" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {templateData.headerType}
                    </Button>
                  )}
                </div>
              )}

              {templateData.headerType === "LOCATION" && (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Location will be specified when sending the message. The template will show a map placeholder.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Body */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Message Body *</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertVariable('body')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Variable
                </Button>
              </div>
              <Textarea
                placeholder="Enter your message content..."
                value={templateData.body}
                onChange={(e) => handleBodyChange(e.target.value)}
                required
                rows={6}
                maxLength={1024}
                className="font-mono text-sm"
              />
              {templateData.bodyVariables.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Variables: {templateData.bodyVariables.join(', ')}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="space-y-2">
              <Label htmlFor="footer" className="text-sm font-medium">
                Footer (Optional, 60 chars max)
              </Label>
              <Input
                id="footer"
                placeholder="e.g., Reply STOP to opt out"
                value={templateData.footer}
                onChange={(e) => setTemplateData({ ...templateData, footer: e.target.value })}
                maxLength={60}
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Buttons (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={templateData.buttonType === "NONE" ? "default" : "outline"}
                  onClick={() => setTemplateData({ ...templateData, buttonType: "NONE", buttons: [] })}
                >
                  None
                </Button>
                <Button
                  type="button"
                  variant={templateData.buttonType === "CALL_TO_ACTION" ? "default" : "outline"}
                  onClick={() => setTemplateData({ ...templateData, buttonType: "CALL_TO_ACTION", buttons: [] })}
                >
                  Call to Action
                </Button>
                <Button
                  type="button"
                  variant={templateData.buttonType === "QUICK_REPLY" ? "default" : "outline"}
                  onClick={() => setTemplateData({ ...templateData, buttonType: "QUICK_REPLY", buttons: [] })}
                >
                  Quick Reply
                </Button>
              </div>

              {templateData.buttonType !== "NONE" && (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {templateData.buttonType === "CALL_TO_ACTION" 
                        ? "Max 3 buttons: Up to 2 URL buttons + 1 Phone button"
                        : "Max 3 quick reply buttons"}
                    </AlertDescription>
                  </Alert>
                  
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
                        
                        {templateData.buttonType === "CALL_TO_ACTION" && button.type !== "OTP" && (
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
                                placeholder="https://example.com"
                                value={button.url}
                                onChange={(e) => updateButton(index, 'url', e.target.value)}
                              />
                            )}
                            
                            {button.type === "PHONE_NUMBER" && (
                              <Input
                                placeholder="for example 254712345678 (no &quot;+&quot; sign)"
                                value={button.phone_number}
                                onChange={(e) => updateButton(index, 'phone_number', e.target.value)}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={isSubmitting || loading || isUploadingMedia}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="lg:block hidden">
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  )
}