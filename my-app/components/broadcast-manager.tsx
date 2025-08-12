"use client";

import React, { useState } from 'react';
import { Send, Users, MessageSquare, Eye, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';

interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components?: any[];
}

interface AppService {
  id: number;
  phone_number: string;
  whatsapp_business_account_id?: string;
  access_token?: string;
}

interface BroadcastManagerProps {
  appService: AppService;
  templates: WhatsAppTemplate[];
  onSendTest: (templateName: string, phoneNumber: string, parameters: string[]) => Promise<boolean>;
  loading: boolean;
}

export default function BroadcastManager({ appService, templates, onSendTest, loading }: BroadcastManagerProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [parameters, setParameters] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');

  // Extract parameters from template
  const getTemplateParameters = (template: WhatsAppTemplate) => {
    const params: string[] = [];
    template.components?.forEach(component => {
      if (component.type === 'BODY' && component.text) {
        const matches = component.text.match(/\{\{(\d+)\}\}/g) || [];
        matches.forEach((match: string) => {
          const paramNum = parseInt(match.replace(/[{}]/g, ''));
          if (!params[paramNum - 1]) {
            params[paramNum - 1] = '';
          }
        });
      }
    });
    return params;
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const templateParams = getTemplateParameters(template);
      setParameters(new Array(templateParams.length).fill(''));
    }
  };

  const handleParameterChange = (index: number, value: string) => {
    const newParams = [...parameters];
    newParams[index] = value;
    setParameters(newParams);
  };

  const handleSendTestMessage = async () => {
    if (!selectedTemplate || !phoneNumber.trim()) {
      toast.error('Please select a template and enter a phone number');
      return;
    }

    setIsSending(true);
    try {
      const success = await onSendTest(selectedTemplate.name, phoneNumber, parameters);
      if (success) {
        toast.success('Test message sent successfully!');
        setPhoneNumber('');
        setParameters([]);
      }
    } catch (error) {
      toast.error('Failed to send test message');
    } finally {
      setIsSending(false);
    }
  };

  const handlePreviewTemplate = (template: WhatsAppTemplate) => {
    setPreviewTemplate(template);
    setShowTemplateDialog(true);
  };

  const renderTemplatePreview = (template: WhatsAppTemplate) => {
    if (!template.components) return null;

    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        {template.components.map((component, index) => (
          <div key={index}>
            {component.type === 'HEADER' && (
              <div className="font-semibold text-sm">
                {component.format === 'IMAGE' ? '📷 Image' : component.text}
              </div>
            )}
            {component.type === 'BODY' && (
              <div className="text-sm">
                {component.text?.replace(/\{\{(\d+)\}\}/g, (match: string, num: string) => {
                  const paramIndex = parseInt(num) - 1;
                  return parameters[paramIndex] || `[Parameter ${parseInt(num)}]`;
                })}
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'PENDING':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case 'REJECTED':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'MARKETING':
        return "bg-blue-100 text-blue-800";
      case 'UTILITY':
        return "bg-purple-100 text-purple-800";
      case 'AUTHENTICATION':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates available</h3>
            <p className="text-muted-foreground mb-4">
              Create templates in your Meta Business Manager to use them for broadcasts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Broadcast Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Quick Test Broadcast
            </CardTitle>
            <CardDescription>
              Send a test message to verify your template works correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-select">Select Template</Label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger id="template-select">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {approvedTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Test Phone Number</Label>
                  <Input
                    id="phone-number"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>

                {/* Template Parameters */}
                {getTemplateParameters(selectedTemplate).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`param-${index}`}>Parameter {index + 1}</Label>
                    <Input
                      id={`param-${index}`}
                      placeholder={`Enter value for parameter ${index + 1}`}
                      value={parameters[index] || ''}
                      onChange={(e) => handleParameterChange(index, e.target.value)}
                    />
                  </div>
                ))}

                <Button
                  onClick={handleSendTestMessage}
                  disabled={isSending || !phoneNumber.trim()}
                  className="w-full"
                >
                  {isSending ? 'Sending...' : 'Send Test Message'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              How your message will appear to recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTemplate ? (
              renderTemplatePreview(selectedTemplate)
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                Select a template to see preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Campaign Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Campaign Management
              </CardTitle>
              <CardDescription>
                Create and manage full broadcast campaigns
              </CardDescription>
            </div>
            <Link href="/dashboard/templates/broadcast">
              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Campaign Manager
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              For bulk broadcasts, audience management, and detailed analytics, use the full Campaign Manager.
              Features include: contact list management, scheduled campaigns, real-time analytics, and more.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Available Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Templates</CardTitle>
          <CardDescription>
            Templates ready for broadcast campaigns ({approvedTemplates.length} approved)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Components</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {template.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadge(template.category)}>
                      {template.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(template.status)}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {template.components?.length || 0} components
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Badge className={getCategoryBadge(previewTemplate.category)}>
                    {previewTemplate.category}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusBadge(previewTemplate.status)}>
                    {previewTemplate.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Preview</Label>
                {renderTemplatePreview(previewTemplate)}
              </div>

              <Alert>
                <AlertDescription>
                  This template {previewTemplate.status === 'APPROVED' ? 'is approved and ready' : 'is not yet approved'} for broadcast campaigns.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
