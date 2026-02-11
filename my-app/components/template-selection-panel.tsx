"use client"

import { useState } from "react"
import { Image as ImageIcon, Video, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TemplateListContainer } from "./template-list-container"
import { TemplateSearchFilter } from "./template-search-filter"

// Helper to get media header info from template
function getMediaHeaderInfo(components: any[]): { type: string; format: string } | null {
  const header = components?.find(
    (c: any) => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)
  )
  if (!header) return null
  return { type: header.type, format: header.format }
}

// Media type badge component
function MediaTypeBadge({ format }: { format: string }) {
  const config: Record<string, { icon: typeof ImageIcon; label: string; className: string }> = {
    IMAGE: { icon: ImageIcon, label: 'Image', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    VIDEO: { icon: Video, label: 'Video', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    DOCUMENT: { icon: FileText, label: 'Document', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  }
  const { icon: Icon, label, className } = config[format] || config.IMAGE
  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label} Header
    </Badge>
  )
}

interface Template {
  id: string
  name: string
  category: string
  status?: string
  components?: any[]
  [key: string]: any
}

interface TemplateSelectionPanelProps {
  templates: Template[]
  selectedTemplate: string | null
  onSelectTemplate: (templateName: string) => void
  loading?: boolean
  maxHeight?: string
}

export function TemplateSelectionPanel({
  templates,
  selectedTemplate,
  onSelectTemplate,
  loading = false,
  maxHeight = "max-h-96",
}: TemplateSelectionPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getSelectedTemplateData = () => {
    return templates.find((t) => t.name === selectedTemplate)
  }

  const selectedTemplateData = getSelectedTemplateData()

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-base font-semibold text-foreground">Select Template</label>
          <p className="text-xs text-muted-foreground mt-1">Choose from available approved templates</p>
        </div>

        <TemplateSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search templates..."
        />

        <TemplateListContainer
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={onSelectTemplate}
          loading={loading}
          searchTerm={searchTerm}
          maxHeight={maxHeight}
        />
      </div>

      {selectedTemplateData && (
        <Card className="bg-muted/30 border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Template Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{selectedTemplateData.name}</span>
              <div className="flex items-center gap-2">
                {selectedTemplateData.components && getMediaHeaderInfo(selectedTemplateData.components) && (
                  <MediaTypeBadge format={getMediaHeaderInfo(selectedTemplateData.components)!.format} />
                )}
                {selectedTemplateData.category && (
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplateData.category}
                  </Badge>
                )}
              </div>
            </div>

            {selectedTemplateData.components?.map((component: any, index: number) => (
              <div key={index}>
                {component.type === "HEADER" && component.format === "TEXT" && (
                  <div className="text-sm">
                    <p className="font-semibold text-muted-foreground mb-2">Header:</p>
                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-xs">{component.text}</p>
                  </div>
                )}
                {component.type === "HEADER" && component.format === "IMAGE" && (
                  <div className="text-sm">
                    <p className="font-semibold text-muted-foreground mb-2">Header:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center justify-center gap-2 text-blue-600">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-xs font-medium">Image Header</span>
                    </div>
                  </div>
                )}
                {component.type === "HEADER" && component.format === "VIDEO" && (
                  <div className="text-sm">
                    <p className="font-semibold text-muted-foreground mb-2">Header:</p>
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-4 flex items-center justify-center gap-2 text-purple-600">
                      <Video className="h-5 w-5" />
                      <span className="text-xs font-medium">Video Header</span>
                    </div>
                  </div>
                )}
                {component.type === "HEADER" && component.format === "DOCUMENT" && (
                  <div className="text-sm">
                    <p className="font-semibold text-muted-foreground mb-2">Header:</p>
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4 flex items-center justify-center gap-2 text-orange-600">
                      <FileText className="h-5 w-5" />
                      <span className="text-xs font-medium">Document Header</span>
                    </div>
                  </div>
                )}
                {component.type === "BODY" && (
                  <div className="text-sm">
                    <p className="font-semibold text-muted-foreground mb-2">Body:</p>
                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-xs">{component.text}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
