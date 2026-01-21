"use client"

import { useState, useEffect, useRef } from "react"
import { useQueryClient } from "react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  Send,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Target,
  Loader2,
  Upload,
  Image as ImageIcon,
  Save,
  Rocket,
} from "lucide-react"
import { toast } from "sonner"
import { useWhatsAppTemplates } from "@/hooks/use-whatsapp-templates"
import { CampaignService, type CreateCampaignData } from "@/services/campaign"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { useContactTags } from "@/hooks/use-contact-tags"
import { usePaginatedContacts } from "@/hooks/use-contacts"

type WizardStep = "details" | "template" | "audience" | "schedule" | "review"
type LaunchOption = "draft" | "immediate" | "scheduled"
type MediaUploadMode = "single" | "per_recipient"

interface CampaignWizardProps {
  appService: any
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CampaignWizard({ appService, open, onClose, onSuccess }: CampaignWizardProps) {
  const organizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState<WizardStep>("details")
  const [submitting, setSubmitting] = useState(false)
  const queryOrganizationId = open ? (organizationId ?? undefined) : undefined
  const templateAppService = open ? (appService ?? null) : null
  const { templates, loading: templatesLoading, error: templatesError } = useWhatsAppTemplates(templateAppService)
  const { contacts, isLoading: contactsLoading, error: contactsError } = usePaginatedContacts<any>(
    queryOrganizationId || undefined,
    1,
    50
  )
  const { tags, isLoading: tagsLoading, error: tagsError } = useContactTags(queryOrganizationId)

  const invalidateCampaignQueries = () => {
    if (!organizationId) return
    queryClient.invalidateQueries(["campaigns", organizationId])
    queryClient.invalidateQueries(["campaign-status-counts", organizationId])
    queryClient.invalidateQueries(["whatsapp-campaigns", organizationId])
  }

  // Form state
  const [campaignName, setCampaignName] = useState("")
  const [campaignDescription, setCampaignDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [audienceType, setAudienceType] = useState<"segment" | "manual" | "csv">("segment")
  const [selectedSegment, setSelectedSegment] = useState("")

  // Launch options
  const [launchOption, setLaunchOption] = useState<LaunchOption | null>(null)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  // Media upload state
  const [mediaUploadMode, setMediaUploadMode] = useState<MediaUploadMode>("single")
  const [singleMediaUrl, setSingleMediaUrl] = useState("")
  const [singleMediaFile, setSingleMediaFile] = useState<File | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [perRecipientMedia, setPerRecipientMedia] = useState<Record<string, string>>({})
  const [overrideMedia, setOverrideMedia] = useState(false)
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null)

  // Manual selection state
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [contactSearch, setContactSearch] = useState("")
  const [createdWhatsAppCampaignId, setCreatedWhatsAppCampaignId] = useState<string | null>(null)
  const [previewMessages, setPreviewMessages] = useState<any[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewUpdatedAt, setPreviewUpdatedAt] = useState<string | null>(null)

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvContactCount, setCsvContactCount] = useState(0)

  const steps: WizardStep[] = ["details", "template", "audience", "schedule", "review"]
  const currentStepIndex = steps.indexOf(currentStep)

  const approvedTemplates = templates?.filter(t => t.status === "APPROVED") || []
  const selectedTemplateData = approvedTemplates.find(t => t.id === selectedTemplate)

