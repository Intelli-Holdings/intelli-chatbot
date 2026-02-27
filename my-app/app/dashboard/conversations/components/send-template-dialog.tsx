"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Loader2, Search, FileText, ImageIcon, Video, File, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { sendTemplateMessage } from "@/app/actions"
import type { WhatsAppTemplate, AppService, TemplateComponent } from "@/services/whatsapp"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SendTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: WhatsAppTemplate[]
  appService: AppService
  customerNumber: string
  phoneNumber: string
  organizationId?: string
  onSend: (templateName: string, templateBody: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract `{{1}}`, `{{name}}`, etc. but NOT empty `{{}}` */
function extractVarPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{\w+\}\}/g)
  return matches ? matches : []
}

/** Replace each placeholder with the corresponding value (or leave as-is) */
function replaceVars(
  text: string,
  placeholders: string[],
  values: Record<string, string>,
): string {
  let result = text
  for (const ph of placeholders) {
    const val = values[ph]
    if (val) {
      result = result.replace(ph, val)
    }
  }
  return result
}

/** Upload a media file via the Media API (non-resumable) and return the media_id */
async function uploadMediaForSending(
  file: File,
  phoneNumberId: string,
  accessToken: string,
): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("phoneNumberId", phoneNumberId)
  formData.append("accessToken", accessToken)
  formData.append("uploadType", "media")

  const res = await fetch("/api/whatsapp/upload-media", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Media upload failed")
  }

  const data = await res.json()
  return data.id as string
}

// ---------------------------------------------------------------------------
// Component helpers
// ---------------------------------------------------------------------------

