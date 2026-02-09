"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronDown, Check, Image, Video, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface TemplateComponent {
  type: string
  format?: string
  text?: string
  [key: string]: any
}

interface Template {
  id: string
  name: string
  category: string
  status?: string
  components?: TemplateComponent[]
  [key: string]: any
}

// Helper to detect media type in template header
function getTemplateMediaType(template: Template): 'image' | 'video' | 'document' | null {
  const headerComponent = template.components?.find(
    (c) => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format || '')
  )
  if (!headerComponent) return null
  return headerComponent.format?.toLowerCase() as 'image' | 'video' | 'document'
}

// Media indicator component
function MediaIndicator({ mediaType }: { mediaType: 'image' | 'video' | 'document' }) {
  const config = {
    image: { icon: Image, label: 'Image', color: 'text-blue-500' },
    video: { icon: Video, label: 'Video', color: 'text-purple-500' },
    document: { icon: FileText, label: 'Document', color: 'text-orange-500' },
  }
  const { icon: Icon, label, color } = config[mediaType]
  return (
    <span className={`inline-flex items-center gap-1 ${color}`} title={`Contains ${label}`}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  )
}

interface TemplateListContainerProps {
  templates: Template[]
  selectedTemplate: string | null
  onSelectTemplate: (templateName: string) => void
  loading?: boolean
  searchTerm?: string
  maxHeight?: string
  className?: string
}

export function TemplateListContainer({
  templates,
  selectedTemplate,
  onSelectTemplate,
  loading = false,
  searchTerm = "",
  maxHeight = "max-h-96",
  className = "",
}: TemplateListContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showTopGradient, setShowTopGradient] = useState(false)
  const [showBottomGradient, setShowBottomGradient] = useState(true)
  const [canScroll, setCanScroll] = useState(false)

  // Filter templates based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Check if content is scrollable and update gradients
  const checkScrollable = () => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = containerRef.current
      const isScrollable = scrollHeight > clientHeight
      setCanScroll(isScrollable)
      setShowTopGradient(scrollTop > 0)
      setShowBottomGradient(scrollTop < scrollHeight - clientHeight - 5)
    }
  }

  // Initial check and on resize
  useEffect(() => {
    checkScrollable()
    window.addEventListener("resize", checkScrollable)
    return () => window.removeEventListener("resize", checkScrollable)
  }, [])

  // Recheck when templates or search changes
  useEffect(() => {
    checkScrollable()
  }, [filteredTemplates.length, searchTerm])

  const handleScroll = () => {
    checkScrollable()
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-8", maxHeight, className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="text-sm">Loading templates...</span>
        </div>
      </div>
    )
  }

  if (filteredTemplates.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", maxHeight, className)}>
        <p className="text-sm text-muted-foreground text-center">
          {searchTerm ? "No templates match your search" : "No templates available"}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("relative rounded-lg border border-border/50 bg-card overflow-hidden", className)}>
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-2 pointer-events-none transition-opacity duration-300",
          "bg-gradient-to-b from-border to-transparent",
          showTopGradient && canScroll ? "opacity-100" : "opacity-0",
        )}
        role="presentation"
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn("overflow-y-scroll overflow-x-hidden", maxHeight, "scroll-smooth")}
        role="listbox"
        aria-label="Template selection list"
        tabIndex={0}
      >
        <style>{`
          div[role="listbox"]::-webkit-scrollbar {
            width: 10px;
          }
          div[role="listbox"]::-webkit-scrollbar-track {
            background: hsl(var(--muted) / 0.3);
            border-radius: 4px;
          }
          div[role="listbox"]::-webkit-scrollbar-thumb {
            background: hsl(var(--muted-foreground) / 0.4);
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          div[role="listbox"]::-webkit-scrollbar-thumb:hover {
            background: hsl(var(--muted-foreground) / 0.6);
            background-clip: padding-box;
          }
        `}</style>

        <div className="divide-y divide-border/30">
          {filteredTemplates.map((template, index) => (
            <button
              key={template.id || index}
              onClick={() => onSelectTemplate(template.name)}
              className={cn(
                "w-full px-4 py-3 text-left transition-all duration-200",
                "hover:bg-muted/50 focus:outline-none focus:bg-muted/60 focus:ring-2 focus:ring-primary/20",
                "active:bg-muted",
                selectedTemplate === template.name
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : "border-l-2 border-l-transparent",
              )}
              role="option"
              aria-selected={selectedTemplate === template.name}
              tabIndex={selectedTemplate === template.name ? 0 : -1}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm truncate">{template.name}</p>
                    {getTemplateMediaType(template) && (
                      <MediaIndicator mediaType={getTemplateMediaType(template)!} />
                    )}
                    {selectedTemplate === template.name && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{template.category}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-2 pointer-events-none transition-opacity duration-300",
          "bg-gradient-to-t from-border to-transparent",
          showBottomGradient && canScroll ? "opacity-100" : "opacity-0",
        )}
        role="presentation"
        aria-hidden="true"
      />

      {canScroll && showBottomGradient && (
        <div
          className="absolute bottom-2 right-2 text-muted-foreground pointer-events-none animate-bounce"
          role="presentation"
          aria-hidden="true"
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