  // Check if template has media header
  const templateHasMediaHeader = selectedTemplateData?.components?.some(
    (comp: any) => comp.type === "HEADER" && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format?.toUpperCase())
  ) || false

  const mediaHeaderType = selectedTemplateData?.components?.find(
    (comp: any) => comp.type === "HEADER" && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(comp.format?.toUpperCase())
  )?.format

  // Derive placeholder counts so we only send params when template truly expects them
  const headerPlaceholders: string[] = (() => {
    const headerComponent = selectedTemplateData?.components?.find((c: any) => c.type === "HEADER")
    if (!headerComponent) return []
    const format = headerComponent.format?.toUpperCase()
    if (format === "TEXT" && headerComponent.text) {
      return headerComponent.text.match(/\{\{(\w+|\d+)\}\}/g) || []
    }
    // Media headers with fixed media do NOT require params unless user overrides
    return []
  })()

  const bodyPlaceholders: string[] = (() => {
    const bodyComponent = selectedTemplateData?.components?.find((c: any) => c.type === "BODY")
    if (!bodyComponent?.text) return []
    return bodyComponent.text.match(/\{\{(\w+|\d+)\}\}/g) || []
  })()

  const templateRequiresHeaderParams = headerPlaceholders.length > 0
  const templateRequiresBodyParams = bodyPlaceholders.length > 0
  const shouldSendHeaderParams = templateRequiresHeaderParams || (overrideMedia && templateHasMediaHeader)

  useEffect(() => {
    if (templatesError) {
      toast.error(templatesError)
    }
  }, [templatesError])

  useEffect(() => {
    if (tagsError) {
      toast.error('Failed to load tags')
    }
  }, [tagsError])

  useEffect(() => {
    if (contactsError) {
      toast.error('Failed to load contacts')
    }
  }, [contactsError])

  useEffect(() => {
    setPreviewMessages([])
    setPreviewError(null)
    setPreviewUpdatedAt(null)
  }, [selectedTemplate])

  const filteredContacts = contacts.filter((c: any) =>
    c.fullname?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.phone?.includes(contactSearch) ||
    c.email?.toLowerCase().includes(contactSearch.toLowerCase())
  )

  const selectedSegmentData = tags.find((t: any) => t.id.toString() === selectedSegment)

  // Handle CSV file upload
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCsvFile(file)
      // Simple CSV parsing
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const rows = text.split('\n').filter(row => row.trim())
        const headers = rows[0].split(',')
        const data = rows.slice(1).map(row => {
          const values = row.split(',')
          return headers.reduce((obj: any, header, index) => {
            obj[header.trim()] = values[index]?.trim() || ''
            return obj
          }, {})
        })
        setCsvData(data)
        setCsvContactCount(data.length)
      }
      reader.readAsText(file)
    }
  }

  const uploadMediaToMeta = async (file: File): Promise<string> => {
    if (!appService) {
      throw new Error("App service not provided")
    }

    setIsUploadingMedia(true)
    try {
      const formData = new FormData()
      formData.append("media_file", file)
      formData.append("appservice_phone_number", appService.phone_number)
      formData.append("upload_type", "resumable")

      const organizationId = appService.organization_id || appService.organization?.id || appService.organizationId
      if (organizationId) {
        formData.append("organization", organizationId)
      }

      const response = await fetch("/api/whatsapp/templates/upload_media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let parsed
        try {
          parsed = JSON.parse(errorText)
        } catch {
          parsed = { error: errorText }
        }
        throw new Error(parsed.error || "Failed to upload media")
      }

      const data = await response.json()
      if (!data.handle) {
        throw new Error("No media handle received from upload")
      }

      return data.handle
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const getAcceptForMediaHeader = () => {
    const format = mediaHeaderType?.toUpperCase()
    if (format === "IMAGE") return "image/jpeg,image/png"
    if (format === "VIDEO") return "video/mp4"
    if (format === "DOCUMENT") return "application/pdf"
    return undefined
  }

  const handleSingleMediaFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setSingleMediaFile(file)
      toast.info("Uploading media to Meta...")
      const handle = await uploadMediaToMeta(file)
      setSingleMediaUrl(handle)
      toast.success("Media uploaded successfully")
    } catch (error: any) {
      console.error("Media upload failed:", error)
      toast.error(error?.message || "Failed to upload media")
      setSingleMediaFile(null)
      setSingleMediaUrl("")
    }
  }

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleMediaUrlChange = (contactId: string, url: string) => {
    setPerRecipientMedia(prev => ({
      ...prev,
      [contactId]: url
    }))
  }

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setCurrentStep("details")
      setCampaignName("")
      setCampaignDescription("")
      setSelectedTemplate("")
      setParameters({})
      setAudienceType("segment")
      setSelectedSegment("")
      setLaunchOption(null)
      setScheduledDate("")
      setScheduledTime("")
      setMediaUploadMode("single")
      setSingleMediaUrl("")
      setSingleMediaFile(null)
      setIsUploadingMedia(false)
      setPerRecipientMedia({})
      setOverrideMedia(false)
    }
  }, [open])

  const canProceed = () => {
    switch (currentStep) {
      case "details":
        return campaignName.trim() !== ""
      case "template":
        if (!selectedTemplate) return false
        // If template has media and we are overriding, check media is provided
        const shouldEnforceMedia = templateHasMediaHeader && shouldSendHeaderParams
        if (shouldEnforceMedia) {
          if (mediaUploadMode === "single") {
            return singleMediaUrl.trim() !== ""
          } else {
            // For per-recipient mode, we'll validate later when we have recipients
            return true
          }
        }
        return true
      case "audience":
        if (templateHasMediaHeader && shouldSendHeaderParams && mediaUploadMode === "per_recipient" && audienceType !== "manual") {
          return false
        }
        if (audienceType === "segment") {
          return selectedSegment !== ""
        } else if (audienceType === "manual") {
          const hasContacts = selectedContacts.length > 0
          // If per-recipient media mode, ensure all selected contacts have media
          if (templateHasMediaHeader && mediaUploadMode === "per_recipient") {
            return hasContacts && selectedContacts.every(id => perRecipientMedia[id]?.trim())
          }
          return hasContacts
        } else if (audienceType === "csv") {
          return csvFile !== null && csvContactCount > 0
        }
        return false
      case "schedule":
        if (!launchOption) {
          return false
        }
        if (launchOption === "scheduled") {
          return Boolean(scheduledDate && scheduledTime)
        }
        return true
      case "review":
        return Boolean(launchOption)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!canProceed()) {
      if (currentStep === "schedule" && !launchOption) {
        toast.error("Choose how you want to launch this campaign")
      } else if (currentStep === "audience" && templateHasMediaHeader && mediaUploadMode === "per_recipient" && audienceType !== "manual") {
        toast.error("Per-recipient media requires manual contact selection")
      } else {
        toast.error("Please fill in all required fields")
      }
      return
    }

    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleSubmit = async () => {
    if (!organizationId || !appService) {
      toast.error("Missing organization or app service")
      return
    }

    if (!launchOption) {
      toast.error("Select whether to launch now, schedule, or save as draft")
      return
    }

    if (shouldSendHeaderParams && mediaUploadMode === "single" && !singleMediaUrl) {
      toast.error("Upload or paste a media handle before continuing")
      return
    }

    if (isUploadingMedia) {
      toast.error("Please wait for the media upload to finish")
      return
    }

    const scheduledDateTime = launchOption === "scheduled" && scheduledDate && scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}`)
      : null
    if (launchOption === "scheduled" && !scheduledDateTime) {
      toast.error("Please provide a date and time to schedule this campaign")
      return
    }

    const ensureRecipientsExist = async (campaignId: string) => {
      const recipients = await CampaignService.getWhatsAppCampaignRecipients(
        campaignId,
        organizationId,
        { page_size: 1 }
      )

      const total = typeof recipients?.count === "number"
        ? recipients.count
        : Array.isArray(recipients)
        ? recipients.length
        : recipients?.results?.length || 0

      if (!total) {
        throw new Error("Cannot execute campaign with no recipients. Please add recipients first.")
      }
    }


      setSubmitting(true)
      try {
      // Step 1: Create the campaign (will be draft by default)
      const templatePayload: any = {
        template: {
          meta_template_id: selectedTemplateData?.id,
          name: selectedTemplateData?.name,
          language: selectedTemplateData?.language,
          category: selectedTemplateData?.category,
          components: selectedTemplateData?.components || [],
        },
        body_params: bodyPlaceholders,
        header_params: headerPlaceholders,
        button_params: [],
      }

      const campaignData: CreateCampaignData = {
        name: campaignName,
        description: campaignDescription,
        organization: organizationId,
        channel: "whatsapp",
        phone_number: appService.phone_number,
        payload: {
          template_name: selectedTemplateData?.name || "",
          template_language: selectedTemplateData?.language || "en",
          header_parameters: headerPlaceholders.map(placeholder => ({
            type: "text",
            text: placeholder
          })),
          body_params: templatePayload.body_params,
          button_params: templatePayload.button_params,
        },
        scheduled_at: scheduledDateTime ? scheduledDateTime.toISOString() : undefined,
      }

      console.log("Creating campaign with data:", campaignData)
      const createdCampaign = await CampaignService.createCampaign(campaignData)

      if (!createdCampaign.whatsapp_campaign_id) {
        throw new Error("Campaign created but no WhatsApp campaign ID returned")
      }

      setCreatedWhatsAppCampaignId(createdCampaign.whatsapp_campaign_id)

      // Step 2: Add recipients with parameters
      const shouldSendHeaderParams = templateHasMediaHeader && (templateRequiresHeaderParams || overrideMedia)

      let recipientData: any = {
        organization_id: organizationId,
      }

      if (audienceType === "manual") {
        // Build recipients array with parameters
        const recipients = selectedContacts.map(contactId => {
          const contact = contacts.find((c: any) => c.id === contactId)
          if (!contact?.phone) {
            return null
          }

          // Determine media URL if template has media header
          const mediaUrl = shouldSendHeaderParams
            ? (mediaUploadMode === "single" ? singleMediaUrl : perRecipientMedia[contactId] || singleMediaUrl)
            : null

          const recipient: any = {
            phone: contact?.phone || '',
            fullname: contact?.fullname || contact?.name || '',
            email: contact?.email || '',
            template_params: {
              header_params: shouldSendHeaderParams && mediaUrl ? [mediaUrl] : [],
              body_params: templateRequiresBodyParams ? Object.values(parameters) : [],
              button_params: []
            }
          }

          return recipient
        }).filter(Boolean)

        recipientData.recipients = recipients
      } else if (audienceType === "segment") {
        // For segments, use tag-based filtering (convert string ID to number)
        const parsed = Number(selectedSegment)
        recipientData.tag_ids = [Number.isFinite(parsed) ? parsed : selectedSegment]

        // Add global parameters
        if (Object.keys(parameters).length > 0 || shouldSendHeaderParams) {
          recipientData.template_params = {
            body_params: templateRequiresBodyParams ? Object.values(parameters) : [],
          }

          if (shouldSendHeaderParams && mediaUploadMode === "single") {
            recipientData.template_params.header_params = [singleMediaUrl]
          }
        }
      } else if (audienceType === "csv") {
        if (!csvData.length) {
          throw new Error("No CSV data found. Please re-upload your file.")
        }

        const sampleRow = csvData[0]
        const phoneKey = Object.keys(sampleRow || {}).find(key => key.toLowerCase().includes("phone")) || Object.keys(sampleRow || {})[0]

        const recipients = csvData
          .map((row) => {
            const rawPhone = phoneKey ? row[phoneKey] : ""
            const phone = typeof rawPhone === "string" ? rawPhone.replace(/[^\d+]/g, "") : ""
            if (!phone) return null

            const bodyParams = Object.values(parameters)
            const headerParams = shouldSendHeaderParams && mediaUploadMode === "single" && singleMediaUrl
              ? [singleMediaUrl]
              : []

            const recipient: any = {
              phone,
              fullname: row.fullname || row.name || "",
              email: row.email || "",
              template_params: {
                header_params: shouldSendHeaderParams ? headerParams : [],
                body_params: templateRequiresBodyParams ? bodyParams : [],
                button_params: []
              }
            }

            return recipient
          })
          .filter(Boolean)

        if (recipients.length === 0) {
          throw new Error("No valid phone numbers found in the CSV file.")
        }

        recipientData.recipients = recipients
      }

      console.log("Adding recipients:", recipientData)
      await CampaignService.addWhatsAppCampaignRecipients(
        createdCampaign.whatsapp_campaign_id,
        organizationId,
        recipientData
      )

      await ensureRecipientsExist(createdCampaign.whatsapp_campaign_id)
      await loadPreviewMessages(3, createdCampaign.whatsapp_campaign_id)

      // Step 3: Execute or schedule based on launch option
      if (launchOption === "immediate") {
        console.log("Executing campaign immediately")
        await CampaignService.executeWhatsAppCampaign(
          createdCampaign.whatsapp_campaign_id,
          organizationId,
          true
        )
        toast.success("Campaign launched successfully!")
      } else if (launchOption === "scheduled") {
        if (!scheduledDateTime) {
          throw new Error("Scheduled time is missing")
        }
        console.log("Scheduling campaign for:", scheduledDateTime.toISOString())
        await CampaignService.executeWhatsAppCampaign(
          createdCampaign.whatsapp_campaign_id,
          organizationId,
          false,
          scheduledDateTime.toISOString()
        )
        toast.success(`Campaign scheduled for ${scheduledDate} at ${scheduledTime}`)
      } else {
        // Draft - just save, don't execute
        toast.success("Campaign saved as draft")
      }

      invalidateCampaignQueries()
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error creating campaign:", error)
      toast.error(error.message || "Failed to create campaign")
    } finally {
      setSubmitting(false)
    }
  }

  const loadPreviewMessages = async (limit = 3, whatsappCampaignId?: string) => {
    const campaignId = whatsappCampaignId || createdWhatsAppCampaignId
    if (!campaignId || !organizationId) {
      setPreviewMessages([])
      setPreviewError("Create the WhatsApp campaign and add recipients to see a preview.")
      setPreviewUpdatedAt(null)
      return
    }

    setPreviewLoading(true)
    try {
      const data = await CampaignService.previewWhatsAppCampaignMessages(
        campaignId,
        organizationId,
        limit
      )

      const fetchedPreviews = Array.isArray(data.previews) ? data.previews : []
      setPreviewMessages(fetchedPreviews)
      setPreviewError(null)
      setPreviewUpdatedAt(new Date().toISOString())
    } catch (error) {
      console.error("Error loading campaign preview:", error)
      const message = error instanceof Error ? error.message : "Failed to fetch campaign preview"
      setPreviewError(message)
      toast.error(message)
    } finally {
      setPreviewLoading(false)
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const stepLabels = {
            details: "Details",
            template: "Template",
            audience: "Audience",
            schedule: "Launch",
            review: "Review",
          }

          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : isCurrent
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {stepLabels[step]}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-16 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Create Campaign</DialogTitle>
              <DialogDescription>
                Follow the steps to create and launch your campaign
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-shrink-0">
          {renderStepIndicator()}
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-1 -mx-1">

        {/* Step 1: Campaign Details */}
        {currentStep === "details" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Campaign Details
                </CardTitle>
                <CardDescription>
                  Give your campaign a name and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Campaign Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Black Friday Promotion 2025"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this campaign about?"
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Channel: <strong>WhatsApp</strong> via {appService?.phone_number}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {currentStep === "template" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Select Template
                </CardTitle>
                <CardDescription>
                  Choose an approved WhatsApp template for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templatesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Loading templates...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">No templates found</p>
                      <p>Please create and get WhatsApp templates approved first.</p>
                    </AlertDescription>
                  </Alert>
                ) : approvedTemplates.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">No approved templates</p>
                      <p>You have {templates.length} template(s), but none are approved yet.</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                    <div className="grid gap-3">
                      {approvedTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all ${
                            selectedTemplate === template.id
                              ? "border-blue-500 border-2 bg-blue-50"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{template.name}</CardTitle>
                                <CardDescription className="mt-1">
                                  {template.category} • {template.language}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {template.status}
                              </Badge>
                              {selectedTemplate === template.id && (
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    </div>
                  </div>
                )}

                {/* Media Upload Section */}
                {selectedTemplate && templateHasMediaHeader && (
                  <div className="mt-4 space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-orange-500" />
                      <Label className="text-base font-semibold">
                        {mediaHeaderType} Upload Required
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      By default, the template&apos;s approved media will be used. Turn on override to send a different file.
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="override-media"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={overrideMedia}
                        onChange={(e) => {
                          setOverrideMedia(e.target.checked)
                          if (!e.target.checked) {
                            setSingleMediaUrl("")
                            setSingleMediaFile(null)
                            setMediaUploadMode("single")
                          }
                        }}
                      />
                      <Label htmlFor="override-media" className="cursor-pointer">
                        Override template media for this campaign
                      </Label>
                    </div>

                    {overrideMedia && (
                      <>
                        <RadioGroup value={mediaUploadMode} onValueChange={(value: any) => setMediaUploadMode(value)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="single" id="single-media" />
                            <Label htmlFor="single-media" className="cursor-pointer">
                              Use the same {mediaHeaderType?.toLowerCase()} for all recipients
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="per_recipient" id="per-recipient-media" />
                            <Label htmlFor="per-recipient-media" className="cursor-pointer">
                              Use different {mediaHeaderType?.toLowerCase()} per recipient
                            </Label>
                          </div>
                        </RadioGroup>

                        {mediaUploadMode === "single" && (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              {mediaHeaderType} File <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => mediaFileInputRef.current?.click()}
                                disabled={isUploadingMedia}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {singleMediaFile ? "Replace File" : "Upload File"}
                              </Button>
                              {singleMediaFile && (
                                <span className="text-sm text-muted-foreground truncate">
                                  {singleMediaFile.name}
                                </span>
                              )}
                            </div>
                            <input
                              ref={mediaFileInputRef}
                              type="file"
                              accept={getAcceptForMediaHeader()}
                              className="hidden"
                              onChange={handleSingleMediaFile}
                            />
                            <Input
                              id="media-url"
                              type="text"
                              placeholder="Or paste an existing media URL or handle"
                              value={singleMediaUrl}
                              onChange={(e) => setSingleMediaUrl(e.target.value)}
                              disabled={isUploadingMedia}
                            />
                            <p className="text-xs text-muted-foreground">
                              You can upload once to get a Meta media handle, or paste an existing handle/URL.
                            </p>
                          </div>
                        )}

                        {mediaUploadMode === "per_recipient" && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              You&apos;ll be able to specify a {mediaHeaderType?.toLowerCase()} URL for each recipient in the next step
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Parameter Inputs */}
                {selectedTemplate && !templateHasMediaHeader && (
                  <div className="mt-4 space-y-3 pt-4 border-t">
                    <Label>Template Parameters</Label>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="param1" className="text-sm">Customer Name</Label>
                        <Input
                          id="param1"
                          placeholder="e.g., {{1}}"
                          value={parameters.name || ""}
                          onChange={(e) => setParameters({ ...parameters, name: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Audience Selection */}
        {currentStep === "audience" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Select Audience
                </CardTitle>
                <CardDescription>
                  Choose who will receive this campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={audienceType} onValueChange={(value: any) => setAudienceType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="segment" id="segment" />
                    <Label htmlFor="segment" className="cursor-pointer">
                      Use Saved Segment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="cursor-pointer">
                      Select Contacts Manually
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="cursor-pointer">
                      Import from CSV
                    </Label>
                  </div>
                </RadioGroup>

                {templateHasMediaHeader && mediaUploadMode === "per_recipient" && audienceType !== "manual" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Per-recipient media requires manual contact selection. Switch audience to Manual or change the media option to use a single file for everyone.
                    </AlertDescription>
                  </Alert>
                )}

                {audienceType === "segment" && (
                  <div className="space-y-2 pt-2">
                    <Label>Choose Tag/Segment</Label>
                    <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
                      <SelectContent>
                        {tagsLoading ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading tags...
                          </div>
                        ) : tags.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No tags found. Create tags first.
                          </div>
                        ) : (
                          tags.map((tag: any) => (
                            <SelectItem key={tag.id} value={tag.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{tag.name}</span>
                                {tag.contact_count !== undefined && (
                                  <Badge variant="secondary" className="ml-2">
                                    {tag.contact_count.toLocaleString()} contacts
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                    {selectedSegmentData && (
                      <Alert className="mt-3">
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          {selectedSegmentData.contact_count !== undefined ? (
                            <>
                              <strong>{selectedSegmentData.contact_count.toLocaleString()}</strong> contacts in &quot;{selectedSegmentData.name}&quot;
                            </>
                          ) : (
                            <>Tag: <strong>{selectedSegmentData.name}</strong></>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {audienceType === "manual" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Contacts</Label>
                      <Badge variant="secondary">
                        {selectedContacts.length} selected
                      </Badge>
                    </div>

                    <Input
                      placeholder="Search contacts by name or phone..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                    />

                    <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                      {contactsLoading ? (
                        <div className="p-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading contacts...</p>
                        </div>
                      ) : filteredContacts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          {contactSearch ? "No contacts match your search" : "No contacts found"}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredContacts.map((contact: any) => (
                            <div
                              key={contact.id}
                              className="p-3 space-y-2"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedContacts.includes(contact.id)}
                                  onChange={() => toggleContact(contact.id)}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{contact.fullname || contact.name || "Unknown"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {contact.phone || "No phone"} {contact.email && `• ${contact.email}`}
                                  </p>
                                </div>
                              </div>

                              {/* Per-recipient media URL input */}
                              {selectedContacts.includes(contact.id) &&
                               templateHasMediaHeader &&
                               mediaUploadMode === "per_recipient" && (
                                <div className="ml-7 space-y-1">
                                  <Label htmlFor={`media-${contact.id}`} className="text-xs">
                                    {mediaHeaderType} URL for this contact <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`media-${contact.id}`}
                                    type="url"
                                    placeholder={`https://example.com/${mediaHeaderType?.toLowerCase()}.jpg`}
                                    value={perRecipientMedia[contact.id] || ""}
                                    onChange={(e) => handleMediaUrlChange(contact.id, e.target.value)}
                                    className="h-9 text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedContacts.length > 0 && (
                      <Alert>
                        <Users className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{selectedContacts.length}</strong> contact(s) selected
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {audienceType === "csv" && (
                  <div className="space-y-3 pt-2">
                    <Label>Upload CSV File</Label>

                    {!csvFile ? (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="font-medium">Click to upload CSV</p>
                            <p className="text-sm text-muted-foreground">
                              CSV file with contact information
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Alert>
                          <FileText className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{csvFile.name}</p>
                                <p className="text-sm">
                                  {csvContactCount} contact(s) found
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCsvFile(null)
                                  setCsvData([])
                                  setCsvContactCount(0)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>

                        {csvData.length > 0 && (
                          <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                            <p className="text-sm font-medium mb-2">Preview:</p>
                            <div className="space-y-1">
                              {csvData.slice(0, 5).map((row, index) => (
                                <div key={index} className="text-sm text-muted-foreground">
                                  {Object.values(row).join(', ')}
                                </div>
                              ))}
                              {csvData.length > 5 && (
                                <p className="text-sm text-muted-foreground italic">
                                  ... and {csvData.length - 5} more
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
          </Card>
        </div>
      )}

      {selectedTemplate && (
        <Card className="border-border/60 bg-muted/30">
          <CardHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">WhatsApp Preview</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadPreviewMessages()}
                disabled={previewLoading || !createdWhatsAppCampaignId}
              >
                {previewLoading ? "Refreshing..." : "Refresh preview"}
              </Button>
            </div>
            <CardDescription className="text-xs">
              See how your template renders for the latest recipients.
              {previewUpdatedAt && (
                <> Updated {new Date(previewUpdatedAt).toLocaleTimeString()}.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewError && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-xs text-amber-700">
                  {previewError}
                </AlertDescription>
              </Alert>
            )}

            {previewMessages.length === 0 && !previewLoading && !previewError && (
              <p className="text-xs text-muted-foreground">
                Add recipients to the campaign and refresh to view how the template looks for them.
              </p>
            )}

            {previewMessages.map((preview, index) => (
              <Card key={`${preview.recipient?.phone || index}-${index}`} className="bg-white border">
                <CardContent className="p-3 space-y-2">
                  <div className="text-xs text-muted-foreground">Recipient</div>
                  <div className="text-sm font-semibold">
                    {preview.recipient?.fullname || preview.recipient?.phone || `Recipient ${index + 1}`}
                  </div>
                  {preview.recipient?.phone && (
                    <div className="text-xs text-muted-foreground">{preview.recipient.phone}</div>
                  )}
                  <div className="border-t border-border/30 pt-2">
                    <div className="text-xs text-muted-foreground">Message preview</div>
                    <p className="text-sm whitespace-pre-wrap">
                      {preview.message?.formatted_preview || preview.message?.body || "Preview unavailable"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Launch Options */}
        {currentStep === "schedule" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-green-500" />
                  Launch Options
                </CardTitle>
                <CardDescription>
                  Choose when to launch your campaign (required before review)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {/* Save as Draft */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      launchOption === "draft"
                        ? "border-blue-500 border-2 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setLaunchOption("draft")}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <Save className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">Save as Draft</CardTitle>
                          <CardDescription>
                            Save campaign without sending. Launch it later from the campaigns page.
                          </CardDescription>
                        </div>
                        {launchOption === "draft" && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Launch Immediately */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      launchOption === "immediate"
                        ? "border-blue-500 border-2 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setLaunchOption("immediate")}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                          <Send className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">Launch Immediately</CardTitle>
                          <CardDescription>
                            Start sending messages right away
                          </CardDescription>
                        </div>
                        {launchOption === "immediate" && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Schedule for Later */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      launchOption === "scheduled"
                        ? "border-blue-500 border-2 bg-blue-50"
                        : "hover:border-gray-300"
                    }`}
                    onClick={() => setLaunchOption("scheduled")}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">Schedule for Later</CardTitle>
                          <CardDescription>
                            Choose a specific date and time to launch
                          </CardDescription>
                        </div>
                        {launchOption === "scheduled" && (
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </CardHeader>

                    {launchOption === "scheduled" && (
                      <CardContent className="space-y-3 pt-0">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="date">
                              Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="date"
                              type="date"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time">
                              Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="time"
                              type="time"
                              value={scheduledTime}
                              onChange={(e) => setScheduledTime(e.target.value)}
                            />
                          </div>
                        </div>

                        {scheduledDate && scheduledTime && (
                          <Alert>
                            <Calendar className="h-4 w-4" />
                            <AlertDescription>
                              Campaign will launch on <strong>{scheduledDate}</strong> at <strong>{scheduledTime}</strong>
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </div>

                {!launchOption && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Select a launch option to continue to review.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === "review" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  Review Campaign
                </CardTitle>
                <CardDescription>
                  Review your campaign details before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Campaign Name</span>
                    <span className="text-sm font-medium">{campaignName}</span>
                  </div>

                  {campaignDescription && (
                    <div className="flex items-start justify-between border-b pb-2">
                      <span className="text-sm font-medium text-muted-foreground">Description</span>
                      <span className="text-sm font-medium max-w-xs text-right">{campaignDescription}</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between border-b pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Template</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{selectedTemplateData?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedTemplateData?.category} • {selectedTemplateData?.language}
                      </p>
                    </div>
                  </div>

                  {templateHasMediaHeader && (
                    <div className="flex items-start justify-between border-b pb-2">
                      <span className="text-sm font-medium text-muted-foreground">Media</span>
                      <span className="text-sm font-medium">
                        {mediaUploadMode === "single"
                          ? `Single ${mediaHeaderType} for all`
                          : `Different ${mediaHeaderType} per recipient`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between border-b pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Audience</span>
                    <span className="text-sm font-medium">
                      {audienceType === "segment" && selectedSegmentData
                        ? `${selectedSegmentData.name}${selectedSegmentData.contact_count !== undefined ? ` (${selectedSegmentData.contact_count} contacts)` : ''}`
                        : audienceType === "manual"
                        ? `Manual Selection (${selectedContacts.length} contacts)`
                        : audienceType === "csv"
                        ? `CSV Import (${csvContactCount} contacts)`
                        : "Not selected"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between border-b pb-2">
                    <span className="text-sm font-medium text-muted-foreground">Launch</span>
                    <span className="text-sm font-medium">
                      {launchOption === "draft"
                        ? "Save as Draft"
                        : launchOption === "immediate"
                        ? "Launch Immediately"
                        : launchOption === "scheduled"
                        ? (scheduledDate && scheduledTime
                          ? `Schedule: ${scheduledDate} at ${scheduledTime}`
                          : "Schedule: date/time missing")
                        : "Not selected"}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Estimated Recipients</span>
                    <span className="text-sm font-medium">
                      {selectedSegmentData
                        ? (selectedSegmentData.contact_count !== undefined ? selectedSegmentData.contact_count : "Unknown")
                        : audienceType === "manual"
                        ? selectedContacts.length
                        : csvContactCount}
                    </span>
                  </div>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {launchOption
                      ? <>Everything looks good! Click &quot;{launchOption === "draft" ? "Save Campaign" : launchOption === "immediate" ? "Launch Campaign" : "Schedule Campaign"}&quot; to finalize.</>
                      : "Choose a launch option to finish."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}
        </div>

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>

            {currentStepIndex < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !launchOption ||
                  (launchOption === "scheduled" && (!scheduledDate || !scheduledTime))
                }
              >
                {submitting ? (
                  "Processing..."
                ) : (
                  <>
                    {launchOption === "draft" && <Save className="mr-2 h-4 w-4" />}
                    {launchOption === "immediate" && <Send className="mr-2 h-4 w-4" />}
                    {launchOption === "scheduled" && <Clock className="mr-2 h-4 w-4" />}
                    {!launchOption
                      ? "Select Launch Option"
                      : launchOption === "draft"
                      ? "Save Campaign"
                      : launchOption === "immediate"
                      ? "Launch Campaign"
                      : "Schedule Campaign"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
