import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Copy, FileText, Bot, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChatbotAutomationService, TemplateButtonFlowMapping } from "@/services/chatbot-automation"
import { ChatbotAutomation } from "@/types/chatbot-automation"

import { logger } from "@/lib/logger";
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
  onDelete?: (template: WhatsAppTemplate) => void
  onTest?: (template: WhatsAppTemplate) => void
  organizationId?: string | null
}

export function TemplateDetailsDialog({
  template,
  open,
  onClose,
  onEdit,
  onDelete,
  onTest,
  organizationId
}: TemplateDetailsDialogProps) {
  const [chatbotFlows, setChatbotFlows] = useState<ChatbotAutomation[]>([])
  const [flowMappings, setFlowMappings] = useState<Record<number, string>>({})
  const [existingMappings, setExistingMappings] = useState<TemplateButtonFlowMapping[]>([])
  const [loadingFlows, setLoadingFlows] = useState(false)
  const [savingMappings, setSavingMappings] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Get quick reply buttons from template
  const quickReplyButtons = template?.components
    ?.find((c: any) => c.type === "BUTTONS")
    ?.buttons?.filter((b: any) => b.type === "QUICK_REPLY") || []

  // Fetch chatbot flows and existing mappings
  const fetchFlowsAndMappings = useCallback(async () => {
    if (!organizationId || !template?.id || quickReplyButtons.length === 0) return

    setLoadingFlows(true)
    try {
      const [flows, mappings] = await Promise.all([
        ChatbotAutomationService.getChatbots(organizationId),
        ChatbotAutomationService.getTemplateButtonMappings(template.id, organizationId)
      ])

      setChatbotFlows(flows.filter(f => f.isActive))
      setExistingMappings(mappings)

      // Initialize flow mappings from existing data
      const initialMappings: Record<number, string> = {}
      mappings.forEach((m) => {
        initialMappings[m.button_index] = m.flow
      })
      setFlowMappings(initialMappings)
      setHasChanges(false)
    } catch (error) {
      logger.error("Error fetching flows and mappings:", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoadingFlows(false)
    }
  }, [organizationId, template?.id, quickReplyButtons.length])

  useEffect(() => {
    if (open && template && organizationId) {
      fetchFlowsAndMappings()
    }
  }, [open, template, organizationId, fetchFlowsAndMappings])

  // Handle flow selection change
  const handleFlowChange = (buttonIndex: number, flowId: string) => {
    setFlowMappings(prev => ({
      ...prev,
      [buttonIndex]: flowId === "none" ? "" : flowId
    }))
    setHasChanges(true)
  }

  // Save flow mappings
  const handleSaveMappings = async () => {
    if (!organizationId || !template) return

    setSavingMappings(true)
    try {
      const mappingsToSave = quickReplyButtons.map((button: any, index: number) => ({
        button_text: button.text,
        button_index: index,
        flow: flowMappings[index] || null
      }))

      await ChatbotAutomationService.updateTemplateButtonMappings(
        organizationId,
        template.id,
        template.name,
        mappingsToSave
      )

      toast.success("Flow mappings saved successfully")
      setHasChanges(false)
      fetchFlowsAndMappings()
    } catch (error) {
      logger.error("Error saving flow mappings:", { error: error instanceof Error ? error.message : String(error) })
      toast.error("Failed to save flow mappings")
    } finally {
      setSavingMappings(false)
    }
  }

  if (!template) return null

  const handleCopyId = () => {
    navigator.clipboard.writeText(template.id)
    toast.success("Template ID copied to clipboard")
  }

  const normalizeStatus = (status: string) => {
    const value = status.toUpperCase()
    if (value.includes('REJECT')) return 'REJECTED'
    if (value.includes('PENDING') || value.includes('REVIEW')) return 'PENDING'
    if (value.includes('APPROVED') || value.startsWith('ACTIVE')) return 'APPROVED'
    return value
  }

  const formatStatusLabel = (status: string) => {
    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const statusKey = normalizeStatus(template.status)

  const getStatusColor = (status: string) => {
    switch (normalizeStatus(status)) {
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
                {formatStatusLabel(template.status)}
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

          {/* Flow Mapping for Quick Reply Buttons */}
          {quickReplyButtons.length > 0 && organizationId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Chatbot Flow Mapping
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Map quick reply buttons to chatbot flows. When a user clicks a button, the selected flow will be triggered.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingFlows ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading flows...</span>
                  </div>
                ) : chatbotFlows.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No active chatbot flows available. Create a chatbot flow first to map buttons.
                  </div>
                ) : (
                  <>
                    {quickReplyButtons.map((button: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Button {index + 1}
                            </Badge>
                            <span className="font-medium">{button.text}</span>
                          </div>
                        </div>
                        <Select
                          value={flowMappings[index] || "none"}
                          onValueChange={(value) => handleFlowChange(index, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select a flow" />
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
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        onClick={handleSaveMappings}
                        disabled={!hasChanges || savingMappings}
                      >
                        {savingMappings ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Mappings
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {statusKey !== 'APPROVED' && onEdit && (
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
                onClick={() => onDelete(template)}
                disabled={statusKey === 'APPROVED'}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}

            {statusKey === 'APPROVED' && onTest && (
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
