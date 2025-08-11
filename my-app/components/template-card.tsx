import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DefaultTemplate } from "@/data/default-templates"
import { Eye, Plus, Sparkles } from "lucide-react"

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
        return "bg-blue-100 text-blue-800"
      case 'UTILITY':
        return "bg-purple-100 text-purple-800"
      case 'AUTHENTICATION':
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
          <Badge className={getCategoryColor(template.category)}>
            {template.category}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="bg-muted/30 rounded-lg p-3 mb-4 flex-1">
          <div className="text-xs text-muted-foreground mb-2">Preview:</div>
          
          {template.preview.headerText && (
            <div className="font-medium text-sm mb-2 text-blue-600">
              {template.preview.headerText}
            </div>
          )}
          
          <div className="text-sm mb-2 whitespace-pre-wrap">
            {template.preview.bodyText}
          </div>
          
          {template.preview.footerText && (
            <div className="text-xs text-muted-foreground mb-2">
              {template.preview.footerText}
            </div>
          )}
          
          {template.preview.buttons && template.preview.buttons.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.preview.buttons.map((button, index) => (
                <div 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs border"
                >
                  {button}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPreview(template)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={() => onCreate(template)}
            disabled={isCreating}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
