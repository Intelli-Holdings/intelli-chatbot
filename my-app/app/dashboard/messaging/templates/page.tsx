"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WhatsAppService,
  type AppService,
  type WhatsAppTemplate,
} from "@/services/whatsapp";
import { DefaultTemplate, defaultTemplates } from "@/data/default-templates";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTemplateForm from "@/components/create-template-form";
import { DeleteTemplateDialog } from "@/components/delete-template-dialog";

import useActiveOrganizationId from "@/hooks/use-organization-id";
import { TemplateCard } from "@/components/template-card";
import { WhatsAppChatPreview } from "@/components/whatsapp-chat-preview";

import { TemplateDetailsDialog } from "@/components/template-details-dialog";
import { TemplateEditor } from "@/components/template-editor";
import { CustomizeTemplateDialog } from "@/components/customize-template-dialog";
import FlowManager from '@/components/flows-manager';

export default function TemplatesPage() {
  const organizationId = useActiveOrganizationId();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] =
    useState<DefaultTemplate | null>(null);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppTemplate | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);
  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false);
  const [selectedCustomizeTemplate, setSelectedCustomizeTemplate] =
    useState<DefaultTemplate | null>(null);

  // State for app services and templates
  const [appServices, setAppServices] = useState<AppService[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedAppService, setSelectedAppService] =
    useState<AppService | null>(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateToDelete, setTemplateToDelete] =
    useState<WhatsAppTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const metaBusinessManagerUrl = selectedAppService?.whatsapp_business_account_id
    ? `https://business.facebook.com/wa/manage/home/?waba_id=${encodeURIComponent(
        selectedAppService.whatsapp_business_account_id
      )}`
    : null;

  // Fetch app services for organization
  const fetchAppServices = useCallback(async () => {
    if (!organizationId) {
      setServicesError(
        "Organization ID not available. Please ensure you have created an organization."
      );
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      // Use the local API route which handles the backend call
      const apiUrl = `/api/channels/whatsapp/org/${organizationId}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch app services: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const services = Array.isArray(data)
        ? data
        : data.appServices || data || [];

      setAppServices(services);

      // Auto-select the first app service if available and none is selected
      if (services.length > 0 && !selectedAppService) {
        setSelectedAppService(services[0]);
      } else if (services.length === 0) {
        setServicesError(
          "No WhatsApp services found for this organization. Please configure a WhatsApp Business account first."
        );
      }
    } catch (err) {
      let errorMessage = "Failed to fetch app services";

      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch")) {
          errorMessage =
            "Unable to connect to the API server. Please ensure the your network connection is stable.";
        } else {
          errorMessage = err.message;
        }
      }

      setServicesError(errorMessage);
      console.error("Error fetching app services:", err);
    } finally {
      setServicesLoading(false);
    }
  }, [organizationId, selectedAppService]);

  // Fetch WhatsApp templates from backend (optionally syncing Meta)
  const fetchTemplates = useCallback(async (options?: { sync?: boolean }) => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError("App service configuration not available");
      return false;
    }

    setTemplatesLoading(true);
    setTemplatesError(null);

    try {
      const data = await WhatsAppService.fetchTemplates(
        selectedAppService as AppService,
        {
          organizationId: organizationId ?? undefined,
          sync: options?.sync,
        }
      );
      setTemplates(data || []);
      if (options?.sync) {
        setLastSyncedAt(new Date());
      }
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch templates";
      setTemplatesError(errorMessage);
      console.error("Error fetching templates:", err);
      return false;
    } finally {
      setTemplatesLoading(false);
    }
  }, [organizationId, selectedAppService]);

  const syncTemplates = useCallback(async () => {
    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError("App service configuration not available");
      return;
    }

    setSyncingTemplates(true);
    const success = await fetchTemplates({ sync: true });
    if (success) {
      toast.success("Templates synced from Meta");
    }
    setSyncingTemplates(false);
  }, [fetchTemplates, selectedAppService]);

  // Create template function from default template
  const createTemplateFromDefault = useCallback(
    async (defaultTemplate: DefaultTemplate): Promise<boolean> => {
      if (!selectedAppService?.whatsapp_business_account_id) {
        setTemplatesError("App service configuration not available");
        return false;
      }

      // Check if template requires media or has variables
      const requiresCustomization = checkTemplateRequiresCustomization(defaultTemplate);

      if (requiresCustomization) {
        // Open customization dialog
        setSelectedCustomizeTemplate(defaultTemplate);
        setIsCustomizeDialogOpen(true);
        return true;
      }

      // Create template directly if no customization needed
      setCreatingTemplateId(defaultTemplate.id);

      try {
        const templateData = {
          name: defaultTemplate.name.toLowerCase().replace(/\s+/g, "_"),
          category: defaultTemplate.category,
          components: defaultTemplate.components,
          language: defaultTemplate.language || "en_US",
        };

        await WhatsAppService.createTemplate(
          selectedAppService as AppService,
          templateData,
          { organizationId: organizationId ?? undefined }
        );
        await fetchTemplates();
        toast.success("Template created successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create template";
        setTemplatesError(errorMessage);
        toast.error(errorMessage);
        console.error("Error creating template:", err);
        return false;
      } finally {
        setCreatingTemplateId(null);
      }
    },
    [organizationId, selectedAppService, fetchTemplates]
  );

  // Check if template requires customization
  const checkTemplateRequiresCustomization = (
    template: DefaultTemplate
  ): boolean => {
    // Check for media requirements
    const headerComponent = template.components?.find(
      (c) => c.type === "HEADER"
    );
    if (
      headerComponent &&
      headerComponent.format &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerComponent.format)
    ) {
      return true;
    }

    // Check for variables in body and header
    const hasVariables = template.components?.some((component) => {
      return component.text && /\{\{\d+\}\}/.test(component.text);
    });

    // Check for URL button variables
    const buttonsComponent = template.components?.find(c => c.type === "BUTTONS");
    const hasUrlButtonVariables = buttonsComponent?.buttons?.some(button => 
      button.type === 'URL' && button.url?.includes('{{')
    );

    return hasVariables || hasUrlButtonVariables || false;
  };

  // Handle customized template creation
  const handleCustomizedTemplateCreation = useCallback(
    async (templateData: any, customizations: any): Promise<boolean> => {
      if (!selectedAppService?.whatsapp_business_account_id) {
        setTemplatesError("App service configuration not available");
        return false;
      }

      setCreatingTemplateId(selectedCustomizeTemplate?.id || null);

      try {
        const finalTemplateData = {
          ...templateData,
          customVariableValues: customizations,
        };
        await WhatsAppService.createTemplate(
          selectedAppService as AppService,
          finalTemplateData,
          { organizationId: organizationId ?? undefined }
        );
        await fetchTemplates();
        toast.success(
          "Template created successfully with your customizations!"
        );
        setIsCustomizeDialogOpen(false);
        setSelectedCustomizeTemplate(null);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create template";
        setTemplatesError(errorMessage);
        toast.error(errorMessage);
        console.error("Error creating template:", err);
        return false;
      } finally {
        setCreatingTemplateId(null);
      }
    },
    [organizationId, selectedAppService, fetchTemplates, selectedCustomizeTemplate]
  );

  // Create template function
  const createTemplate = useCallback(
    async (templateData: any): Promise<boolean> => {
      if (!selectedAppService?.whatsapp_business_account_id) {
        setTemplatesError("App service configuration not available");
        return false;
      }

      try {
        setTemplatesLoading(true);

        // Use WhatsAppService to create templates via Meta Graph API directly
        await WhatsAppService.createTemplate(
          selectedAppService as AppService,
          templateData,
          { organizationId: organizationId ?? undefined }
        );

        // Refetch templates after creation
        await fetchTemplates();
        toast.success("Template created successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create template";
        setTemplatesError(errorMessage);
        toast.error(errorMessage);
        console.error("Error creating template:", err);
        return false;
      } finally {
        setTemplatesLoading(false);
      }
    },
    [organizationId, selectedAppService, fetchTemplates]
  );

  // Delete template function
  const deleteTemplate = useCallback(
    async (templateId: string): Promise<boolean> => {
      if (!selectedAppService?.whatsapp_business_account_id) {
        setTemplatesError("App service configuration not available");
        return false;
      }

      try {
        setTemplatesLoading(true);

        // Use WhatsAppService to delete templates via Meta Graph API directly
        await WhatsAppService.deleteTemplate(
          selectedAppService as AppService,
          templateId,
          { organizationId: organizationId ?? undefined }
        );

        // Refetch templates after deletion
        await fetchTemplates();
        toast.success("Template deleted successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete template";
        setTemplatesError(errorMessage);
        toast.error(errorMessage);
        console.error("Error deleting template:", err);
        return false;
      } finally {
        setTemplatesLoading(false);
      }
    },
    [organizationId, selectedAppService, fetchTemplates]
  );

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
    const service = appServices.find((s) => s.id.toString() === serviceId);
    setSelectedAppService(service || null);
  };

  // Handle template creation
  const handleCreateTemplate = async (templateData: any): Promise<boolean> => {
    const success = await createTemplate(templateData);
    if (success) {
      setIsCreateDialogOpen(false);
    }
    return success;
  };

  // Handle template deletion
  const handleDeleteTemplate = (template: WhatsAppTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  // Handle successful deletion
  const handleDeleteSuccess = async () => {
    // Refresh templates list
    await fetchTemplates();
    setIsDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  // Handle template viewing
  const handleViewTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsDetailsDialogOpen(true);
  };

  // Handle template editing
  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsEditorDialogOpen(true);
  };

  // Handle template update
  const handleUpdateTemplate = async (templateData: any): Promise<boolean> => {
    if (!selectedTemplate?.id) {
      toast.error("Select a template to update");
      return false;
    }

    if (!selectedAppService?.whatsapp_business_account_id) {
      setTemplatesError("App service configuration not available");
      return false;
    }

    try {
      setTemplatesLoading(true);
      await WhatsAppService.updateTemplate(
        selectedTemplate.id,
        selectedAppService as AppService,
        templateData,
        { organizationId: organizationId ?? undefined }
      );
      await fetchTemplates();
      toast.success("Template updated successfully!");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update template";
      setTemplatesError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating template:", err);
      return false;
    } finally {
      setTemplatesLoading(false);
    }
  };

  const normalizeStatus = (status: string) => {
    const value = status.toUpperCase();
    if (value.includes("REJECT")) return "REJECTED";
    if (value.includes("PENDING") || value.includes("REVIEW")) return "PENDING";
    if (value.includes("APPROVED") || value.startsWith("ACTIVE")) return "APPROVED";
    return value;
  };

  const formatStatusLabel = (status: string) => {
    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const statusCounts = templates.reduce(
    (acc, template) => {
      acc.total += 1;
      const bucket = normalizeStatus(template.status || "");
      if (bucket === "APPROVED") acc.approved += 1;
      if (bucket === "PENDING") acc.pending += 1;
      if (bucket === "REJECTED") acc.rejected += 1;
      return acc;
    },
    { total: 0, approved: 0, pending: 0, rejected: 0 }
  );

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      normalizeStatus(template.status) === statusFilter.toUpperCase();
    const matchesCategory =
      categoryFilter === "all" ||
      template.category.toUpperCase() === categoryFilter.toUpperCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (normalizeStatus(status)) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Get category badge styling
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "MARKETING":
        return "bg-blue-100 text-blue-800";
      case "UTILITY":
        return "bg-purple-100 text-purple-800";
      case "AUTHENTICATION":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
                  <label className="text-sm font-medium">
                    Active WhatsApp Service
                  </label>
                  <Select
                    value={selectedAppService?.id.toString() || ""}
                    onValueChange={handleAppServiceChange}
                    disabled={servicesLoading}
                  >
                    <SelectTrigger className="max-w-md">
                      <SelectValue placeholder="Select WhatsApp service" />
                    </SelectTrigger>
                    <SelectContent>
                      {appServices.map((service) => (
                        <SelectItem
                          key={service.id}
                          value={service.id.toString()}
                        >
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
                  <RefreshCw
                    className={`h-4 w-4 ${servicesLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
              <TabsTrigger value="browse">Default Templates</TabsTrigger>
              <TabsTrigger value="create">Create Template</TabsTrigger>
              <TabsTrigger value="manage">Manage Templates</TabsTrigger>
              <TabsTrigger value="flows">Flows Manager</TabsTrigger>
            </TabsList>
          </div>

            {/* Browse Templates Tab */}
            <TabsContent value="browse" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  Choose from Ready Templates
                </h2>
                <p className="text-muted-foreground">
                  Get started quickly with our pre-designed WhatsApp message
                  templates
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={(template) =>
                      setSelectedPreviewTemplate(template)
                    }
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

            {/* Create Template Tab */}
            <TabsContent value="create" className="space-y-6">
            <CreateTemplateForm
              appService={selectedAppService}
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={handleCreateTemplate}
              organizationId={organizationId}
            />
            </TabsContent>

            {/* Manage Templates Tab */}
            <TabsContent value="manage" className="space-y-6">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Template Library</h3>
                    <p className="text-sm text-muted-foreground">
                      Synced templates stored for this organization.
                    </p>
                    {lastSyncedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last synced {lastSyncedAt.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncTemplates}
                      disabled={syncingTemplates || templatesLoading}
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${syncingTemplates ? "animate-spin" : ""}`}
                      />
                      {syncingTemplates ? "Syncing..." : "Sync Meta"}
                    </Button>
                    {metaBusinessManagerUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={metaBusinessManagerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Update in Meta
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("create")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Template
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Total templates</p>
                      <p className="text-2xl font-semibold">{statusCounts.total}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Approved</p>
                      <p className="text-2xl font-semibold">{statusCounts.approved}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-2xl font-semibold">{statusCounts.pending}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-semibold">{statusCounts.rejected}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Categories</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error States */}
              {templatesError && (
                <Alert variant="destructive">
                  <AlertDescription>{templatesError}</AlertDescription>
                </Alert>
              )}

              {!selectedAppService &&
                appServices.length === 0 &&
                !servicesLoading && (
                  <Alert>
                    <AlertDescription>
                      Please select a WhatsApp service to view and manage
                      templates.
                    </AlertDescription>
                  </Alert>
                )}

              {!selectedAppService && appServices.length > 0 && (
                <Alert>
                  <AlertDescription>
                    No WhatsApp services found. Please connect a WhatsApp
                    Business account first.
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
                        {templates.length === 0
                          ? "No templates found. Create your first template to get started."
                          : "No templates match your current filters."}
                      </div>
                      {templates.length === 0 && (
                        <Button
                          onClick={() => {
                            setActiveTab("browse");
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
                            <th className="px-4 py-3 text-left font-medium">
                              Template name
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Category
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Language
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Components
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTemplates.map((template) => (
                            <tr
                              key={template.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">
                                    {template.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    ID: {template.id}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  className={getCategoryBadge(
                                    template.category
                                  )}
                                >
                                  {template.category}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm">
                                  {template.language}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  className={getStatusBadge(template.status)}
                                >
                                  {formatStatusLabel(template.status)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm">
                                  {template.components?.length || 0} components
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {template.components
                                    ?.map((c) => c.type)
                                    .join(", ")}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewTemplate(template)}
                                    title="View template"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {normalizeStatus(template.status) !== "APPROVED" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleEditTemplate(template)
                                      }
                                      title="Edit template"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteTemplate(template)
                                    }
                                    className="text-destructive hover:text-destructive"
                                    title="Delete template"
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
                        {filteredTemplates.length} template
                        {filteredTemplates.length !== 1 ? "s" : ""} shown
                        {filteredTemplates.length !== templates.length &&
                          ` (${templates.length} total)`}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Delete Confirmation Dialog */}
              <DeleteTemplateDialog
                template={templateToDelete}
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                  setIsDeleteDialogOpen(false);
                  setTemplateToDelete(null);
                }}
                onSuccess={handleDeleteSuccess}
                appService={selectedAppService}
                organizationId={organizationId}
              />
            </TabsContent>

            <TabsContent value="flows">
              <FlowManager appService={selectedAppService} />
            </TabsContent>
          </Tabs>

       

          {/* Template Details Dialog */}
          <TemplateDetailsDialog
            template={selectedTemplate}
            open={isDetailsDialogOpen}
            onClose={() => {
              setIsDetailsDialogOpen(false);
              setSelectedTemplate(null);
            }}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />

          {/* Template Editor Dialog */}
          <TemplateEditor
            template={selectedTemplate}
            open={isEditorDialogOpen}
            onClose={() => {
              setIsEditorDialogOpen(false);
              setSelectedTemplate(null);
            }}
            onSave={handleUpdateTemplate}
            loading={templatesLoading}
          />
          {/* Customize Template Dialog */}
          <CustomizeTemplateDialog
            template={selectedCustomizeTemplate}
            open={isCustomizeDialogOpen}
            onClose={() => {
              setIsCustomizeDialogOpen(false);
              setSelectedCustomizeTemplate(null);
            }}
            onSubmit={handleCustomizedTemplateCreation}
            loading={creatingTemplateId === selectedCustomizeTemplate?.id}
            appService={selectedAppService}
            organizationId={organizationId}
          />
        </main>
      </div>
    </div>
  );
}
