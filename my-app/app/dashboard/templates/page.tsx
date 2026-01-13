"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WhatsAppService,
  type AppService,
  type WhatsAppTemplate,
} from "@/services/whatsapp";
import { DefaultTemplate, defaultTemplates } from "@/data/default-templates";
import {
  RefreshCw,
  Plus,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreateTemplateForm from "@/components/create-template-form";
import { DeleteTemplateDialog } from "@/components/delete-template-dialog";
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { TemplateCard } from "@/components/template-card";
import { WhatsAppChatPreview } from "@/components/whatsapp-chat-preview";
import { TemplateDetailsDialog } from "@/components/template-details-dialog";
import { TemplateEditor } from "@/components/template-editor";
import { CustomizeTemplateDialog } from "@/components/customize-template-dialog";
import { TemplateLibraryView } from "@/components/template-library-view";

export default function TemplatesPage() {
  const organizationId = useActiveOrganizationId();
  const [activeTab, setActiveTab] = useState("browse");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  // Preview states
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<DefaultTemplate | null>(null);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);

  // Template management states
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [selectedCustomizeTemplate, setSelectedCustomizeTemplate] = useState<DefaultTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<WhatsAppTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // App services and templates
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedAppService, setSelectedAppService] = useState<AppService | null>(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Fetch app services
  const fetchAppServices = useCallback(async () => {
    if (!organizationId) {
      setServicesError("Organization ID not available. Please ensure you have created an organization.");
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      const services = await WhatsAppService.fetchAppServices(organizationId);
      setAppServices(services);

      if (services.length > 0 && !selectedAppService) {
        const defaultService = services.find((s) => s.is_default) || services[0];
        setSelectedAppService(defaultService);
      }
    } catch (error: any) {
      console.error("Error fetching app services:", error);
      setServicesError(error.message || "Failed to fetch app services");
      toast.error("Failed to load app services");
    } finally {
      setServicesLoading(false);
    }
  }, [organizationId, selectedAppService]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    if (!organizationId || !selectedAppService) return;

    setTemplatesLoading(true);
    setTemplatesError(null);

    try {
      const fetchedTemplates = await WhatsAppService.fetchTemplates(
        selectedAppService,
        { organizationId }
      );
      setTemplates(fetchedTemplates);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      setTemplatesError(error.message || "Failed to fetch templates");
      toast.error("Failed to load templates");
    } finally {
      setTemplatesLoading(false);
    }
  }, [organizationId, selectedAppService]);

  // Sync templates from Meta
  const syncTemplates = async () => {
    if (!organizationId || !selectedAppService) {
      toast.error("Please select an app service first");
      return;
    }

    setSyncingTemplates(true);
    try {
      await WhatsAppService.fetchTemplates(selectedAppService, { organizationId, sync: true });
      toast.success("Templates synced successfully");
      setLastSyncedAt(new Date());
      await fetchTemplates();
    } catch (error: any) {
      console.error("Error syncing templates:", error);
      toast.error(error.message || "Failed to sync templates");
    } finally {
      setSyncingTemplates(false);
    }
  };

  // Create template from default
  const createTemplateFromDefault = async (template: DefaultTemplate) => {
    if (!selectedAppService) {
      toast.error("Please select an app service first");
      return;
    }

    // Check if template requires customization
    const headerComponent = template.components?.find((c) => c.type === "HEADER");
    const requiresMedia = headerComponent && ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerComponent.format || "");

    const bodyComponent = template.components?.find((c) => c.type === "BODY");
    const hasVariables = bodyComponent?.text?.includes("{{") || headerComponent?.text?.includes("{{");

    if (requiresMedia || hasVariables) {
      setSelectedCustomizeTemplate(template);
      setIsCustomizeDialogOpen(true);
      return;
    }

    // Create directly if no customization needed
    setCreatingTemplateId(template.id);
    try {
      await WhatsAppService.createTemplate(selectedAppService, {
        name: template.name,
        category: template.category,
        language: template.language,
        components: template.components,
      }, { organizationId: organizationId! });
      toast.success(`Template "${template.name}" created successfully!`);
      await fetchTemplates();
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast.error(error.message || "Failed to create template");
    } finally {
      setCreatingTemplateId(null);
    }
  };

  // Handle customized template creation
  const handleCustomizedTemplateCreation = async (
    templateData: any,
    customizations: any
  ): Promise<boolean> => {
    if (!selectedAppService) {
      toast.error("Please select an app service first");
      return false;
    }

    setCreatingTemplateId(selectedCustomizeTemplate?.id || null);

    try {
      const finalTemplateData = {
        ...templateData,
        customVariableValues: customizations,
      };

      await WhatsAppService.createTemplate(selectedAppService, finalTemplateData, {
        organizationId: organizationId!,
      });
      toast.success("Template created successfully with your customizations!");
      setIsCustomizeDialogOpen(false);
      setSelectedCustomizeTemplate(null);
      await fetchTemplates();
      return true;
    } catch (error: any) {
      console.error("Error creating customized template:", error);
      toast.error(error.message || "Failed to create template");
      return false;
    } finally {
      setCreatingTemplateId(null);
    }
  };

  // Handle template creation
  const handleCreateTemplate = async (templateData: any): Promise<boolean> => {
    if (!selectedAppService) {
      toast.error("Please select an app service first");
      return false;
    }

    try {
      await WhatsAppService.createTemplate(selectedAppService, templateData, { organizationId: organizationId! });
      toast.success("Template created successfully!");
      setIsCreateFormOpen(false);
      await fetchTemplates();
      return true;
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast.error(error.message || "Failed to create template");
      return false;
    }
  };

  // Update template
  const handleUpdateTemplate = async (updatedTemplate: WhatsAppTemplate): Promise<boolean> => {
    if (!selectedAppService) {
      toast.error("Please select an app service first");
      return false;
    }

    try {
      await WhatsAppService.updateTemplate(updatedTemplate.id!, selectedAppService, updatedTemplate, { organizationId: organizationId! });
      toast.success("Template updated successfully!");
      await fetchTemplates();
      setIsEditorDialogOpen(false);
      return true;
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error(error.message || "Failed to update template");
      return false;
    }
  };

  // Effects
  useEffect(() => {
    fetchAppServices();
  }, [fetchAppServices]);

  useEffect(() => {
    if (selectedAppService) {
      fetchTemplates();
    }
  }, [selectedAppService, fetchTemplates]);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Templates</h1>
          <p className="text-muted-foreground mt-1">
            Browse, create, and manage your WhatsApp message templates
          </p>
        </div>
      </div>

      {/* App Service Selector */}
      {servicesError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{servicesError}</AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="flex-1">
            <Select
              value={selectedAppService?.phone_number || ""}
              onValueChange={(value) => {
                const service = appServices.find((s) => s.phone_number === value);
                setSelectedAppService(service || null);
              }}
              disabled={servicesLoading || appServices.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select WhatsApp Number" />
              </SelectTrigger>
              <SelectContent>
                {appServices.map((service) => (
                  <SelectItem key={service.phone_number} value={service.phone_number}>
                    <div className="flex items-center gap-2">
                      <span>{service.phone_number}</span>
                      {service.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
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
            <RefreshCw className={`h-4 w-4 ${servicesLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="browse">
              <Sparkles className="h-4 w-4 mr-2" />
              Browse & Create
            </TabsTrigger>
            <TabsTrigger value="manage">
              Manage Templates
            </TabsTrigger>
          </TabsList>

          {activeTab === "browse" && (
            <Button onClick={() => setIsCreateFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Template
            </Button>
          )}

          {activeTab === "manage" && (
            <Button onClick={syncTemplates} disabled={syncingTemplates || !selectedAppService}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncingTemplates ? "animate-spin" : ""}`} />
              Sync from Meta
            </Button>
          )}
        </div>

        {/* Browse & Create Tab */}
        <TabsContent value="browse" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Choose from Ready Templates
            </h2>
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
        </TabsContent>

        {/* Manage Templates Tab */}
        <TabsContent value="manage" className="space-y-6">
          {templatesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{templatesError}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/20 p-4">
                <div>
                  <h3 className="text-lg font-semibold">Template Library</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage your WhatsApp templates with grid or list view
                  </p>
                  {lastSyncedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last synced {lastSyncedAt.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <TemplateLibraryView
                templates={templates}
                loading={templatesLoading}
                appService={selectedAppService}
                organizationId={organizationId}
                onDelete={(template) => {
                  setTemplateToDelete(template);
                  setIsDeleteDialogOpen(true);
                }}
                onEdit={(template) => {
                  setSelectedTemplate(template);
                  setIsEditorDialogOpen(true);
                }}
                onView={(template) => {
                  setSelectedTemplate(template);
                  setIsDetailsDialogOpen(true);
                }}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={!!selectedPreviewTemplate} onOpenChange={() => setSelectedPreviewTemplate(null)}>
        <DialogContent className="max-w-md p-0">
          {selectedPreviewTemplate && (
            <WhatsAppChatPreview
              template={selectedPreviewTemplate}
              onClose={() => setSelectedPreviewTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CreateTemplateForm
            appService={selectedAppService}
            onClose={() => setIsCreateFormOpen(false)}
            onSubmit={handleCreateTemplate}
            organizationId={organizationId}
          />
        </DialogContent>
      </Dialog>

      <CustomizeTemplateDialog
        open={isCustomizeDialogOpen}
        template={selectedCustomizeTemplate}
        appService={selectedAppService}
        organizationId={organizationId}
        onClose={() => {
          setIsCustomizeDialogOpen(false);
          setSelectedCustomizeTemplate(null);
        }}
        onSubmit={handleCustomizedTemplateCreation}
        loading={creatingTemplateId === selectedCustomizeTemplate?.id}
      />

      <TemplateDetailsDialog
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        template={selectedTemplate}
      />

      {selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          open={isEditorDialogOpen}
          onClose={() => setIsEditorDialogOpen(false)}
          onSave={handleUpdateTemplate}
        />
      )}

      <DeleteTemplateDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        template={templateToDelete}
        onSuccess={() => {
          fetchTemplates();
          setTemplateToDelete(null);
        }}
        appService={selectedAppService}
        organizationId={organizationId}
      />
    </div>
  );
}
