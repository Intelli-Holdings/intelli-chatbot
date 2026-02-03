import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DefaultTemplate } from "@/data/default-templates"
import { Eye, Plus, Sparkles, MessageCircle, FileText, Image as ImageIcon, Video, MapPin, Phone, Link, ChevronRight, NotebookPen } from "lucide-react"

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

  // Check if template requires customization
  const requiresCustomization = () => {
    // Check for media requirements
    const headerComponent = template.components?.find(c => c.type === 'HEADER');
    if (headerComponent && headerComponent.format && 
        ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format)) {
      return true;
    }

    // Check for variables
    const hasVariables = template.components?.some(component => {
      return component.text && /\{\{\d+\}\}/.test(component.text);
    });

    // Check for customizable buttons
    const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');
    const hasCustomizableButtons = buttonsComponent?.buttons?.some(button => 
      button.type === 'PHONE_NUMBER' || button.type === 'URL'
    );

    return hasVariables || hasCustomizableButtons || false;
  };

  const needsCustomization = requiresCustomization();

  const getHeaderIcon = (component: any) => {
    if (!component || component.type !== 'HEADER') return null
    
    switch (component.format) {
      case 'IMAGE':
        return <ImageIcon className="h-4 w-4 text-muted-foreground" />
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
      <div className="bg-[#e5ddd5] dark:bg-gray-800 p-3 rounded-lg min-h-[200px]">
        {/* Message bubble - right side (business sending) */}
        <div className="flex justify-end">
          <div className="max-w-[85%]">
            <div className="bg-[#dcf8c6] dark:bg-green-900 rounded-lg shadow-sm p-2.5 space-y-2">
              {/* Header */}
              {headerComponent && (
                <div className="space-y-1">
                  {headerComponent.format === 'TEXT' && headerComponent.text && (
                    <div className="font-semibold text-xs">
                      {formatText(headerComponent.text)}
                    </div>
                  )}
                  {headerComponent.format && headerComponent.format !== 'TEXT' && (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-md p-6 flex items-center justify-center -mx-1 -mt-1 mb-1">
                      {getHeaderIcon(headerComponent)}
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              {bodyComponent && bodyComponent.text && (
                <div className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {formatText(bodyComponent.text)}
                </div>
              )}

              {/* Footer */}
              {footerComponent && footerComponent.text && (
                <div className="text-[10px] text-gray-600 dark:text-gray-400 pt-1">
                  {footerComponent.text}
                </div>
              )}

              {/* Buttons */}
              {buttonsComponent && buttonsComponent.buttons && (
                <div className="pt-1 space-y-1">
                  {buttonsComponent.buttons.map((button: any, index: number) => (
                    <div 
                      key={index}
                      className="border-t border-gray-300 dark:border-gray-600 px-2 py-1.5 text-center text-xs flex items-center justify-center gap-1.5 bg-white/50 dark:bg-black/20"
                    >
                      {button.type === 'PHONE_NUMBER' && <Phone className="h-3 w-3 text-[#00a5f4] dark:text-blue-400" />}
                      {button.type === 'URL' && <Link className="h-3 w-3 text-[#00a5f4] dark:text-blue-400" />}
                      {button.type === 'QUICK_REPLY' && <ChevronRight className="h-3 w-3 text-[#00a5f4] dark:text-blue-400" />}
                      <span className="text-[#00a5f4] dark:text-blue-400 font-medium">
                        {button.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* WhatsApp message timestamp */}
              <div className="flex justify-end items-center gap-0.5 pt-0.5">
                <span className="text-[9px] text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" viewBox="0 0 16 15" fill="none">
                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={`h-full flex flex-col hover:shadow-lg transition-all duration-200 border-gray-200 dark:border-gray-700 p-2 ${needsCustomization ? 'ring-1 ring-blue-200 border-blue-300' : ''}`}>
      {/* Header Section with Indicators */}
      <div className="p-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <Badge className={`${getCategoryColor(template.category)} text-xs`}>
            <div className="flex items-center gap-1">
              {getCategoryIcon(template.category)}
              {template.category}
            </div>
          </Badge>
        </div>
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          {template.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {template.description}
        </p>
      </div>

      {/* Template Preview Section */}
      <div className="flex-1 mb-4 p-2">
        {renderTemplatePreview()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t p-2">
        <Button 
          size="sm" 
          onClick={() => onCreate(template)}
          disabled={isCreating}
          className={`flex-1 ${needsCustomization ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
        >
          {isCreating ? (
            <>
              <Sparkles className="h-4 w-4 mr-1.5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              {needsCustomization ? (
                <>
                  <NotebookPen className="h-4 w-4 mr-1.5" />
                  Customize
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Use Template
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}