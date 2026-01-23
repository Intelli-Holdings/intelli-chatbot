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
import { Card, CardContent } from "@/components/ui/card";
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
import { useWhatsAppAnalytics } from "@/hooks/use-whatsapp-analytics";
import { TemplateCard } from "@/components/template-card";
import { WhatsAppChatPreview } from "@/components/whatsapp-chat-preview";
import { TemplateDetailsDialog } from "@/components/template-details-dialog";
import { TemplateEditor } from "@/components/template-editor";
import { CustomizeTemplateDialog } from "@/components/customize-template-dialog";
import { TemplateLibraryView } from "@/components/template-library-view";

export default function TemplatesPage() {
  const organizationId = useActiveOrganizationId();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [templatesTab, setTemplatesTab] = useState("library");

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
  const metaBusinessManagerUrl = selectedAppService?.whatsapp_business_account_id
    ? `https://business.facebook.com/wa/manage/home/?waba_id=${encodeURIComponent(
        selectedAppService.whatsapp_business_account_id
      )}`
    : null;

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useWhatsAppAnalytics(selectedAppService, 30);

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

  const primaryProfile = analytics?.phoneNumberProfiles?.[0];
  const displayPhoneNumber = primaryProfile?.display_phone_number || selectedAppService?.phone_number;

  const formatMetric = (value?: number, type: "number" | "currency" = "number") => {
    if (!selectedAppService || analyticsLoading) {
      return "—";
    }
    if (type === "currency") {
      return `$${(value ?? 0).toFixed(2)}`;
    }
    return value?.toLocaleString() || "0";
  };

  const renderQualityBadge = (rating?: string) => {
    if (!rating) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Unknown</Badge>;
    }
    const normalized = rating.toUpperCase();
    const classes =
      normalized === "GREEN"
        ? "bg-green-100 text-green-800 border-green-200"
        : normalized === "YELLOW"
          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
          : normalized === "RED"
            ? "bg-red-100 text-red-800 border-red-200"
            : "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <Badge variant="outline" className={classes}>
        {normalized.charAt(0) + normalized.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const renderTierBadge = (tier?: string) => {
    const normalized = tier?.toUpperCase() || "";
    const label =
      normalized === "TIER_4"
        ? "Unlimited"
        : normalized === "TIER_3"
          ? "100K/day"
          : normalized === "TIER_2"
            ? "10K/day"
            : normalized === "TIER_1"
              ? "1K/day"
              : "Unknown";
    const classes =
      normalized === "TIER_4"
        ? "bg-purple-100 text-purple-800 border-purple-200"
        : normalized === "TIER_3"
          ? "bg-blue-100 text-blue-800 border-blue-200"
          : normalized === "TIER_2"
            ? "bg-green-100 text-green-800 border-green-200"
            : normalized === "TIER_1"
              ? "bg-gray-100 text-gray-800 border-gray-200"
              : "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <Badge variant="outline" className={classes}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">WhatsApp Templates</h1>
              {selectedAppService?.phone_number && (
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedAppService.phone_number}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Browse, create, and manage your WhatsApp message templates
            </p>
          </div>

          {!servicesError && (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Select
                value={selectedAppService?.phone_number || ""}
                onValueChange={(value) => {
                  const service = appServices.find((s) => s.phone_number === value);
                  setSelectedAppService(service || null);
                }}
                disabled={servicesLoading || appServices.length === 0}
              >
                <SelectTrigger className="w-full sm:w-[260px]">
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
        </div>

        {servicesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{servicesError}</AlertDescription>
          </Alert>
        )}
      </div>

      <section id="overview" className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Account Overview</h2>
            <p className="text-sm text-muted-foreground">
              Key WhatsApp performance metrics for the selected number.
            </p>
          </div>
          {metaBusinessManagerUrl && (
            <Button
              size="sm"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              asChild
            >
              <a
                href={metaBusinessManagerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage in Meta
              </a>
            </Button>
          )}
        </div>

        {analyticsError && selectedAppService && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{analyticsError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Conversations</p>
              <p className="text-xl font-semibold">{formatMetric(analytics?.totalConversations)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Free Tier Conversations</p>
              <p className="text-xl font-semibold">{formatMetric(analytics?.freeTierConversations)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Business Initiated</p>
              <p className="text-xl font-semibold">{formatMetric(analytics?.businessInitiatedConversations)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Approximate Charges</p>
              <p className="text-xl font-semibold">{formatMetric(analytics?.approximateCharges, "currency")}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Phone Number</p>
                <p className="font-medium">{!selectedAppService || analyticsLoading ? "—" : displayPhoneNumber || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Quality Rating</p>
                {selectedAppService ? renderQualityBadge(primaryProfile?.quality_rating) : renderQualityBadge()}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Messaging Tier</p>
                {selectedAppService ? renderTierBadge(primaryProfile?.messaging_limit?.tier) : renderTierBadge()}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Daily Limit</p>
                <p className="font-medium">
                  {!selectedAppService || analyticsLoading
                    ? "—"
                    : primaryProfile?.messaging_limit?.max?.toLocaleString() || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="templates" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Templates</h3>
            <p className="text-sm text-muted-foreground">
              Manage your synced library or start from ready-to-use templates.
            </p>
          </div>
        </div>

        <Tabs value={templatesTab} onValueChange={setTemplatesTab} className="space-y-4">
          <TabsList className="h-9">
            <TabsTrigger value="library">Template Library</TabsTrigger>
            <TabsTrigger value="starter">Starter Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-base font-semibold">Template Library</h4>
                <p className="text-sm text-muted-foreground">
                  View and manage your WhatsApp templates with grid or list view.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {lastSyncedAt && (
                  <span className="text-xs text-muted-foreground">
                    Last synced {lastSyncedAt.toLocaleString()}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncTemplates}
                  disabled={syncingTemplates || !selectedAppService}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncingTemplates ? "animate-spin" : ""}`} />
                  Sync from Meta
                </Button>
                <Button size="sm" onClick={() => setIsCreateFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Template
                </Button>
              </div>
            </div>

            {templatesError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{templatesError}</AlertDescription>
              </Alert>
            ) : (
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
            )}
          </TabsContent>

          <TabsContent value="starter" className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-base font-semibold">Starter Templates</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get started quickly with pre-designed WhatsApp message templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </Tabs>
      </section>

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
