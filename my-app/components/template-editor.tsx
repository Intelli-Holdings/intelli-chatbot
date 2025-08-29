import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  status: string;
  language: string;
  components: any[];
}

interface TemplateEditorProps {
  template: WhatsAppTemplate | null
  open: boolean
  onClose: () => void
  onSave: (templateData: any) => Promise<boolean>
  loading?: boolean
}

export function TemplateEditor({ 
  template, 
  open, 
  onClose, 
  onSave, 
  loading = false 
}: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<any>(null)

  useEffect(() => {
    if (template) {
      setEditedTemplate({
        name: template.name,
        category: template.category,
        language: template.language,
        components: [...template.components]
      })
    }
  }, [template])

  const handleSave = async () => {
    if (!editedTemplate) return
    
    try {
      const success = await onSave(editedTemplate)
      if (success) {
        toast.success("Template updated successfully!")
        onClose()
      }
    } catch (error) {
      toast.error("Failed to update template")
    }
  }

  const updateComponent = (index: number, field: string, value: any) => {
    if (!editedTemplate) return
    
    const newComponents = [...editedTemplate.components]
    newComponents[index] = {
      ...newComponents[index],
      [field]: value
    }
    
    setEditedTemplate({
      ...editedTemplate,
      components: newComponents
    })
  }

  const addComponent = () => {
    if (!editedTemplate) return
    
    const newComponent = {
      type: 'BODY',
      text: ''
    }
    
    setEditedTemplate({
      ...editedTemplate,
      components: [...editedTemplate.components, newComponent]
    })
  }

  const removeComponent = (index: number) => {
    if (!editedTemplate) return
    
    const newComponents = editedTemplate.components.filter((_: any, i: number) => i !== index)
    setEditedTemplate({
      ...editedTemplate,
      components: newComponents
    })
  }

  if (!editedTemplate) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Template: {template?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={editedTemplate.name}
                    onChange={(e) => setEditedTemplate({
                      ...editedTemplate,
                      name: e.target.value
                    })}
                    disabled={template?.status === 'APPROVED'}
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Select 
                    value={editedTemplate.category} 
                    onValueChange={(value) => setEditedTemplate({
                      ...editedTemplate,
                      category: value
                    })}
                    disabled={template?.status === 'APPROVED'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARKETING">Marketing</SelectItem>
                      <SelectItem value="UTILITY">Utility</SelectItem>
                      <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="template-language">Language</Label>
                <Select 
                  value={editedTemplate.language} 
                  onValueChange={(value) => setEditedTemplate({
                    ...editedTemplate,
                    language: value
                  })}
                  disabled={template?.status === 'APPROVED'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="en_GB">English (UK)</SelectItem>
                    <SelectItem value="es_ES">Spanish</SelectItem>
                    <SelectItem value="fr_FR">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Components */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Template Components</CardTitle>
                <Button
                  size="sm"
                  onClick={addComponent}
                  disabled={template?.status === 'APPROVED'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Component
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editedTemplate.components.map((component: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Component {index + 1}
                      </Badge>
                      <Select
                        value={component.type}
                        onValueChange={(value) => updateComponent(index, 'type', value)}
                        disabled={template?.status === 'APPROVED'}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HEADER">Header</SelectItem>
                          <SelectItem value="BODY">Body</SelectItem>
                          <SelectItem value="FOOTER">Footer</SelectItem>
                          <SelectItem value="BUTTONS">Buttons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeComponent(index)}
                      disabled={template?.status === 'APPROVED'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {(component.type === 'HEADER' || component.type === 'BODY' || component.type === 'FOOTER') && (
                    <div>
                      <Label>Text Content</Label>
                      <Textarea
                        value={component.text || ''}
                        onChange={(e) => updateComponent(index, 'text', e.target.value)}
                        placeholder="Enter text content..."
                        disabled={template?.status === 'APPROVED'}
                        rows={3}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Use {`{{1}} {{2}}`} etc. for dynamic parameters
                      </div>
                    </div>
                  )}

                  {component.type === 'HEADER' && (
                    <div className="mt-4">
                      <Label>Format</Label>
                      <Select
                        value={component.format || 'TEXT'}
                        onValueChange={(value) => updateComponent(index, 'format', value)}
                        disabled={template?.status === 'APPROVED'}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="IMAGE">Image</SelectItem>
                          <SelectItem value="VIDEO">Video</SelectItem>
                          <SelectItem value="DOCUMENT">Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={loading || template?.status === 'APPROVED'}
            >
              {loading ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {template?.status === 'APPROVED' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm text-yellow-800">
                <strong>Note:</strong> Approved templates cannot be edited. Create a new template with your changes instead.
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
