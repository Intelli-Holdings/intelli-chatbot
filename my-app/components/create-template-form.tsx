"use client"

import type React from "react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { metaConfigService } from "@/services/meta-config"
import { TemplateCreationHandler } from "@/utils/template-creator"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Image as ImageIcon, Video, FileText, MapPin, Copy, Phone, Link, MessageSquare, Info, Upload, FolderOpen, Globe, File, Eye, EyeOff, Folder, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import type { 
  TemplateCategory,
  TEMPLATE_LIMITS,
  SUPPORTED_LANGUAGES
} from '@/types/whatsapp-templates'
import { 
  validateTemplateName,
  validateHeaderText,
  validateBodyText,
  validateFooterText,
  validateButtonText,
  validateButtonCombination
} from '@/types/whatsapp-templates'
import {
  validateTemplateCompliance,
  autoCategorizeTemplate,
  getCategoryRequirements
} from '@/utils/template-validation'

interface CreateTemplateFormProps {
  onClose: () => void
  onSubmit: (templateData: any) => Promise<boolean>
  loading?: boolean
  appService?: any
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
  { code: "en", name: "English" },
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

// File size limits and accepted formats
const MEDIA_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    formats: ['.jpg', '.jpeg', '.png'],
    mimeTypes: ['image/jpeg', 'image/png']
  },
  VIDEO: {
    maxSize: 16 * 1024 * 1024, // 16MB
    formats: ['.mp4'],
    mimeTypes: ['video/mp4']
  },
  DOCUMENT: {
    maxSize: 100 * 1024 * 1024, // 100MB
    formats: ['.pdf'],
    mimeTypes: ['application/pdf']
  }
}

// Media configuration for different types
const MEDIA_CONFIGS = {
  IMAGE: {
    accept: 'image/jpeg,image/png'
  },
  VIDEO: {
    accept: 'video/mp4'
  },
  DOCUMENT: {
    accept: 'application/pdf'
  }
}

