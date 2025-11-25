"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TemplateListContainer } from "./template-list-container"
import { TemplateSearchFilter } from "./template-search-filter"

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
              {selectedTemplateData.category && (
                <Badge variant="outline" className="text-xs">
                  {selectedTemplateData.category}
                </Badge>
              )}
            </div>

            {selectedTemplateData.components?.map((component: any, index: number) => (
              <div key={index}>
                {component.type === "HEADER" && component.format === "TEXT" && (
                  <div className="text-sm">
                    <p className="font-semibold text-muted-foreground mb-2">Header:</p>
                    <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-xs">{component.text}</p>
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
