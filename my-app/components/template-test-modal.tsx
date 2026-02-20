"use client"

import Image from "next/image"
import { useEffect, useRef, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Phone,
  MoreVertical,
  Info,
  Bot,
  Save,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useOrganization } from "@clerk/nextjs"
import { ChatbotAutomationService, TemplateButtonFlowMapping } from "@/services/chatbot-automation"
import { ChatbotAutomation } from "@/types/chatbot-automation"

import { logger } from "@/lib/logger";
interface TemplateTestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: any
  appService?: any
  organizationId?: string | null
}

interface LocationData {
  latitude: string
  longitude: string
  name: string
  address: string
}

type HeaderFormat = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION"

const getPlaceholderPattern = () => /\{\{\s*([^{}]+?)\s*\}\}/g

const ACCEPTED_FORMATS: Record<"IMAGE" | "VIDEO" | "DOCUMENT", string> = {
  IMAGE: "image/jpeg,image/png",
  VIDEO: "video/mp4",
  DOCUMENT: "application/pdf",
}

// Carousel card media state
interface CarouselCardMedia {
  file: File | null
  handle: string
  id: string
  previewUrl: string
  isUploading: boolean
  templateHandle: string // existing handle from template
}

export function TemplateTestModal({
  open,
  onOpenChange,
  template,
  appService,
  organizationId,
}: TemplateTestModalProps) {
  const { toast } = useToast()
  const { organization } = useOrganization()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null)
  const [headerMediaHandle, setHeaderMediaHandle] = useState("")
  const [headerMediaId, setHeaderMediaId] = useState("")
  const [templateMediaHandle, setTemplateMediaHandle] = useState("")
  const [headerMediaPreviewUrl, setHeaderMediaPreviewUrl] = useState("")
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [headerPlaceholders, setHeaderPlaceholders] = useState<string[]>([])
  const [bodyPlaceholders, setBodyPlaceholders] = useState<string[]>([])
  const [buttonPlaceholders, setButtonPlaceholders] = useState<string[]>([])
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: "",
    longitude: "",
    name: "",
    address: "",
  })

  // Carousel state
  const [carouselCardMedia, setCarouselCardMedia] = useState<CarouselCardMedia[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const carouselFileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Flow mapping states
  const [chatbotFlows, setChatbotFlows] = useState<ChatbotAutomation[]>([])
  const [flowMappings, setFlowMappings] = useState<Record<number, string>>({})
  const [loadingFlows, setLoadingFlows] = useState(false)
  const [savingMappings, setSavingMappings] = useState(false)
  const [hasFlowChanges, setHasFlowChanges] = useState(false)

  const headerComponent = template?.components?.find((c: any) => c.type === "HEADER")
  const bodyComponent = template?.components?.find((c: any) => c.type === "BODY")
  const footerComponent = template?.components?.find((c: any) => c.type === "FOOTER")
  const buttonsComponent = template?.components?.find((c: any) => c.type === "BUTTONS")
  const carouselComponent = template?.components?.find((c: any) => c.type === "CAROUSEL")

  // Carousel detection
  const isCarouselTemplate = !!carouselComponent
  const carouselCards = carouselComponent?.cards || []

  // Get quick reply buttons only (these are the ones that can trigger flows)
  // For carousel templates, buttons are inside each card's components
  const getCarouselButtons = () => {
    if (!isCarouselTemplate || !carouselCards.length) return []
    // Get buttons from the first card (all cards should have same structure)
    const firstCard = carouselCards[0]
    const cardButtonsComponent = firstCard?.components?.find((c: any) => c.type === "BUTTONS")
    return cardButtonsComponent?.buttons || []
  }

  const carouselButtons = getCarouselButtons()
  const regularButtons = buttonsComponent?.buttons || []
  const allButtons = isCarouselTemplate ? carouselButtons : regularButtons
  const quickReplyButtons = allButtons.filter((b: any) => b.type === "QUICK_REPLY" || b.type === "quick_reply")

  // Fetch chatbot flows and existing mappings
  const fetchFlowsAndMappings = useCallback(async () => {
    const resolvedOrgId = organizationId || organization?.id
    if (!resolvedOrgId || !template?.id || quickReplyButtons.length === 0) return

    setLoadingFlows(true)
    try {
      const [flows, mappings] = await Promise.all([
        ChatbotAutomationService.getChatbots(resolvedOrgId),
        ChatbotAutomationService.getTemplateButtonMappings(template.id, resolvedOrgId)
      ])

      setChatbotFlows(flows.filter(f => f.isActive))

      // Initialize flow mappings from existing data
      const initialMappings: Record<number, string> = {}
      mappings.forEach((m: TemplateButtonFlowMapping) => {
        initialMappings[m.button_index] = m.flow
      })
      setFlowMappings(initialMappings)
      setHasFlowChanges(false)
    } catch (error) {
      logger.error("Error fetching flows and mappings:", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoadingFlows(false)
    }
  }, [organizationId, organization?.id, template?.id, quickReplyButtons.length])

  // Handle flow selection change
  const handleFlowChange = (buttonIndex: number, flowId: string) => {
    setFlowMappings(prev => ({
      ...prev,
      [buttonIndex]: flowId === "none" ? "" : flowId
    }))
    setHasFlowChanges(true)
  }

  // Save flow mappings
  const handleSaveFlowMappings = async () => {
    const resolvedOrgId = organizationId || organization?.id
    if (!resolvedOrgId || !template) return

    setSavingMappings(true)
    try {
      const mappingsToSave = quickReplyButtons.map((button: any, index: number) => ({
        button_text: button.text,
        button_index: index,
        flow: flowMappings[index] || null
      }))

      await ChatbotAutomationService.updateTemplateButtonMappings(
        resolvedOrgId,
        template.id,
        template.name,
        mappingsToSave
      )

      toast({
        title: "Flow mappings saved",
        description: "Quick reply buttons are now linked to chatbot flows.",
      })
      setHasFlowChanges(false)
    } catch (error) {
      logger.error("Error saving flow mappings:", { error: error instanceof Error ? error.message : String(error) })
      toast({
        title: "Failed to save",
        description: "Could not save flow mappings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingMappings(false)
    }
  }

  const headerFormat = ((headerComponent?.format || "TEXT") as string).toUpperCase() as HeaderFormat
  const isMediaHeader = ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerFormat)
  const isLocationHeader = headerFormat === "LOCATION"

  const previewTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  useEffect(() => {
    if (!open || !template) return

    const nextParams: Record<string, string> = {}
    const extractPlaceholders = (text: string) => {
      const pattern = getPlaceholderPattern()
      return Array.from(text.matchAll(pattern)).map((match) => match[1].trim())
    }

    const bodyText = template.components?.find((c: any) => c.type === "BODY")?.text || ""
    const nextBodyPlaceholders = extractPlaceholders(bodyText)
    nextBodyPlaceholders.forEach((_, index) => {
      nextParams[`body_${index + 1}`] = ""
    })

    const header = template.components?.find((c: any) => c.type === "HEADER")
    const nextHeaderPlaceholders: string[] = []
    if (header?.format === "TEXT" && header?.text) {
      nextHeaderPlaceholders.push(...extractPlaceholders(header.text))
      nextHeaderPlaceholders.forEach((_, index) => {
        nextParams[`header_${index + 1}`] = ""
      })
    }

    const buttons = template.components?.find((c: any) => c.type === "BUTTONS")?.buttons || []
    const nextButtonPlaceholders: string[] = []
    buttons.forEach((button: any) => {
      if (button.type === "URL" && button.url?.includes("{{")) {
        nextButtonPlaceholders.push(...extractPlaceholders(button.url))
      }
    })
    nextButtonPlaceholders.forEach((_, index) => {
      nextParams[`button_${index + 1}`] = ""
    })

    setParameters(nextParams)
    setHeaderPlaceholders(nextHeaderPlaceholders)
    setBodyPlaceholders(nextBodyPlaceholders)
    setButtonPlaceholders(nextButtonPlaceholders)
    setTestResult(null)
    setPhoneNumber("")
    setHeaderMediaFile(null)
    setHeaderMediaHandle("")
    setHeaderMediaId("")
    setTemplateMediaHandle("")
    setHeaderMediaPreviewUrl("")
    setLocationData({
      latitude: "",
      longitude: "",
      name: "",
      address: "",
    })

    const exampleHandle = header?.example?.header_handle?.[0]
    setTemplateMediaHandle(exampleHandle || "")

    // Initialize carousel card media state
    const carousel = template.components?.find((c: any) => c.type === "CAROUSEL")
    if (carousel?.cards) {
      const initialCarouselMedia: CarouselCardMedia[] = carousel.cards.map((card: any, index: number) => {
        const cardHeader = card.components?.find((c: any) => c.type === "HEADER")
        const existingHandle = cardHeader?.example?.header_handle?.[0] || ""
        return {
          file: null,
          handle: "",
          id: "",
          previewUrl: "",
          isUploading: false,
          templateHandle: existingHandle,
        }
      })
      setCarouselCardMedia(initialCarouselMedia)
      carouselFileInputRefs.current = new Array(carousel.cards.length).fill(null)
    } else {
      setCarouselCardMedia([])
    }

    // Fetch flows for quick reply button mapping
    fetchFlowsAndMappings()
  }, [open, template, fetchFlowsAndMappings])

  useEffect(() => {
    return () => {
      if (headerMediaPreviewUrl) {
        URL.revokeObjectURL(headerMediaPreviewUrl)
      }
    }
  }, [headerMediaPreviewUrl])

  const getParamKeys = (prefix: string, count: number) => {
    return Array.from({ length: count }, (_, index) => `${prefix}_${index + 1}`)
  }

  const getParamValues = (prefix: string, placeholders: string[]) => {
    return getParamKeys(prefix, placeholders.length).map((key) => parameters[key] || "")
  }

  const updateParam = (key: string, value: string) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }

  const headerParamValues = getParamValues("header", headerPlaceholders)
  const bodyParamValues = getParamValues("body", bodyPlaceholders)
  const buttonParamValues = getParamValues("button", buttonPlaceholders)

  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  const normalizedPhone = phoneNumber.replace(/\s/g, "")
  const isPhoneValid = normalizedPhone.length > 0 && phoneRegex.test(normalizedPhone)

  const missingHeaderParams =
    !isMediaHeader && !isLocationHeader && headerParamValues.some((value) => !value.trim())
  const missingBodyParams = bodyParamValues.some((value) => !value.trim())
  const missingButtonParams = buttonParamValues.some((value) => !value.trim())
  const missingParams = missingHeaderParams || missingBodyParams || missingButtonParams

  const effectiveMediaId = headerMediaId || headerMediaHandle || templateMediaHandle
  const missingMedia = isMediaHeader && !effectiveMediaId
  const missingLocation =
    isLocationHeader &&
    (!locationData.latitude.trim() ||
      !locationData.longitude.trim() ||
      !locationData.name.trim() ||
      !locationData.address.trim())

  // Carousel validation
  const isAnyCarouselCardUploading = carouselCardMedia.some(card => card.isUploading)
  const missingCarouselMedia = isCarouselTemplate && carouselCardMedia.some(card => {
    const effectiveId = card.id || card.handle || card.templateHandle
    return !effectiveId
  })

  const sendDisabled =
    sending || isUploadingMedia || isAnyCarouselCardUploading || !isPhoneValid || missingParams || missingMedia || missingLocation || missingCarouselMedia

  const replacePlaceholders = (text: string, prefix: "header" | "body") => {
    let index = 0
    const pattern = getPlaceholderPattern()
    return text.replace(pattern, (_match, token) => {
      const key = `${prefix}_${index + 1}`
      const value = parameters[key]
      const label = token?.trim() || `${prefix} ${index + 1}`
      index += 1
      return value?.trim() ? value : `[${label}]`
    })
  }

  const uploadMediaToMeta = async (file: File): Promise<{ handle: string; id?: string }> => {
    if (!appService) {
      throw new Error("Please select a WhatsApp number before uploading media")
    }

    const resolvedOrg =
      organizationId ||
      organization?.id ||
      appService?.organizationId ||
      appService?.organization_id

    if (!resolvedOrg) {
      throw new Error("Organization is required to upload media")
    }

    setIsUploadingMedia(true)

    try {
      const formData = new FormData()
      formData.append("media_file", file)
      formData.append("appservice_phone_number", appService.phone_number)
      formData.append("upload_type", "media")
      if (appService.phone_number_id) {
        formData.append("phone_number_id", appService.phone_number_id)
      }
      if (appService.id) {
        formData.append("appservice_id", String(appService.id))
      }
      formData.append("organization", resolvedOrg)

      const response = await fetch("/api/whatsapp/templates/upload_media", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { error: errorText }
        }
        throw new Error(error.error || "Failed to upload media")
      }

      const data = await response.json()
      if (!data.handle && !data.id) {
        throw new Error("No media handle received from upload")
      }

      return { handle: data.id || data.handle, id: data.id }
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setHeaderMediaFile(file)

    if (headerMediaPreviewUrl) {
      URL.revokeObjectURL(headerMediaPreviewUrl)
    }

    if (headerFormat === "IMAGE" || headerFormat === "VIDEO") {
      setHeaderMediaPreviewUrl(URL.createObjectURL(file))
    } else {
      setHeaderMediaPreviewUrl("")
    }

    try {
      const { handle, id } = await uploadMediaToMeta(file)
      setHeaderMediaHandle(handle)
      setHeaderMediaId(id || handle)
      toast({
        title: "Media uploaded",
        description: "Your header media is ready to send.",
      })
    } catch (error: any) {
      logger.error("File upload error:", { error: error instanceof Error ? error.message : String(error) })
      toast({
        title: "Upload failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
      setHeaderMediaFile(null)
      setHeaderMediaHandle("")
      setHeaderMediaId("")
      setHeaderMediaPreviewUrl("")
    }
  }

  // Handle carousel card file upload
  const handleCarouselFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, cardIndex: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Update card state to show uploading
    setCarouselCardMedia(prev => {
      const updated = [...prev]
      if (updated[cardIndex]) {
        if (updated[cardIndex].previewUrl) {
          URL.revokeObjectURL(updated[cardIndex].previewUrl)
        }
        updated[cardIndex] = {
          ...updated[cardIndex],
          file,
          previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
          isUploading: true,
        }
      }
      return updated
    })

    try {
      const { handle, id } = await uploadMediaToMeta(file)
      setCarouselCardMedia(prev => {
        const updated = [...prev]
        if (updated[cardIndex]) {
          updated[cardIndex] = {
            ...updated[cardIndex],
            handle,
            id: id || handle,
            isUploading: false,
          }
        }
        return updated
      })
      toast({
        title: "Media uploaded",
        description: `Card ${cardIndex + 1} image is ready to send.`,
      })
    } catch (error: any) {
      logger.error("Carousel file upload error:", { error: error instanceof Error ? error.message : String(error) })
      toast({
        title: "Upload failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
      setCarouselCardMedia(prev => {
        const updated = [...prev]
        if (updated[cardIndex]) {
          if (updated[cardIndex].previewUrl) {
            URL.revokeObjectURL(updated[cardIndex].previewUrl)
          }
          updated[cardIndex] = {
            ...updated[cardIndex],
            file: null,
            handle: "",
            id: "",
            previewUrl: "",
            isUploading: false,
          }
        }
        return updated
      })
    }
  }

  const validateLocationData = (): boolean => {
    if (!locationData.latitude.trim()) {
      toast({ title: "Latitude required", variant: "destructive" })
      return false
    }
    if (!locationData.longitude.trim()) {
      toast({ title: "Longitude required", variant: "destructive" })
      return false
    }
    if (!locationData.name.trim()) {
      toast({ title: "Location name required", variant: "destructive" })
      return false
    }
    if (!locationData.address.trim()) {
      toast({ title: "Address required", variant: "destructive" })
      return false
    }

    const lat = Number(locationData.latitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      toast({ title: "Latitude must be between -90 and 90", variant: "destructive" })
      return false
    }
    const lng = Number(locationData.longitude)
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      toast({ title: "Longitude must be between -180 and 180", variant: "destructive" })
      return false
    }

    return true
  }

  const handleSendTest = async () => {
    if (!template) return

    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to send the test",
        variant: "destructive",
      })
      return
    }

    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number with country code",
        variant: "destructive",
      })
      return
    }

    const resolvedOrgId = organizationId || organization?.id
    if (!resolvedOrgId) {
      toast({
        title: "Organization required",
        description: "Please ensure you're in an organization context",
        variant: "destructive",
      })
      return
    }

    if (!isMediaHeader && !isLocationHeader && headerParamValues.some((value) => !value.trim())) {
      toast({
        title: "Header parameters required",
        description: "Please fill in all header values",
        variant: "destructive",
      })
      return
    }

    if (bodyParamValues.some((value) => !value.trim())) {
      toast({
        title: "Body parameters required",
        description: "Please fill in all body values",
        variant: "destructive",
      })
      return
    }

    if (buttonParamValues.some((value) => !value.trim())) {
      toast({
        title: "Button parameters required",
        description: "Please fill in all button values",
        variant: "destructive",
      })
      return
    }

    if (isLocationHeader && !validateLocationData()) {
      return
    }

    if (isMediaHeader && !effectiveMediaId) {
      toast({
        title: "Header media required",
        description: "Upload a header file before sending this template",
        variant: "destructive",
      })
      return
    }

    // Validate carousel media
    if (isCarouselTemplate) {
      const missingCardIndex = carouselCardMedia.findIndex(card => {
        const effectiveId = card.id || card.handle || card.templateHandle
        return !effectiveId
      })
      if (missingCardIndex !== -1) {
        toast({
          title: "Carousel media required",
          description: `Upload an image for Card ${missingCardIndex + 1}`,
          variant: "destructive",
        })
        return
      }
    }

    setSending(true)
    setTestResult(null)

    try {
      // Prepare carousel media IDs if applicable
      const carouselMediaIds = isCarouselTemplate
        ? carouselCardMedia.map(card => card.id || card.handle || card.templateHandle)
        : undefined

      const response = await fetch(`/api/whatsapp/templates/${template.id}/send_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: resolvedOrgId,
          phone_number: phoneNumber.replace(/\s/g, ""),
          template_name: template.name,
          template_language: template.language,
          header_format: headerFormat.toLowerCase(),
          header_params: isMediaHeader || isLocationHeader ? [] : headerParamValues,
          body_params: bodyParamValues,
          button_params: buttonParamValues,
          location: isLocationHeader ? locationData : undefined,
          header_media_id: isMediaHeader ? effectiveMediaId : undefined,
          carousel_card_media_ids: carouselMediaIds,
          is_carousel: isCarouselTemplate,
          appservice_id: appService?.id,
          appservice_phone_number: appService?.phone_number,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to send test")
      }

      setTestResult("success")
      toast({
        title: "Test sent successfully",
        description: `Template sent to ${phoneNumber}`,
      })

      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (error: any) {
      logger.error("Error sending test:", { error: error instanceof Error ? error.message : String(error) })
      setTestResult("error")
      toast({
        title: "Failed to send test",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const previewBody = bodyComponent?.text
    ? replacePlaceholders(bodyComponent.text, "body")
    : "Your message preview will appear here."

  const previewHeaderText =
    headerComponent?.format === "TEXT" && headerComponent?.text
      ? replacePlaceholders(headerComponent.text, "header")
      : ""

  const previewButtons =
    buttonsComponent?.buttons?.map((button: any) => button.text || button.url || "Button") || []

  const renderHeaderPreview = () => {
    if (isLocationHeader) {
      return (
        <div className="mb-2 overflow-hidden rounded-md bg-white/70">
          <div className="relative h-28 w-full bg-gradient-to-br from-emerald-100 to-emerald-200">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 text-[11px] text-emerald-700 shadow-sm">
              <MapPin className="h-3 w-3" />
              <span>{locationData.name || "Location name"}</span>
            </div>
          </div>
          <div className="px-2 py-2 text-[11px] text-gray-700">
            <div className="font-semibold">{locationData.name || "Location name"}</div>
            <div className="text-gray-500">{locationData.address || "Address details"}</div>
          </div>
        </div>
      )
    }

    if (!isMediaHeader && previewHeaderText) {
      return <div className="mb-2 text-sm font-semibold text-gray-900">{previewHeaderText}</div>
    }

    if (!isMediaHeader) return null

    if (headerFormat === "IMAGE") {
      return (
        <div className="mb-2 overflow-hidden rounded-md bg-white/70">
          {headerMediaPreviewUrl ? (
            <Image src={headerMediaPreviewUrl} alt="Header preview" width={600} height={128} className="h-32 w-full object-cover" />
          ) : (
            <div className="flex h-32 w-full items-center justify-center bg-emerald-50 text-emerald-700">
              <ImageIcon className="h-6 w-6" />
              <span className="ml-2 text-xs">Image header</span>
            </div>
          )}
        </div>
      )
    }

    if (headerFormat === "VIDEO") {
      return (
        <div className="mb-2 overflow-hidden rounded-md bg-white/70">
          {headerMediaPreviewUrl ? (
            <video className="h-32 w-full object-cover" muted preload="metadata">
              <source src={headerMediaPreviewUrl} />
            </video>
          ) : (
            <div className="flex h-32 w-full items-center justify-center bg-emerald-50 text-emerald-700">
              <Video className="h-6 w-6" />
              <span className="ml-2 text-xs">Video header</span>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="mb-2 flex items-center gap-2 rounded-md bg-white/70 px-3 py-2 text-xs text-gray-700">
        <FileText className="h-4 w-4 text-emerald-700" />
        <div className="flex-1">
          <div className="font-semibold">{headerMediaFile?.name || "Document header"}</div>
          <div className="text-[10px] text-gray-500">PDF document</div>
        </div>
      </div>
    )
  }

  const renderParamsSection = (title: string, prefix: string, placeholders: string[]) => {
    const keys = getParamKeys(prefix, placeholders.length)
    if (!keys.length) return null

    return (
      <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
        <div className="text-sm font-semibold">{title}</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {keys.map((key, index) => {
            const placeholder = placeholders[index]?.trim()
            const label = placeholder ? `{{${placeholder}}}` : `{{${index + 1}}}`
            return (
              <div key={key} className="space-y-1">
              <Label htmlFor={key} className="text-xs text-muted-foreground">
                {label}
              </Label>
              <Input
                id={key}
                value={parameters[key]}
                onChange={(e) => updateParam(key, e.target.value)}
                placeholder={`Enter ${label}`}
                disabled={sending}
                className={
                  missingParams && !parameters[key]?.trim()
                    ? "border-red-200 focus-visible:ring-red-200"
                    : ""
                }
              />
            </div>
          )})}
        </div>
      </div>
    )
  }

  const headerMediaLabel = (() => {
    switch (headerFormat) {
      case "IMAGE":
        return "Image"
      case "VIDEO":
        return "Video"
      case "DOCUMENT":
        return "Document"
      case "LOCATION":
        return "Location"
      default:
        return "Text"
    }
  })()

  const HeaderMediaIcon = headerFormat === "IMAGE"
    ? ImageIcon
    : headerFormat === "VIDEO"
    ? Video
    : headerFormat === "DOCUMENT"
    ? FileText
    : MapPin

  if (!template) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Template: {template?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {template?.category && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  {template.category}
                </Badge>
              )}
              {template?.status && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {template.status}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Language: {template?.language || "en_US"}
              </span>
            </div>

            <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-slate-50 p-4">
              <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-white shadow-lg">
                <div className="bg-[#0f5f54] text-white">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
                        IH
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Intelli Concierge</div>
                        <div className="text-[10px] opacity-80">online</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <Video className="h-4 w-4" />
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div
                  className="p-4"
                  style={{
                    background: "#e5ddd5",
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-30 7c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zM10 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                  }}
                >
                  <div className="flex justify-end">
                    <div className="relative max-w-[80%]">
                      <div className="rounded-lg bg-[#d9fdd3] shadow-sm">
                        <div className="px-3 pt-2 pb-1 text-[13px] text-[#111b21]">
                          {renderHeaderPreview()}
                          <div className="whitespace-pre-wrap leading-[18px]">{previewBody}</div>
                          {footerComponent?.text && (
                            <div className="mt-2 text-[11px] text-[#667781]">
                              {footerComponent.text}
                            </div>
                          )}
                          {previewButtons.length > 0 && (
                            <div className="mt-3 -mx-3 border-t border-[#c7e7c3] pt-2">
                              {previewButtons.map((button: string, index: number) => (
                                <div
                                  key={`${button}-${index}`}
                                  className="py-2 text-center text-[12px] font-medium text-[#00a5f4]"
                                >
                                  {button}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-[#667781]">
                            <span>{previewTime}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="absolute -right-2 top-0 h-3 w-3"
                        style={{
                          background: "#d9fdd3",
                          clipPath: "polygon(0 0, 100% 0, 0 100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
              <Label htmlFor="phone" className="text-sm">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={sending}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US).{" "}
                {appService?.phone_number ? `Sending from ${appService.phone_number}.` : ""}
              </p>
            </div>

            {renderParamsSection("Header Parameters", "header", headerPlaceholders)}
            {renderParamsSection("Body Parameters", "body", bodyPlaceholders)}
            {renderParamsSection("Button Parameters", "button", buttonPlaceholders)}

            {isMediaHeader && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <HeaderMediaIcon className="h-4 w-4 text-emerald-700" />
                    Header Media ({headerMediaLabel})
                  </div>
                  {templateMediaHandle && !headerMediaFile && !headerMediaHandle && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Using template media
                    </Badge>
                  )}
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  <Info className="h-4 w-4" />
                  <span>Upload a file to satisfy media headers or override stored media.</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FORMATS[headerFormat as "IMAGE" | "VIDEO" | "DOCUMENT"]}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {headerMediaFile ? (
                  <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <HeaderMediaIcon className="h-4 w-4 text-emerald-700" />
                      <span>{headerMediaFile.name}</span>
                      {isUploadingMedia && (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                        </span>
                      )}
                      {!isUploadingMedia && headerMediaHandle && (
                        <span className="text-emerald-700">Ready</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setHeaderMediaFile(null)
                        setHeaderMediaHandle("")
                        setHeaderMediaId("")
                        setHeaderMediaPreviewUrl("")
                      }}
                      disabled={isUploadingMedia}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingMedia}
                  >
                    {isUploadingMedia ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {headerMediaLabel.toLowerCase()}
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Carousel Card Media Upload Section */}
            {isCarouselTemplate && carouselCards.length > 0 && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ImageIcon className="h-4 w-4 text-emerald-700" />
                  Carousel Card Images ({carouselCards.length} cards)
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  <Info className="h-4 w-4" />
                  <span>Each carousel card requires an image. Upload images to override stored media or use existing media if available.</span>
                </div>
                <div className="space-y-3">
                  {carouselCards.map((card: any, cardIndex: number) => {
                    const cardMedia = carouselCardMedia[cardIndex]
                    const cardHeader = card.components?.find((c: any) => c.type === "HEADER")
                    const mediaFormat = cardHeader?.format?.toUpperCase() || "IMAGE"
                    const effectiveId = cardMedia?.id || cardMedia?.handle || cardMedia?.templateHandle
                    const hasMedia = !!effectiveId

                    return (
                      <div key={cardIndex} className="rounded-lg border bg-white p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Card {cardIndex + 1}
                            </Badge>
                            {hasMedia && !cardMedia?.isUploading && (
                              <Badge variant="outline" className="text-xs text-green-600 bg-green-50">
                                Ready
                              </Badge>
                            )}
                            {cardMedia?.templateHandle && !cardMedia?.handle && (
                              <Badge variant="outline" className="text-xs text-blue-600 bg-blue-50">
                                Using template media
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {mediaFormat}
                          </span>
                        </div>

                        {/* Preview if available */}
                        {cardMedia?.previewUrl && (
                          <div className="relative h-20 w-full overflow-hidden rounded-md bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cardMedia.previewUrl}
                              alt={`Card ${cardIndex + 1} preview`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        <input
                          ref={(el) => { carouselFileInputRefs.current[cardIndex] = el }}
                          type="file"
                          accept={ACCEPTED_FORMATS.IMAGE}
                          onChange={(e) => handleCarouselFileUpload(e, cardIndex)}
                          className="hidden"
                        />

                        {cardMedia?.file ? (
                          <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-emerald-700" />
                              <span className="truncate max-w-[120px]">{cardMedia.file.name}</span>
                              {cardMedia.isUploading && (
                                <span className="flex items-center gap-1 text-emerald-700">
                                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading
                                </span>
                              )}
                              {!cardMedia.isUploading && cardMedia.handle && (
                                <span className="text-emerald-700">Uploaded</span>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => {
                                setCarouselCardMedia(prev => {
                                  const updated = [...prev]
                                  if (updated[cardIndex]) {
                                    if (updated[cardIndex].previewUrl) {
                                      URL.revokeObjectURL(updated[cardIndex].previewUrl)
                                    }
                                    updated[cardIndex] = {
                                      ...updated[cardIndex],
                                      file: null,
                                      handle: "",
                                      id: "",
                                      previewUrl: "",
                                    }
                                  }
                                  return updated
                                })
                              }}
                              disabled={cardMedia.isUploading}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => carouselFileInputRefs.current[cardIndex]?.click()}
                            disabled={cardMedia?.isUploading || isUploadingMedia}
                          >
                            {cardMedia?.isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-3 w-3" />
                                {cardMedia?.templateHandle ? "Replace Image" : "Upload Image"}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Flow Mapping for Quick Reply Buttons */}
            {allButtons.length > 0 && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Bot className="h-4 w-4 text-emerald-700" />
                  Button Flow Mapping
                </div>
                {quickReplyButtons.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-2">This template has <strong>{allButtons.length}</strong> button(s), but none are Quick Reply type.</p>
                    <div className="space-y-1">
                      {allButtons.map((btn: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{btn.type}</Badge>
                          <span>{btn.text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-amber-600">
                      Only QUICK_REPLY buttons can trigger chatbot flows. URL/CTA buttons open links instead.
                    </p>
                  </div>
                ) : loadingFlows ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading chatbot flows...
                  </div>
                ) : chatbotFlows.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No active chatbot flows available. Create a flow first to map buttons.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Map quick reply buttons to chatbot flows. When a user clicks the button, the flow triggers.
                    </p>
                    {quickReplyButtons.map((button: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs">
                            {button.text}
                          </Badge>
                        </div>
                        <Select
                          value={flowMappings[index] || "none"}
                          onValueChange={(value) => handleFlowChange(index, value)}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs">
                            <SelectValue placeholder="Select flow" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <span className="text-muted-foreground">No flow</span>
                            </SelectItem>
                            {chatbotFlows.map((flow) => (
                              <SelectItem key={flow.id} value={flow.id}>
                                {flow.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    {hasFlowChanges && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveFlowMappings}
                        disabled={savingMappings}
                        className="w-full"
                      >
                        {savingMappings ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-2" />
                            Save Flow Mappings
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {isLocationHeader && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  Location Details
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="location-name" className="text-xs text-muted-foreground">
                      Location name
                    </Label>
                    <Input
                      id="location-name"
                      value={locationData.name}
                      onChange={(e) => setLocationData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Main Office"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location-address" className="text-xs text-muted-foreground">
                      Address
                    </Label>
                    <Input
                      id="location-address"
                      value={locationData.address}
                      onChange={(e) => setLocationData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="location-latitude" className="text-xs text-muted-foreground">
                        Latitude
                      </Label>
                      <Input
                        id="location-latitude"
                        value={locationData.latitude}
                        onChange={(e) => setLocationData((prev) => ({ ...prev, latitude: e.target.value }))}
                        placeholder="e.g., 37.4421"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="location-longitude" className="text-xs text-muted-foreground">
                        Longitude
                      </Label>
                      <Input
                        id="location-longitude"
                        value={locationData.longitude}
                        onChange={(e) => setLocationData((prev) => ({ ...prev, longitude: e.target.value }))}
                        placeholder="e.g., -122.1616"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {testResult === "success" && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Test message sent successfully.
              </div>
            )}

            {testResult === "error" && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                <XCircle className="h-4 w-4 text-red-600" />
                Failed to send test. Check inputs and try again.
              </div>
            )}

            {(missingParams || missingMedia || missingLocation || missingCarouselMedia || !isPhoneValid) && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <Info className="mt-0.5 h-4 w-4" />
                <div className="space-y-1">
                  <div className="font-semibold">Complete required fields to enable sending</div>
                  {!isPhoneValid && <p>Enter a valid phone number with country code.</p>}
                  {missingParams && <p>Fill in all template parameters.</p>}
                  {missingMedia && <p>Upload header media or use template media.</p>}
                  {missingCarouselMedia && <p>Upload images for all carousel cards.</p>}
                  {missingLocation && <p>Complete location details.</p>}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendTest}
                disabled={sendDisabled}
                className="flex-1"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
