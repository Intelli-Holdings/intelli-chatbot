import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Copy, FileText } from "lucide-react"
import { toast } from "sonner"

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  components: any[];
}

interface TemplateDetailsDialogProps {
  template: WhatsAppTemplate | null
  open: boolean
  onClose: () => void
  onEdit?: (template: WhatsAppTemplate) => void
  onDelete?: (templateName: string) => void
  onTest?: (template: WhatsAppTemplate) => void
}

export function TemplateDetailsDialog({ 
  template, 
  open, 
  onClose, 
  onEdit, 
  onDelete, 
  onTest 
}: TemplateDetailsDialogProps) {
  if (!template) return null

  const handleCopyId = () => {
    navigator.clipboard.writeText(template.id)
    toast.success("Template ID copied to clipboard")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return "bg-green-100 text-green-800"
      case 'PENDING':
        return "bg-yellow-100 text-yellow-800"
      case 'REJECTED':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Template Details</span>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(template.status)}>
                {template.status}
              </Badge>
              <Badge className={getCategoryColor(template.category)}>
                {template.category}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <div className="text-sm font-medium">{template.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Language</label>
                  <div className="text-sm">{template.language}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Template ID</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{template.id}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyId}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.components?.map((component, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">
                      {component.type}
                    </Badge>
                    {component.format && (
                      <Badge variant="secondary">
                        {component.format}
                      </Badge>
                    )}
                  </div>
                  
                  {component.text && (
                    <div className="bg-muted/30 rounded p-3 mb-2">
                      <div className="text-sm whitespace-pre-wrap">
                        {component.text}
                      </div>
                    </div>
                  )}
                  
                  {component.buttons && component.buttons.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Buttons:</div>
                      {component.buttons.map((button: any, buttonIndex: number) => (
                        <div key={buttonIndex} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {button.type}
                          </Badge>
                          <span>{button.text}</span>
                          {button.url && (
                            <span className="text-muted-foreground">→ {button.url}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {template.status !== 'APPROVED' && onEdit && (
              <Button
                variant="outline"
                onClick={() => onEdit(template)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="outline"
                onClick={() => onDelete(template.name)}
                disabled={template.status === 'APPROVED'}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            
            {template.status === 'APPROVED' && onTest && (
              <Button
                onClick={() => onTest(template)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Test Template
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
