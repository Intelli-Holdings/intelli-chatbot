"use client";

import React, { useState } from 'react';
import { Send, Users, MessageSquare, Eye, Calendar, ExternalLink, Phone, Video, MoreVertical, CheckCheck, Search, BookOpenCheck } from 'lucide-react';
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
  onSendTest: (templateName: string, phoneNumber: string, parameters: string[], language: string) => Promise<boolean>;
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
    // Pass both name and language
    const success = await onSendTest(
      selectedTemplate.name,
      phoneNumber,
      parameters,
      selectedTemplate.language  
    );

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

  const replaceVariables = (text: string, params: string[] = parameters): string => {
    let result = text;
    params.forEach((param, index) => {
      const placeholder = `{{${index + 1}}}`;
      result = result.replace(placeholder, param || `[Variable ${index + 1}]`);
    });
    // Replace any remaining placeholders
    result = result.replace(/\{\{(\d+)\}\}/g, '[Variable $1]');
    return result;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderWhatsAppPreview = (template: WhatsAppTemplate, customParams?: string[]) => {
    const headerComponent = template.components?.find(c => c.type === 'HEADER');
    const bodyComponent = template.components?.find(c => c.type === 'BODY');
    const footerComponent = template.components?.find(c => c.type === 'FOOTER');
    const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');
    const displayParams = customParams || parameters;

    return (
      <div className="w-full rounded-lg overflow-hidden shadow-xl">
        {/* WhatsApp Header */}
        <div className="bg-[#008069] text-white">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-600">
                  <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-base">Business Account</div>
                <div className="text-xs opacity-80">online</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <Video className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <Phone className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat Area */}
        <div 
          className="min-h-[350px] max-h-[400px] overflow-y-auto"
          style={{ 
            background: '#e5ddd5',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4d4d8' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm-30 7c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zM10 50c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10c-5.5 0-10-4.5-10-10zm10-7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        >
          <div className="p-4 space-y-3">
            {/* Encryption Notice */}
            <div className="flex justify-center mb-4">
              <div 
                className="text-xs px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: '#fef8c7',
                  color: '#54656f'
                }}
              >
                🔒 Messages are end-to-end encrypted
              </div>
            </div>
            
            {/* Business Message - Incoming */}
            <div className="flex justify-start">
              <div 
                className="relative max-w-[75%]"
                style={{ marginLeft: '8px' }}
              >
                <div 
                  className="rounded-lg shadow-sm"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderTopLeftRadius: '7px',
                    borderTopRightRadius: '7px',
                    borderBottomRightRadius: '7px',
                    borderBottomLeftRadius: '0px'
                  }}
                >
                  <div className="px-3 pt-2 pb-1">
                    {/* Header */}
                    {headerComponent && (
                      <div className="mb-2">
                        {headerComponent.format === 'TEXT' && headerComponent.text && (
                          <div className="font-semibold text-[#111b21] text-sm">
                            {replaceVariables(headerComponent.text, displayParams)}
                          </div>
                        )}
                        {headerComponent.format === 'IMAGE' && (
                          <div className="bg-gray-200 rounded-md h-32 w-full mb-2 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {headerComponent.format === 'VIDEO' && (
                          <div className="bg-gray-900 rounded-md h-32 w-full mb-2 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        {headerComponent.format === 'DOCUMENT' && (
                          <div className="bg-gray-100 rounded-md p-3 mb-2 flex items-center gap-2">
                            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700">Document.pdf</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Body */}
                    {bodyComponent && bodyComponent.text && (
                      <div 
                        className="text-[#111b21] text-[14px] leading-[19px] whitespace-pre-wrap"
                        style={{ wordBreak: 'break-word' }}
                      >
                        {replaceVariables(bodyComponent.text, displayParams)}
                      </div>
                    )}
                    
                    {/* Footer */}
                    {footerComponent && footerComponent.text && (
                      <div className="text-xs text-[#667781] mt-2">
                        {footerComponent.text}
                      </div>
                    )}
                    
                    {/* Buttons */}
                    {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
                      <div className="mt-3 -mx-3 px-3 border-t border-gray-200 pt-2 space-y-1">
                        {buttonsComponent.buttons.map((button: any, index: number) => (
                          <div 
                            key={index}
                            className="w-full py-2 text-center text-[#00a5f4] text-sm font-medium hover:bg-gray-50 rounded cursor-pointer transition-colors flex items-center justify-center gap-1"
                          >
                            {button.type === 'URL' && (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {button.text}
                              </>
                            )}
                            {button.type === 'PHONE_NUMBER' && (
                              <>
                                <Phone className="w-4 h-4" />
                                {button.text}
                              </>
                            )}
                            {button.type === 'QUICK_REPLY' && button.text}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[11px] text-[#667781]">
                        {getCurrentTime()}
                      </span>
                      <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                    </div>
                  </div>
                </div>
                {/* Message tail */}
                <div 
                  className="absolute -left-2 top-0 w-3 h-3"
                  style={{
                    background: '#ffffff',
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
                  }}
                />
              </div>
            </div>

            {/* Template Badge */}
            <div className="flex justify-center mt-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#00a884] text-white">
                {template.category} Template
              </span>
            </div>
          </div>
        </div>
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
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5" />
              Test Broadcast Messages
            </CardTitle>
            <CardDescription>
              Send test messages using approved templates
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
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code without plus sign (e.g., 254 for Kenya, 233 for Ghana)
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
                  {isSending ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Message
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Preview */}
        <Card className="p-0 overflow-hidden">
         
          <CardContent className="p-0">
            {selectedTemplate ? (
              renderWhatsAppPreview(selectedTemplate)
            ) : (
              <div className="text-center p-12 text-muted-foreground bg-gray-50">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
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
              <Button className="gap-2 bg-[#00a884] hover:bg-[#008069]">
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
            </AlertDescription>
          </Alert>
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
                  <div className="mt-1">
                    <Badge className={getCategoryBadge(previewTemplate.category)}>
                      {previewTemplate.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadge(previewTemplate.status)}>
                      {previewTemplate.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-3 block">WhatsApp Preview</Label>
                {renderWhatsAppPreview(previewTemplate, [])}
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