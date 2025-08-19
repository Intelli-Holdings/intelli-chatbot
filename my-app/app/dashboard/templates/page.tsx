"use client"

import { useState, useEffect, useCallback } from "react"
import { WhatsAppService, type AppService, type WhatsAppTemplate } from '@/services/whatsapp';
import { DefaultTemplate, defaultTemplates } from '@/data/default-templates';
import { Search, Settings, ChevronDown, Info, Plus, RefreshCw, Eye, Edit, Trash2, Send, TestTube, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateTemplateForm from "@/components/create-template-form"
import DashboardHeader from "@/components/dashboard-header"
import useActiveOrganizationId from "@/hooks/use-organization-id"
import { TemplateCard } from "@/components/template-card"
import { WhatsAppChatPreview } from "@/components/whatsapp-chat-preview"
import { TemplateTester } from "@/components/template-tester"
import { TemplateDetailsDialog } from "@/components/template-details-dialog"
import { TemplateEditor } from "@/components/template-editor"
import BroadcastManager from "@/components/broadcast-manager"
import { CustomizeTemplateDialog } from "@/components/customize-template-dialog"

export default function TemplatesPage() {
  const organizationId = useActiveOrganizationId()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("browse")
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<DefaultTemplate | null>(null)
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false)
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false)
  const [selectedCustomizeTemplate, setSelectedCustomizeTemplate] = useState<DefaultTemplate | null>(null)
  
  // State for app services and templates
  const [appServices, setAppServices] = useState<AppService[]>([])
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [selectedAppService, setSelectedAppService] = useState<AppService | null>(null)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  // Fetch app services for organization
  const fetchAppServices = useCallback(async () => {
    if (!organizationId) {
      setServicesError('Organization ID not available. Please ensure you are logged in and have an active organization.');
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      // Use the local API route which handles the backend call
      const apiUrl = `/api/channels/whatsapp/org/${organizationId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch app services: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Handle both array response and object with appServices property
      const services = Array.isArray(data) ? data : (data.appServices || data || []);
      
      setAppServices(services);
      
      // Auto-select the first app service if available and none is selected
      if (services.length > 0 && !selectedAppService) {
        setSelectedAppService(services[0]);
      } else if (services.length === 0) {
        setServicesError('No WhatsApp services found for this organization. Please configure a WhatsApp Business account first.');
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch app services';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the API server. Please ensure the backend service is running.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setServicesError(errorMessage);
      console.error('Error fetching app services:', err);
    } finally {
      setServicesLoading(false);
    }
  }, [organizationId, selectedAppService]);

  // Fetch WhatsApp templates from Meta API
  const fetchTemplates = useCallback(async () => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError('App service configuration not available');
      return;
    }

    if (!selectedAppService?.access_token) {
      setTemplatesError('Access token is required for Meta Graph API calls');
      return;
    }

    setTemplatesLoading(true);
    setTemplatesError(null);

    try {
      // Use WhatsAppService to fetch templates from Meta Graph API directly
      const data = await WhatsAppService.fetchTemplates(selectedAppService as AppService);
      setTemplates(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
      setTemplatesError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  }, [selectedAppService]);

  // Create template function from default template
  const createTemplateFromDefault = useCallback(async (defaultTemplate: DefaultTemplate): Promise<boolean> => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError('App service configuration not available');
      return false;
    }

    if (!selectedAppService?.access_token) {
      setTemplatesError('Access token is required for Meta Graph API calls');
      return false;
    }

    // Check if template requires media or has variables
    const requiresCustomization = checkTemplateRequiresCustomization(defaultTemplate);
    
    if (requiresCustomization) {
      // Open customization dialog
      setSelectedCustomizeTemplate(defaultTemplate);
      setIsCustomizeDialogOpen(true);
      return true; // Don't create yet, wait for customization
    }

    // Create template directly if no customization needed
    setCreatingTemplateId(defaultTemplate.id);

    try {
      const templateData = {
        name: defaultTemplate.name.toLowerCase().replace(/\s+/g, '_'),
        category: defaultTemplate.category,
        components: defaultTemplate.components,
        language: defaultTemplate.language || 'en_US'
      };
      
      await WhatsAppService.createTemplate(selectedAppService as AppService, templateData);
      await fetchTemplates();
      toast.success('Template created successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setTemplatesError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating template:', err);
      return false;
    } finally {
      setCreatingTemplateId(null);
    }
  }, [selectedAppService, fetchTemplates]);

  // Check if template requires customization
  const checkTemplateRequiresCustomization = (template: DefaultTemplate): boolean => {
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

    return hasVariables || false;
  };

  // Handle customized template creation
  const handleCustomizedTemplateCreation = useCallback(async (
    templateData: any, 
    customizations: any
  ): Promise<boolean> => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError('App service configuration not available');
      return false;
    }

    if (!selectedAppService?.access_token) {
      setTemplatesError('Access token is required for Meta Graph API calls');
      return false;
    }

    setCreatingTemplateId(selectedCustomizeTemplate?.id || null);

    try {
      await WhatsAppService.createTemplate(selectedAppService as AppService, templateData);
      await fetchTemplates();
      toast.success('Template created successfully with your customizations!');
      setIsCustomizeDialogOpen(false);
      setSelectedCustomizeTemplate(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setTemplatesError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating template:', err);
      return false;
    } finally {
      setCreatingTemplateId(null);
    }
  }, [selectedAppService, fetchTemplates, selectedCustomizeTemplate]);

  // Create template function
  const createTemplate = useCallback(async (templateData: any): Promise<boolean> => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError('App service configuration not available');
      return false;
    }

    if (!selectedAppService?.access_token) {
      setTemplatesError('Access token is required for Meta Graph API calls');
      return false;
    }

    try {
      setTemplatesLoading(true);
      
      // Use WhatsAppService to create templates via Meta Graph API directly
      await WhatsAppService.createTemplate(selectedAppService as AppService, templateData);

      // Refetch templates after creation
      await fetchTemplates();
      toast.success('Template created successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setTemplatesError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating template:', err);
      return false;
    } finally {
      setTemplatesLoading(false);
    }
  }, [selectedAppService, fetchTemplates]);

  // Delete template function
  const deleteTemplate = useCallback(async (templateName: string): Promise<boolean> => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError('App service configuration not available');
      return false;
    }

    if (!selectedAppService?.access_token) {
      setTemplatesError('Access token is required for Meta Graph API calls');
      return false;
    }

    try {
      setTemplatesLoading(true);
      
      // Use WhatsAppService to delete templates via Meta Graph API directly
      await WhatsAppService.deleteTemplate(selectedAppService as AppService, templateName);

      // Refetch templates after deletion
      await fetchTemplates();
      toast.success('Template deleted successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setTemplatesError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting template:', err);
      return false;
    } finally {
      setTemplatesLoading(false);
    }
  }, [selectedAppService, fetchTemplates]);

  // Send test template function
  const sendTestTemplate = useCallback(async (
  templateName: string, 
  phoneNumber: string, 
  parameters: string[],
  languageCode: string = 'en_US' // Add language parameter
): Promise<boolean> => {
  if (!selectedAppService?.phone_number_id) {
    toast.error('Phone number ID not available');
    return false;
  }

  if (!selectedAppService?.access_token) {
    toast.error('Access token is required for Meta Graph API calls');
    return false;
  }

  try {
    const messageData = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode // Use dynamic language code
        },
        ...(parameters.length > 0 && {
          components: [
            {
              type: "body",
              parameters: parameters.map((param) => ({
                type: "text",
                text: param
              }))
            }
          ]
        })
      }
    };

    await WhatsAppService.sendMessage(selectedAppService as AppService, messageData);
    toast.success('Test message sent successfully!');
    return true;
  } catch (err) {
    console.error('Error sending test template:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to send test message';
    toast.error(errorMessage);
    throw err;
  }
}, [selectedAppService]);

  // Effects
  useEffect(() => {
    if (organizationId) {
      fetchAppServices();
    }
  }, [organizationId, fetchAppServices]);

  useEffect(() => {
    if (selectedAppService?.whatsapp_business_account_id) {
      fetchTemplates();
    }
  }, [selectedAppService?.whatsapp_business_account_id, fetchTemplates]);

  // Handle app service selection
  const handleAppServiceChange = (serviceId: string) => {
    const service = appServices.find(s => s.id.toString() === serviceId)
    setSelectedAppService(service || null)
  }

  // Handle template creation
  const handleCreateTemplate = async (templateData: any): Promise<boolean> => {
    const success = await createTemplate(templateData)
    if (success) {
      setIsCreateDialogOpen(false)
    }
    return success
  }

  // Handle template deletion
  const handleDeleteTemplate = async (templateName: string) => {
    if (confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      await deleteTemplate(templateName);
    }
  }

  // Handle template viewing
  const handleViewTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template)
    setIsDetailsDialogOpen(true)
  }

  // Handle template editing
  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template)
    setIsEditorDialogOpen(true)
  }

  // Handle template update
  const handleUpdateTemplate = async (templateData: any): Promise<boolean> => {
    // Note: WhatsApp doesn't allow editing approved templates
    // This would typically create a new template or update a pending one
    return await createTemplate(templateData)
  }

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || template.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesCategory = categoryFilter === "all" || template.category.toLowerCase() === categoryFilter.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case 'PENDING':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case 'REJECTED':
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Get category badge styling  
  const getCategoryBadge = (category: string) => {
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
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {/* App Service Selection */}
          {servicesError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{servicesError}</AlertDescription>
            </Alert>
          )}

          {appServices.length > 0 && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Active WhatsApp Service</label>
                  <Select 
                    value={selectedAppService?.id.toString() || ''} 
                    onValueChange={handleAppServiceChange}
                    disabled={servicesLoading}
                  >
                    <SelectTrigger className="max-w-md">
                      <SelectValue placeholder="Select WhatsApp service" />
                    </SelectTrigger>
                    <SelectContent>
                      {appServices.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{service.phone_number}</span>
                            <Badge variant="outline" className="text-xs">
                              ID: {service.id}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAppServices}
                  disabled={servicesLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${servicesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="browse">Browse Templates</TabsTrigger>
                <TabsTrigger value="manage">Manage Templates</TabsTrigger>
                <TabsTrigger value="broadcast">Broadcast Manager</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                      disabled={!selectedAppService}
                    >
                      <Plus className="h-4 w-4" />
                      Create Custom Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] max-w-3xl overflow-auto pt-6">
                    <DialogHeader>
                      <DialogTitle>Create Message Template</DialogTitle>
                    </DialogHeader>
                    <CreateTemplateForm 
                      onClose={() => setIsCreateDialogOpen(false)} 
                      onSubmit={handleCreateTemplate}
                      loading={templatesLoading}
                      appService={selectedAppService}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Browse Templates Tab */}
            <TabsContent value="browse" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Choose from Ready Templates</h2>
                <p className="text-muted-foreground">
                  Get started quickly with our pre-designed WhatsApp message templates
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={(template) => setSelectedPreviewTemplate(template)}
                    onCreate={createTemplateFromDefault}
                    isCreating={creatingTemplateId === template.id}
                  />
                ))}
              </div>

              {/* WhatsApp Chat Preview Dialog */}
              <Dialog 
                open={!!selectedPreviewTemplate} 
                onOpenChange={() => setSelectedPreviewTemplate(null)}
              >
                <DialogContent className="max-w-md p-0">
                  {selectedPreviewTemplate && (
                    <WhatsAppChatPreview
                      template={selectedPreviewTemplate}
                      onClose={() => setSelectedPreviewTemplate(null)}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Manage Templates Tab */}
            <TabsContent value="manage" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search templates" 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Categories</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="authentication">Authentication</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTemplates}
                  disabled={templatesLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${templatesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Error States */}
              {templatesError && (
                <Alert variant="destructive">
                  <AlertDescription>{templatesError}</AlertDescription>
                </Alert>
              )}

              {!selectedAppService && appServices.length === 0 && !servicesLoading && (
                <Alert>
                  <AlertDescription>
                    Please select a WhatsApp service to view and manage templates.
                  </AlertDescription>
                </Alert>
              )}

              {!selectedAppService && appServices.length > 0 && (
                <Alert>
                  <AlertDescription>
                    No WhatsApp services found. Please connect a WhatsApp Business account first.
                  </AlertDescription>
                </Alert>
              )}

              {/* Templates Table */}
              {selectedAppService && (
                <div className="rounded-md border">
                  {templatesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading templates...</span>
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-muted-foreground mb-4">
                        {templates.length === 0 ? (
                          "No templates found. Create your first template to get started."
                        ) : (
                          "No templates match your current filters."
                        )}
                      </div>
                      {templates.length === 0 && (
                        <Button 
                          onClick={() => {
                            setActiveTab("browse")
                          }}
                          className="gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Browse Templates
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">Template name</th>
                            <th className="px-4 py-3 text-left font-medium">Category</th>
                            <th className="px-4 py-3 text-left font-medium">Language</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Components</th>
                            <th className="px-4 py-3 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTemplates.map((template) => (
                            <tr key={template.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    ID: {template.id}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={getCategoryBadge(template.category)}>
                                  {template.category}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm">{template.language}</div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge className={getStatusBadge(template.status)}>
                                  {template.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm">
                                  {template.components?.length || 0} components
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {template.components?.map(c => c.type).join(', ')}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleViewTemplate(template)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {template.status !== 'APPROVED' && (
                                    <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleDeleteTemplate(template.name)}
                                    disabled={template.status === 'APPROVED'}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="border-t p-4 text-sm text-muted-foreground">
                        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} shown 
                        {filteredTemplates.length !== templates.length && ` (${templates.length} total)`}
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Broadcast Templates Tab */}
            <TabsContent value="broadcast" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Broadcast Your Templates</h2>
                <p className="text-muted-foreground">
                  Send broadcast messages to your contacts using these templates.
                </p>
              </div>

              {selectedAppService ? (
                <BroadcastManager
                  appService={selectedAppService}
                  templates={templates}
                  onSendTest={sendTestTemplate}
                  loading={templatesLoading}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select a WhatsApp service to broadcast templates.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          {/* Template Details Dialog */}
          <TemplateDetailsDialog
            template={selectedTemplate}
            open={isDetailsDialogOpen}
            onClose={() => {
              setIsDetailsDialogOpen(false)
              setSelectedTemplate(null)
            }}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />

          {/* Template Editor Dialog */}
          <TemplateEditor
            template={selectedTemplate}
            open={isEditorDialogOpen}
            onClose={() => {
              setIsEditorDialogOpen(false)
              setSelectedTemplate(null)
            }}
            onSave={handleUpdateTemplate}
            loading={templatesLoading}
          />

          {/* Customize Template Dialog */}
          <CustomizeTemplateDialog
            template={selectedCustomizeTemplate}
            open={isCustomizeDialogOpen}
            onClose={() => {
              setIsCustomizeDialogOpen(false)
              setSelectedCustomizeTemplate(null)
            }}
            onSubmit={handleCustomizedTemplateCreation}
            loading={creatingTemplateId === selectedCustomizeTemplate?.id}
            appService={selectedAppService}
          />
        </main>
      </div>
    </div>
  )
}
