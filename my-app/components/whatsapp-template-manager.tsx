import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type WhatsAppTemplate, type AppService } from '@/services/whatsapp';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';

interface WhatsAppTemplateManagerProps {
  appService: AppService | null;
}

const WhatsAppTemplateManager: React.FC<WhatsAppTemplateManagerProps> = ({ appService }) => {
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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

  const handleDeleteTemplate = async (templateName: string) => {
    if (confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      const success = await deleteTemplate(templateName);
      if (success) {
        // Template list will be refetched automatically
      }
    }
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
              <SelectItem value="all">All Categories</SelectItem>
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
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          // TODO: Implement edit functionality
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.name)}
                        className="text-red-600 hover:text-red-700"
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new WhatsApp message template
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <Alert>
                <AlertDescription>
                  Template creation functionality will be implemented here. 
                  You can create templates directly in Meta Business Manager for now.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTemplateManager;