function getCategoryColor(category: string, selected?: boolean) {
  if (selected) {
    switch (category) {
      case "MARKETING":
        return "bg-orange-500 text-white"
      case "UTILITY":
        return "bg-blue-500 text-white"
      case "AUTHENTICATION":
        return "bg-purple-500 text-white"
      default:
        return "bg-primary text-primary-foreground"
    }
  }
  switch (category) {
    case "MARKETING":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "UTILITY":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "AUTHENTICATION":
      return "bg-purple-100 text-purple-700 border-purple-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

function getHeaderComponent(components: TemplateComponent[]) {
  return components.find((c) => c.type === "HEADER")
}

function getBodyComponent(components: TemplateComponent[]) {
  return components.find((c) => c.type === "BODY")
}

function getFooterComponent(components: TemplateComponent[]) {
  return components.find((c) => c.type === "FOOTER")
}

function getButtonsComponent(components: TemplateComponent[]) {
  return components.find((c) => c.type === "BUTTONS")
}

function isMediaHeader(header: TemplateComponent | undefined): boolean {
  if (!header) return false
  const mediaFormats = ["IMAGE", "VIDEO", "DOCUMENT"] as const
  return header.format
    ? (mediaFormats as readonly string[]).includes(header.format)
    : false
}

// ---------------------------------------------------------------------------
// Send Template Dialog
// ---------------------------------------------------------------------------

export function SendTemplateDialog({
  open,
  onOpenChange,
  templates,
  appService,
  customerNumber,
  phoneNumber,
  organizationId,
  onSend,
}: SendTemplateDialogProps) {
  // -- selection state --
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")

  // -- variable values --
  const [bodyVarValues, setBodyVarValues] = useState<Record<string, string>>({})
  const [headerVarValues, setHeaderVarValues] = useState<Record<string, string>>({})
  const [buttonVarValues, setButtonVarValues] = useState<Record<string, string>>({})

  // -- media --
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaId, setMediaId] = useState<string | null>(null)

  // -- sending --
  const [isSending, setIsSending] = useState(false)

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const categories = useMemo(() => {
    const cats = Array.from(new Set(templates.map((t) => t.category)))
    return ["ALL", ...cats]
  }, [templates])

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "ALL" || t.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  // Extract placeholders from selected template
  const bodyPlaceholders = useMemo(() => {
    if (!selectedTemplate) return []
    const body = getBodyComponent(selectedTemplate.components)
    return body?.text ? extractVarPlaceholders(body.text) : []
  }, [selectedTemplate])

  const headerPlaceholders = useMemo(() => {
    if (!selectedTemplate) return []
    const header = getHeaderComponent(selectedTemplate.components)
    if (header?.format === "TEXT" && header.text) {
      return extractVarPlaceholders(header.text)
    }
    return []
  }, [selectedTemplate])

  const urlButtonVarPlaceholders = useMemo(() => {
    if (!selectedTemplate) return [] as { index: number; placeholder: string; label: string }[]
    const buttons = getButtonsComponent(selectedTemplate.components)
    if (!buttons?.buttons) return [] as { index: number; placeholder: string; label: string }[]
    const result: { index: number; placeholder: string; label: string }[] = []
    buttons.buttons.forEach((btn: any, idx: number) => {
      if (btn.type === "URL" && btn.url) {
        const vars = extractVarPlaceholders(btn.url)
        vars.forEach((v) => {
          result.push({ index: idx, placeholder: v, label: btn.text || `Button ${idx + 1}` })
        })
      }
    })
    return result
  }, [selectedTemplate])

  const needsMediaUpload = useMemo(() => {
    if (!selectedTemplate) return false
    const header = getHeaderComponent(selectedTemplate.components)
    return isMediaHeader(header)
  }, [selectedTemplate])

  const headerMediaFormat = useMemo(() => {
    if (!selectedTemplate) return null
    const header = getHeaderComponent(selectedTemplate.components)
    if (!header) return null
    if (isMediaHeader(header)) return header.format as string
    return null
  }, [selectedTemplate])

  // ---------------------------------------------------------------------------
  // Preview text computation
  // ---------------------------------------------------------------------------

  const previewBodyText = useMemo(() => {
    if (!selectedTemplate) return ""
    const body = getBodyComponent(selectedTemplate.components)
    if (!body?.text) return ""
    return replaceVars(body.text, bodyPlaceholders, bodyVarValues)
  }, [selectedTemplate, bodyPlaceholders, bodyVarValues])

  const previewHeaderText = useMemo(() => {
    if (!selectedTemplate) return ""
    const header = getHeaderComponent(selectedTemplate.components)
    if (!header?.text || header.format !== "TEXT") return ""
    return replaceVars(header.text, headerPlaceholders, headerVarValues)
  }, [selectedTemplate, headerPlaceholders, headerVarValues])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleSelectTemplate(template: WhatsAppTemplate) {
    setSelectedTemplate(template)
    setBodyVarValues({})
    setHeaderVarValues({})
    setButtonVarValues({})
    setMediaFile(null)
    setMediaId(null)
  }

  async function handleSend() {
    if (!selectedTemplate) return

    // Auto-upload media if file selected but not yet uploaded
    if (needsMediaUpload && !mediaId) {
      if (!mediaFile) {
        toast.error("Please select a media file before sending")
        return
      }
      setIsSending(true)
      try {
        const id = await uploadMediaForSending(
          mediaFile,
          appService.phone_number_id,
          appService.access_token,
        )
        setMediaId(id)
        // Continue with this id below
        return handleSendWithMedia(id)
      } catch (err) {
        console.error("Media upload error:", err)
        toast.error(err instanceof Error ? err.message : "Failed to upload media")
        setIsSending(false)
        return
      }
    }

    return handleSendWithMedia(mediaId)
  }

  async function handleSendWithMedia(resolvedMediaId: string | null) {
    if (!selectedTemplate) return

    // Build components array for the send request
    const components: any[] = []

    // -- Header component --
    const header = getHeaderComponent(selectedTemplate.components)
    if (header) {
      if (isMediaHeader(header) && resolvedMediaId) {
        const mediaType = (header.format || "IMAGE").toLowerCase()
        components.push({
          type: "header",
          parameters: [
            {
              type: mediaType === "document" ? "document" : mediaType,
              [mediaType]: { id: resolvedMediaId },
            },
          ],
        })
      } else if (header.format === "TEXT" && headerPlaceholders.length > 0) {
        components.push({
          type: "header",
          parameters: headerPlaceholders.map((ph) => ({
            type: "text",
            text: headerVarValues[ph] || "",
          })),
        })
      }
    }

    // -- Body component --
    if (bodyPlaceholders.length > 0) {
      components.push({
        type: "body",
        parameters: bodyPlaceholders.map((ph) => ({
          type: "text",
          text: bodyVarValues[ph] || "",
        })),
      })
    }

    // -- Button components --
    if (urlButtonVarPlaceholders.length > 0) {
      for (const btnVar of urlButtonVarPlaceholders) {
        components.push({
          type: "button",
          sub_type: "url",
          index: String(btnVar.index),
          parameters: [
            {
              type: "text",
              text: buttonVarValues[btnVar.placeholder] || "",
            },
          ],
        })
      }
    }

    setIsSending(true)
    try {
      await sendTemplateMessage({
        phone_number: phoneNumber,
        customer_number: customerNumber,
        template_name: selectedTemplate.name,
        language: selectedTemplate.language,
        components: components.length > 0 ? components : undefined,
      })

      const bodyComp = getBodyComponent(selectedTemplate.components)
      const bodyText = bodyComp?.text
        ? replaceVars(bodyComp.text, bodyPlaceholders, bodyVarValues)
        : selectedTemplate.name

      onSend(selectedTemplate.name, bodyText)
      toast.success("Template message sent")
      onOpenChange(false)

      // Reset state
      setSelectedTemplate(null)
      setSearchQuery("")
      setSelectedCategory("ALL")
      setBodyVarValues({})
      setHeaderVarValues({})
      setButtonVarValues({})
      setMediaFile(null)
      setMediaId(null)
    } catch (err) {
      console.error("Failed to send template:", err)
      toast.error(err instanceof Error ? err.message : "Failed to send template message")
    } finally {
      setIsSending(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Accepted file types per header format
  // ---------------------------------------------------------------------------

  function getAcceptedFileTypes(): string {
    if (!headerMediaFormat) return "*/*"
    switch (headerMediaFormat) {
      case "IMAGE":
        return "image/jpeg,image/png"
      case "VIDEO":
        return "video/mp4"
      case "DOCUMENT":
        return "application/pdf"
      default:
        return "*/*"
    }
  }

  function getMediaIcon() {
    switch (headerMediaFormat) {
      case "IMAGE":
        return <ImageIcon className="h-4 w-4" />
      case "VIDEO":
        return <Video className="h-4 w-4" />
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Send Template Message</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 flex-1 min-h-0">
          {/* ================================================================
              LEFT PANEL - Template list
              ================================================================ */}
          <div className="col-span-2 border-r flex flex-col min-h-0">
            {/* Search */}
            <div className="p-3 border-b space-y-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? cat === "ALL"
                          ? "bg-primary text-primary-foreground"
                          : getCategoryColor(cat, true)
                        : cat === "ALL"
                          ? "bg-muted text-muted-foreground hover:bg-muted/80"
                          : getCategoryColor(cat) + " hover:opacity-80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template list */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="divide-y">
                {filteredTemplates.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No templates found
                  </div>
                ) : (
                  filteredTemplates.map((template) => {
                    const header = getHeaderComponent(template.components)
                    const body = getBodyComponent(template.components)
                    const mediaFormat = header && isMediaHeader(header) ? header.format : null

                    return (
                      <button
                        key={template.id || template.name}
                        onClick={() => handleSelectTemplate(template)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors ${
                          selectedTemplate?.name === template.name &&
                          selectedTemplate?.language === template.language
                            ? "bg-primary/10 border-l-2 border-primary"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm truncate flex-1">
                            {template.name}
                          </span>
                          {mediaFormat === "IMAGE" && (
                            <ImageIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          )}
                          {mediaFormat === "VIDEO" && (
                            <Video className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                          )}
                          {mediaFormat === "DOCUMENT" && (
                            <FileText className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                          )}
                        </div>
                        {body?.text && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {body.text}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {template.language}
                          </Badge>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* ================================================================
              RIGHT PANEL - Preview + variables + send
              ================================================================ */}
          <div className="col-span-3 flex flex-col min-h-0">
            {!selectedTemplate ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                Select a template to preview
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-4">
                    {/* --------------------------------------------------
                        WhatsApp-style preview bubble
                        -------------------------------------------------- */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Preview
                      </Label>
                      <div className="flex justify-center rounded-xl bg-[#efeae2] p-4">
                        <div className="w-[280px] rounded-lg bg-[#d9fdd3] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.1)] overflow-hidden">
                          {/* Header */}
                          {(() => {
                            const header = getHeaderComponent(selectedTemplate.components)
                            if (!header) return null

                            if (header.format === "TEXT" && header.text) {
                              return (
                                <div className="font-semibold text-[#111b21] text-sm mb-1 break-words">
                                  {headerPlaceholders.length > 0
                                    ? replaceVars(header.text, headerPlaceholders, headerVarValues)
                                    : header.text}
                                </div>
                              )
                            }

                            if (isMediaHeader(header)) {
                              return (
                                <div className="bg-[#c6e8b5] rounded-lg mb-2 flex items-center justify-center h-32">
                                  {mediaFile ? (
                                    <div className="text-xs text-center px-2 overflow-hidden text-[#667781]">
                                      <div className="flex items-center justify-center mb-1">
                                        {getMediaIcon()}
                                      </div>
                                      <span className="truncate block max-w-full">
                                        {mediaFile.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1 text-xs text-[#667781]">
                                      {header.format === "IMAGE" && <ImageIcon className="h-5 w-5" />}
                                      {header.format === "VIDEO" && <Video className="h-5 w-5" />}
                                      {header.format === "DOCUMENT" && <FileText className="h-5 w-5" />}
                                      <span>{header.format} header</span>
                                    </div>
                                  )}
                                </div>
                              )
                            }

                            return null
                          })()}

                          {/* Body */}
                          <div className="text-[13px] text-[#111b21] whitespace-pre-wrap break-words leading-relaxed">
                            {previewBodyText}
                          </div>

                          {/* Footer */}
                          {(() => {
                            const footer = getFooterComponent(selectedTemplate.components)
                            if (!footer?.text) return null
                            return (
                              <div className="text-xs text-[#667781] mt-1.5">
                                {footer.text}
                              </div>
                            )
                          })()}

                          {/* Buttons */}
                          {(() => {
                            const btns = getButtonsComponent(selectedTemplate.components)
                            if (!btns?.buttons || btns.buttons.length === 0) return null
                            return (
                              <div className="mt-2 border-t border-[#c6e8b5] pt-1.5 space-y-1">
                                {btns.buttons.map((btn: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="text-center text-xs text-[#027eb5] font-medium py-1.5 rounded-md bg-white/60"
                                  >
                                    {btn.text || btn.type}
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* --------------------------------------------------
                        Body variable inputs
                        -------------------------------------------------- */}
                    {bodyPlaceholders.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Body Variables
                        </Label>
                        {bodyPlaceholders.map((ph) => (
                          <div key={ph} className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
                              {ph}
                            </span>
                            <Input
                              placeholder={`Value for ${ph}`}
                              value={bodyVarValues[ph] || ""}
                              onChange={(e) =>
                                setBodyVarValues((prev) => ({
                                  ...prev,
                                  [ph]: e.target.value,
                                }))
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* --------------------------------------------------
                        Header text variable inputs
                        -------------------------------------------------- */}
                    {headerPlaceholders.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Header Variables
                        </Label>
                        {headerPlaceholders.map((ph) => (
                          <div key={ph} className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
                              {ph}
                            </span>
                            <Input
                              placeholder={`Value for ${ph}`}
                              value={headerVarValues[ph] || ""}
                              onChange={(e) =>
                                setHeaderVarValues((prev) => ({
                                  ...prev,
                                  [ph]: e.target.value,
                                }))
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* --------------------------------------------------
                        URL button variable inputs
                        -------------------------------------------------- */}
                    {urlButtonVarPlaceholders.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Button URL Variables
                        </Label>
                        {urlButtonVarPlaceholders.map((btnVar) => (
                          <div key={`${btnVar.index}-${btnVar.placeholder}`} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">
                              {btnVar.label} {btnVar.placeholder}
                            </span>
                            <Input
                              placeholder={`Value for ${btnVar.placeholder}`}
                              value={buttonVarValues[btnVar.placeholder] || ""}
                              onChange={(e) =>
                                setButtonVarValues((prev) => ({
                                  ...prev,
                                  [btnVar.placeholder]: e.target.value,
                                }))
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* --------------------------------------------------
                        Media upload section
                        -------------------------------------------------- */}
                    {needsMediaUpload && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          {headerMediaFormat} Attachment
                        </Label>
                        {!mediaFile ? (
                          <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-4 py-5 cursor-pointer transition-colors hover:border-muted-foreground/40 hover:bg-muted/50">
                            <input
                              type="file"
                              accept={getAcceptedFileTypes()}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setMediaFile(file)
                                  setMediaId(null)
                                }
                              }}
                              className="hidden"
                            />
                            <Upload className="h-5 w-5 text-muted-foreground/60" />
                            <div className="text-center">
                              <p className="text-xs font-medium text-muted-foreground">
                                Click to upload {headerMediaFormat?.toLowerCase()}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                {headerMediaFormat === "IMAGE" && "JPG, PNG"}
                                {headerMediaFormat === "VIDEO" && "MP4"}
                                {headerMediaFormat === "DOCUMENT" && "PDF"}
                              </p>
                            </div>
                          </label>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                            {getMediaIcon()}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{mediaFile.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {(mediaFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => { setMediaFile(null); setMediaId(null) }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Send button - pinned at bottom */}
                <div className="border-t p-3 shrink-0">
                  <Button
                    className="w-full"
                    onClick={handleSend}
                    disabled={isSending || (needsMediaUpload && !mediaFile)}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Template"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