export default function CreateTemplateForm({ onClose, onSubmit, loading = false, appService }: CreateTemplateFormProps) {
  const [templateData, setTemplateData] = useState({
    name: "",
    language: "", 
    category: "UTILITY",
    headerType: "NONE",
    headerText: "",
    headerMediaFile: null as File | null, // For uploaded media file
    headerMediaPreview: "", // For preview URL
    body: "",
    footer: "",
    buttonType: "NONE",
    buttons: [] as any[],
    bodyVariables: [] as string[],
    headerVariables: [] as string[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [mediaUploadMethod, setMediaUploadMethod] = useState<'upload'>('upload')
  const [showMediaPreview, setShowMediaPreview] = useState(true)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

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

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const mediaType = templateData.headerType as 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    const limits = MEDIA_LIMITS[mediaType]
    
    if (!limits) {
      toast.error("Invalid media type selected")
      return
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!limits.formats.includes(fileExtension)) {
      toast.error(`Invalid file format. Accepted formats: ${limits.formats.join(', ')}`)
      return
    }

    // Check file size
    if (file.size > limits.maxSize) {
      const maxSizeMB = limits.maxSize / (1024 * 1024)
      toast.error(`File size exceeds ${maxSizeMB}MB limit`)
      return
    }

    // Create preview URL for images
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

  // Handle folder selection
  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Take the first file from the selected folder
    const fakeEvent = {
      ...event,
      target: {
        ...event.target,
        files: [files[0]] as any
      }
    }
    handleFileUpload(fakeEvent)
  }

  // Clear media selection
  const clearMediaSelection = () => {
    if (templateData.headerMediaPreview) {
      URL.revokeObjectURL(templateData.headerMediaPreview)
    }
    
    setTemplateData({
      ...templateData,
      headerMediaFile: null,
      headerMediaPreview: ""
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = ""
    }
  }

  // Remove uploaded file
  const removeUploadedFile = () => {
    clearMediaSelection()
  }

  // Upload file to Meta's Resumable Upload API and get media handle
  const uploadMediaToMeta = async (file: File, appService: any): Promise<string> => {
    try {
      setIsUploadingMedia(true)
      
      const config = await metaConfigService.getConfigForAppService(appService)
      if (!config) {
        throw new Error('Could not get Meta app configuration')
      }
  
      const formData = new FormData()
      formData.append('file', file)
      formData.append('appId', config.appId)
      formData.append('accessToken', config.accessToken)
  
      const response = await fetch('/api/whatsapp/upload-media', {
        method: 'POST',
        body: formData
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload media')
      }
  
      const data = await response.json()
      
      // Debug logging
      console.log('Media upload response:', data)
      console.log('Media handle (uploadData.h):', data.handle)
      
      // Use the handle field which contains uploadData.h from the API response
      const mediaHandle = data.handle
      
      if (!mediaHandle) {
        console.error('No valid handle found in response:', data)
        throw new Error('Media upload succeeded but no handle was returned')
      }
      
      return mediaHandle
    } catch (error) {
      console.error('Meta upload error:', error)
      throw error
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!templateData.name.trim()) {
      toast.error("Template name is required")
      return
    }
    
    if (!templateData.language) {
      toast.error("Language is required")
      return
    }
    
    if (!templateData.body.trim()) {
      toast.error("Message body is required")
      return
    }

    if (!/^[a-z0-9_]+$/.test(templateData.name.toLowerCase())) {
      toast.error("Template name can only contain lowercase letters, numbers, and underscores")
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
          
          // Verify the handle was received
          console.log('Received media handle:', headerMediaHandle)
          
          if (!headerMediaHandle) {
            throw new Error('No media handle received from upload')
          }
          
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error(`Failed to upload media: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
          setIsSubmitting(false)
          return
        }
      }
  
      // Prepare template data with media handle from upload API
      const templateDataWithMedia = {
        ...templateData,
        headerMediaHandle: headerMediaHandle // Always use handle from upload API response
      }
      
      console.log('Template data with media:', templateDataWithMedia)
  
      // Use the new template creation handler
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

  const addButton = () => {
  const maxButtons = templateData.buttonType === "QUICK_REPLY" ? 3 : 2;
  
  if (templateData.buttons.length >= maxButtons) {
    toast.error(`Maximum ${maxButtons} buttons allowed for ${templateData.buttonType}`);
    return;
  }

  if (templateData.buttonType === "CALL_TO_ACTION") {
    // For authentication templates, add OTP button option
    if (templateData.category === "AUTHENTICATION") {
      setTemplateData({
        ...templateData,
        buttons: [
          ...templateData.buttons,
          {
            type: "OTP",
            otp_type: "COPY_CODE",
            text: "Copy Code"
          }
        ]
      });
    } else {
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
                  <>
                    {templateData.headerMediaPreview && showMediaPreview ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={templateData.headerMediaPreview} 
                          alt="Template header" 
                          className="w-full rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            setShowMediaPreview(false)
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                          onClick={() => setShowMediaPreview(false)}
                        >
                          <EyeOff className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-xs">[Image]</span>
                        {templateData.headerMediaPreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 p-1"
                            onClick={() => setShowMediaPreview(true)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
                {templateData.headerType === "VIDEO" && (
                  <>
                    {templateData.headerMediaFile && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        📹 {templateData.headerMediaFile.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span className="text-xs">[Video]</span>
                    </div>
                  </>
                )}
                {templateData.headerType === "DOCUMENT" && (
                  <>
                    {templateData.headerMediaFile && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        📄 {templateData.headerMediaFile.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">[Document]</span>
                    </div>
                  </>
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
    <div className="overflow-y-auto space-y-6">
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
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
              onClick={() => setTemplateData({ 
                ...templateData, 
                headerType: "NONE", 
                headerText: "", 
                headerMediaFile: null,
                headerMediaPreview: ""
              })}
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
              <ImageIcon className="h-3 w-3 mr-1" />
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

          {/* Media Upload Section */}
          {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateData.headerType) && (
            <div className="space-y-4">
              <Label className="text-xs">Media Upload (Required for approval)</Label>
              
              <div className="space-y-2">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Meta requires media files to be uploaded through their API. Direct URLs are not supported.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={MEDIA_LIMITS[templateData.headerType as keyof typeof MEDIA_LIMITS]?.formats.join(',')}
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
                          onClick={removeUploadedFile}
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
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Media
                    </Button>
                  )}
                </div>
              </div>

              {/* Media Format Info */}
              <div className="text-xs text-muted-foreground">
                {templateData.headerType === "IMAGE" && "Supported: JPG, PNG (max 5MB)"}
                {templateData.headerType === "VIDEO" && "Supported: MP4 (max 16MB)"}
                {templateData.headerType === "DOCUMENT" && "Supported: PDF (max 100MB)"}
              </div>

              {/* Media Preview */}
              {templateData.headerMediaPreview && (
                <Card className="p-3">
                  <div className="text-xs font-medium mb-2">Media Preview</div>
                  {templateData.headerType === "IMAGE" && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={templateData.headerMediaPreview}
                        alt="Preview"
                        className="w-full max-h-48 object-contain rounded"
                      />
                    </>
                  )}
                  {templateData.headerType === "VIDEO" && (
                    <video
                      src={templateData.headerMediaPreview}
                      className="w-full max-h-48 rounded"
                      controls
                    />
                  )}
                  {templateData.headerType === "DOCUMENT" && templateData.headerMediaFile && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{templateData.headerMediaFile.name}</div>
                        <div className="text-xs text-muted-foreground">
                          PDF Document • {(templateData.headerMediaFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Upload a sample media file for template approval. Meta requires media to be uploaded through their API to generate a valid handle.
                  {isUploadingMedia && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Uploading to Meta...</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Body Configuration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-medium text-muted-foreground">MESSAGE BODY *</Label>
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
            placeholder="Enter your message content here..."
            value={templateData.body}
            onChange={(e) => handleBodyChange(e.target.value)}
            required
            rows={4}
            maxLength={1024}
          />
          {templateData.bodyVariables.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Variables: {templateData.bodyVariables.join(', ')}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Use {`{{1}}, {{2}}, {{3}}`} etc. for dynamic variables (max 1024 characters)
          </p>
        </div>

        {/* Footer Configuration */}
        <div className="space-y-2">
          <Label htmlFor="footer-text" className="text-xs font-medium text-muted-foreground">
            FOOTER TEXT (OPTIONAL, 60 chars max)
          </Label>
          <Input
            id="footer"
            placeholder="e.g., Reply STOP to opt out"
            value={templateData.footer}
            onChange={(e) => setTemplateData({ ...templateData, footer: e.target.value })}
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            Max 60 characters. Required for marketing templates to include opt-out instructions.
          </p>
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
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  )
}