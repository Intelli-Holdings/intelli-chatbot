import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DefaultTemplate } from "@/data/default-templates"
import { Eye, Plus, Sparkles, MessageCircle, FileText, Image, Video, MapPin, Phone, Link, ChevronRight } from "lucide-react"

interface TemplateCardProps {
  template: DefaultTemplate
  onPreview: (template: DefaultTemplate) => void
  onCreate: (template: DefaultTemplate) => void
  isCreating?: boolean
}

export function TemplateCard({ template, onPreview, onCreate, isCreating }: TemplateCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MARKETING':
        return "bg-orange-100 text-orange-700 border-orange-200"
      case 'UTILITY':
        return "bg-blue-100 text-blue-700 border-blue-200"
      case 'AUTHENTICATION':
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MARKETING':
        return <Sparkles className="h-3 w-3" />
      case 'UTILITY':
        return <FileText className="h-3 w-3" />
      case 'AUTHENTICATION':
        return <MessageCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getHeaderIcon = (component: any) => {
    if (!component || component.type !== 'HEADER') return null
    
    switch (component.format) {
      case 'IMAGE':
        return <Image className="h-4 w-4 text-muted-foreground" />
      case 'VIDEO':
        return <Video className="h-4 w-4 text-muted-foreground" />
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-muted-foreground" />
      case 'LOCATION':
        return <MapPin className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const renderTemplatePreview = () => {
    const headerComponent = template.components?.find(c => c.type === 'HEADER')
    const bodyComponent = template.components?.find(c => c.type === 'BODY')
    const footerComponent = template.components?.find(c => c.type === 'FOOTER')
    const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS')

    // Replace variables with placeholder text
    const formatText = (text: string) => {
      if (!text) return ''
      return text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
        const placeholders = ['Customer Name', 'Order ID', 'Date', 'Amount', 'Link']
        return `[${placeholders[parseInt(num) - 1] || `Variable ${num}`}]`
      })
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
        {/* WhatsApp-style message bubble */}
        <div className="space-y-2">
          {/* Header */}
          {headerComponent && (
            <div className="space-y-1">
              {headerComponent.format === 'TEXT' && headerComponent.text && (
                <div className="font-semibold text-sm">
                  {formatText(headerComponent.text)}
                </div>
              )}
              {headerComponent.format && headerComponent.format !== 'TEXT' && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-8 flex items-center justify-center">
                  {getHeaderIcon(headerComponent)}
                </div>
              )}
            </div>
          )}

          {/* Body */}
          {bodyComponent && bodyComponent.text && (
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {formatText(bodyComponent.text)}
            </div>
          )}

          {/* Footer */}
          {footerComponent && footerComponent.text && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
              {footerComponent.text}
            </div>
          )}

          {/* Buttons */}
          {buttonsComponent && buttonsComponent.buttons && (
            <div className="pt-2 space-y-1">
              {buttonsComponent.buttons.map((button: any, index: number) => (
                <div 
                  key={index}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-center text-sm flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800"
                >
                  {button.type === 'PHONE_NUMBER' && <Phone className="h-3 w-3" />}
                  {button.type === 'URL' && <Link className="h-3 w-3" />}
                  {button.type === 'QUICK_REPLY' && <ChevronRight className="h-3 w-3" />}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {button.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message metadata (WhatsApp style) */}
        <div className="flex justify-end mt-2">
          <span className="text-xs text-gray-400">Template Preview</span>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 p-2">
     
        {/* Header Section */}
       

        {/* Template Preview Section */}
        <div className="flex-1 mb-4">
          {renderTemplatePreview()}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t p-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPreview(template)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={() => onCreate(template)}
            disabled={isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreating ? (
              <>
                <Sparkles className="h-4 w-4 mr-1.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Use Template
              </>
            )}
          </Button>
        </div>
    </Card>
  )
}