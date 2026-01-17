"use client";

import React, { useState } from 'react';
import { Search, Filter, Eye, Send, Plus, MessageSquare, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import TestMessageDialog from '@/components/test-message-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface TemplateSelectorProps {
  appService: any;
  mode?: 'select' | 'browse';
  onSelect?: (template: any) => void;
  organizationId?: string | null;
}

export default function TemplateSelector({ appService, mode = 'browse', onSelect, organizationId }: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [templateToTest, setTemplateToTest] = useState<any>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { templates, loading, error } = useWhatsAppTemplates(appService);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.components?.some((c: any) => 
                           c.text?.toLowerCase().includes(searchTerm.toLowerCase())
                         ) || false);
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(templates.map(t => t.category))).filter(Boolean);

  const handleTemplateSelect = (template: any) => {
    if (mode === 'select' && onSelect) {
      onSelect(template);
    } else {
      setSelectedTemplate(template);
      setShowPreview(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderTemplatePreview = (template: any) => {
    if (!template.components) return null;

    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        {template.components.map((component: any, index: number) => (
          <div key={index}>
            {component.type === 'HEADER' && (
              <div className="font-semibold text-sm">
                {component.format === 'IMAGE' ? (
                  <div className="flex items-center gap-2">
                    <span>📷</span>
                    <span>Image Header</span>
                  </div>
                ) : (
                  component.text
                )}
              </div>
            )}
            {component.type === 'BODY' && (
              <div className="text-sm">
                {component.text?.replace(/\{\{(\d+)\}\}/g, (match: string, num: string) => 
                  `[Parameter ${num}]`
                )}
              </div>
            )}
            {component.type === 'FOOTER' && component.text && (
              <div className="text-xs text-muted-foreground">
                {component.text}
              </div>
            )}
            {component.type === 'BUTTONS' && component.buttons && (
              <div className="space-y-1">
                {component.buttons.map((button: any, btnIndex: number) => (
                  <div
                    key={btnIndex}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    🔗 {button.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-2">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-2"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="px-2"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Templates Display */}
      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : error ? (
        <Alert>
          <AlertDescription>
            Error loading templates: {error}
          </AlertDescription>
        </Alert>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first WhatsApp template to get started'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge className={getStatusColor(template.status)}>
                    {template.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{template.category}</Badge>
                  <Badge variant="secondary">{template.language}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.components?.slice(0, 2).map((component: any, index: number) => (
                    <div key={index} className="text-sm">
                      {component.type === 'BODY' && (
                        <p className="line-clamp-2 text-muted-foreground">
                          {component.text?.substring(0, 100)}
                          {component.text && component.text.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {template.status === 'APPROVED' && mode === 'browse' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle send test message
                          }}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {mode === 'select' && (
                      <Button size="sm">Select</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => {
                const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
                return (
                  <TableRow
                    key={template.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <TableCell>
                      <div className="font-medium">{template.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{template.language}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                        {bodyComponent?.text?.substring(0, 100)}
                        {bodyComponent?.text && bodyComponent.text.length > 100 ? '...' : ''}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {template.status === 'APPROVED' && mode === 'browse' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle send test message
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {mode === 'select' && (
                          <Button size="sm">Select</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Template metadata
            </DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(selectedTemplate?.status || '')}>
                {selectedTemplate?.status}
              </Badge>
              <Badge variant="outline">{selectedTemplate?.category}</Badge>
              <Badge variant="secondary">{selectedTemplate?.language}</Badge>
            </div>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Preview</h4>
                {renderTemplatePreview(selectedTemplate)}
              </div>
              
              {selectedTemplate.status === 'APPROVED' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemplateToTest(selectedTemplate);
                      setIsTestDialogOpen(true);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </Button>
                  {mode === 'select' && onSelect && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        onSelect(selectedTemplate);
                        setShowPreview(false);
                      }}
                    >
                      Select Template
                    </Button>
                  )}
                </div>
              )}
              
              {selectedTemplate.status === 'PENDING' && (
                <Alert>
                  <AlertDescription>
                    This template is pending approval from Meta and cannot be used yet.
                  </AlertDescription>
                </Alert>
              )}
              
              {selectedTemplate.status === 'REJECTED' && (
                <Alert>
                  <AlertDescription>
                    This template was rejected by Meta and cannot be used.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
    </div>
  );
}
