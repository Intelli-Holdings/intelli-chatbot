import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RefreshCw, Search, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { type WhatsAppTemplate, type AppService } from '@/services/whatsapp';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import CreateTemplateForm from '@/components/create-template-form';
import EditTemplateForm from '@/components/edit-template-form';
import TestMessageDialog from '@/components/test-message-dialog';

import { logger } from "@/lib/logger";
interface WhatsAppTemplateManagerProps {
  appService: AppService | null;
  organizationId?: string | null;
}

const WhatsAppTemplateManager: React.FC<WhatsAppTemplateManagerProps> = ({ appService, organizationId }) => {
  const {
    templates,
    loading,
    error,
    refetch,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useWhatsAppTemplates(appService);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WhatsAppTemplate | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [templateToTest, setTemplateToTest] = useState<WhatsAppTemplate | null>(null);

  // Filter templates based on search term, category, and status
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      case 'utility':
        return 'bg-blue-100 text-blue-800';
      case 'authentication':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteTemplate = async (template: WhatsAppTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const success = await deleteTemplate(templateToDelete.id);
      if (success) {
        toast.success("Template deleted successfully!");
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      logger.error('Delete template error:', { error: error instanceof Error ? error.message : String(error) });
      toast.error("Failed to delete template");
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const success = await createTemplate(templateData);
      if (success) {
        setIsCreateDialogOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Create template error:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  };

  const handleUpdateTemplate = async (templateData: any) => {
    if (!selectedTemplate?.id) return false;
    
    try {
      const success = await updateTemplate(selectedTemplate.id, templateData);
      if (success) {
        toast.success("Template updated successfully!");
        setIsEditDialogOpen(false);
        setSelectedTemplate(null);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Update template error:', { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  };

  const copyTemplateId = (templateName: string) => {
    navigator.clipboard.writeText(templateName);
    toast.success("Template name copied to clipboard!");
  };

  const sendTestMessage = (template: WhatsAppTemplate) => {
    setTemplateToTest(template);
    setIsTestDialogOpen(true);
  };

  const renderTemplateDetails = (template: WhatsAppTemplate) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <p className="text-sm text-muted-foreground">{template.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Language</label>
          <p className="text-sm text-muted-foreground">{template.language}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <Badge className={getCategoryColor(template.category)}>
            {template.category}
          </Badge>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <Badge className={getStatusColor(template.status)}>
            {template.status}
          </Badge>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Components</label>
        <div className="mt-2 space-y-2">
          {template.components.map((component, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{component.type}</span>
                {component.format && (
                  <Badge variant="outline">{component.format}</Badge>
                )}
              </div>
              {component.text && (
                <p className="text-sm text-muted-foreground">{component.text}</p>
              )}
              {component.example && Array.isArray(component.example) && (
                <div className="mt-2">
                  <span className="text-xs font-medium">Example:</span>
                  <p className="text-xs text-muted-foreground">
                    {component.example.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!appService) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Templates</CardTitle>
          <CardDescription>
            Please select an app service to view and manage templates
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              WhatsApp Templates
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>
              Manage your WhatsApp message templates for {appService.name}
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Categories</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading templates...</span>
          </div>
        )}

        {!loading && filteredTemplates.length === 0 && (
          <Alert>
            <AlertDescription>
              {templates.length === 0 
                ? "No templates found. Create your first template to get started."
                : "No templates match your current filters."
              }
            </AlertDescription>
          </Alert>
        )}

        {!loading && filteredTemplates.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Components</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(template.status)}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.language}</TableCell>
                  <TableCell>{template.components.length} components</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsViewDialogOpen(true);
                        }}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyTemplateId(template.name)}
                        title="Copy template name"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendTestMessage(template)}
                        title="Send test message"
                        disabled={template.status !== 'APPROVED'}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsEditDialogOpen(true);
                        }}
                        title="Edit template"
                        disabled={template.status === 'APPROVED'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* View Template Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template Details</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.name} - {selectedTemplate?.category}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && renderTemplateDetails(selectedTemplate)}
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new WhatsApp message template that will be submitted to Meta for approval
              </DialogDescription>
            </DialogHeader>
            <CreateTemplateForm 
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={handleCreateTemplate}
              loading={loading}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Edit template: {selectedTemplate?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <EditTemplateForm 
                template={selectedTemplate}
                onClose={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTemplate(null);
                }}
                onSubmit={handleUpdateTemplate}
                loading={loading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
                <DialogDescription>
                Are you sure you want to delete the template &quot;{templateToDelete?.name}&quot;? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setTemplateToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteTemplate}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Message Dialog */}
        <TestMessageDialog
          template={templateToTest}
          appService={appService}
          organizationId={organizationId}
          isOpen={isTestDialogOpen}
          onClose={() => {
            setIsTestDialogOpen(false);
            setTemplateToTest(null);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default WhatsAppTemplateManager;
