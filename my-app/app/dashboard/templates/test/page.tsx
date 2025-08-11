"use client"

import React, { useState } from 'react';
import { toast } from 'sonner';
import DashboardHeader from '@/components/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Send, Eye, RefreshCw } from 'lucide-react';
import { useAppServices } from '@/hooks/use-app-services';
import { useWhatsAppTemplates } from '@/hooks/use-whatsapp-templates';
import { WhatsAppService } from '@/services/whatsapp';

export default function TemplateTestPage() {
  const {
    appServices,
    loading: servicesLoading,
    error: servicesError,
    selectedAppService,
    setSelectedAppService,
    refetch: refetchServices,
  } = useAppServices();

  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useWhatsAppTemplates(selectedAppService);

  const [testData, setTestData] = useState({
    phoneNumber: '',
    templateName: '',
    languageCode: 'en_US',
    parameters: [] as string[]
  });

  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewMessage, setPreviewMessage] = useState('');

  // Handle app service selection
  const handleAppServiceChange = (serviceId: string) => {
    const service = appServices.find(s => s.id.toString() === serviceId);
    setSelectedAppService(service || null);
  };

  // Handle template selection
  const handleTemplateChange = (templateName: string) => {
    const template = templates.find(t => t.name === templateName);
    setSelectedTemplate(template);
    setTestData(prev => ({ 
      ...prev, 
      templateName,
      languageCode: template?.language || 'en_US',
      parameters: []
    }));
    generatePreview(template, []);
  };

  // Generate message preview
  const generatePreview = (template: any, params: string[]) => {
    if (!template) {
      setPreviewMessage('');
      return;
    }

    let preview = '';
    
    // Add header if exists
    const headerComponent = template.components?.find((c: any) => c.type === 'HEADER');
    if (headerComponent?.text) {
      preview += `📋 ${headerComponent.text}\n\n`;
    }

    // Add body (replace parameters)
    const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
    if (bodyComponent?.text) {
      let bodyText = bodyComponent.text;
      params.forEach((param, index) => {
        bodyText = bodyText.replace(`{{${index + 1}}}`, param || `[Parameter ${index + 1}]`);
      });
      preview += bodyText;
    }

    // Add footer if exists
    const footerComponent = template.components?.find((c: any) => c.type === 'FOOTER');
    if (footerComponent?.text) {
      preview += `\n\n${footerComponent.text}`;
    }

    // Add buttons if exist
    const buttonsComponent = template.components?.find((c: any) => c.type === 'BUTTONS');
    if (buttonsComponent?.buttons) {
      preview += '\n\n📱 Buttons:';
      buttonsComponent.buttons.forEach((button: any) => {
        preview += `\n• ${button.text}`;
      });
    }

    setPreviewMessage(preview);
  };

  // Handle parameter change
  const handleParameterChange = (index: number, value: string) => {
    const newParams = [...testData.parameters];
    newParams[index] = value;
    setTestData(prev => ({ ...prev, parameters: newParams }));
    generatePreview(selectedTemplate, newParams);
  };

  // Add parameter field
  const addParameter = () => {
    setTestData(prev => ({
      ...prev,
      parameters: [...prev.parameters, '']
    }));
  };

  // Remove parameter field
  const removeParameter = (index: number) => {
    const newParams = testData.parameters.filter((_, i) => i !== index);
    setTestData(prev => ({ ...prev, parameters: newParams }));
    generatePreview(selectedTemplate, newParams);
  };

  // Send test message
  const sendTestMessage = async () => {
    if (!selectedAppService) {
      toast.error('Please select an app service');
      return;
    }

    if (!testData.phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!testData.templateName) {
      toast.error('Please select a template');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{10,14}$/;
    if (!phoneRegex.test(testData.phoneNumber)) {
      toast.error('Please enter a valid phone number (with country code)');
      return;
    }

    setIsSending(true);

    try {
      const parameters = testData.parameters.length > 0 
        ? testData.parameters.map(param => ({ type: "text", text: param }))
        : undefined;

      await WhatsAppService.sendTemplateMessage(
        selectedAppService,
        testData.phoneNumber,
        testData.templateName,
        testData.languageCode,
        parameters
      );

      toast.success('Test message sent successfully!');
      
      // Clear form
      setTestData({
        phoneNumber: '',
        templateName: '',
        languageCode: 'en_US',
        parameters: []
      });
      setSelectedTemplate(null);
      setPreviewMessage('');
    } catch (error) {
      console.error('Send test message error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send test message';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Get template parameters count
  const getParametersCount = (template: any) => {
    if (!template) return 0;
    const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
    if (!bodyComponent?.text) return 0;
    
    const matches = bodyComponent.text.match(/\{\{\d+\}\}/g);
    return matches ? matches.length : 0;
  };

  // Initialize parameters when template changes
  React.useEffect(() => {
    if (selectedTemplate) {
      const paramCount = getParametersCount(selectedTemplate);
      const newParams = Array(paramCount).fill('');
      setTestData(prev => ({ ...prev, parameters: newParams }));
      generatePreview(selectedTemplate, newParams);
    }
  }, [selectedTemplate]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container py-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Template Message Testing</h1>
            <p className="text-muted-foreground">
              Test your WhatsApp message templates by sending them to phone numbers
            </p>
          </div>

          {/* App Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                App Service Selection
              </CardTitle>
              <CardDescription>
                Select the WhatsApp app service to use for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {servicesError && (
                <Alert variant="destructive">
                  <AlertDescription>{servicesError}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="app-service">App Service</Label>
                  <Select 
                    value={selectedAppService?.id.toString() || ''} 
                    onValueChange={handleAppServiceChange}
                    disabled={servicesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an app service" />
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
                  onClick={refetchServices}
                  disabled={servicesLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${servicesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {selectedAppService && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedAppService.phone_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">WABA ID</Label>
                    <p className="text-sm text-muted-foreground">{selectedAppService.whatsapp_business_account_id}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Testing */}
          {selectedAppService && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Test Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send Test Message
                  </CardTitle>
                  <CardDescription>
                    Configure and send a test template message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {templatesError && (
                    <Alert variant="destructive">
                      <AlertDescription>{templatesError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Recipient Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Recipient Phone Number *</Label>
                    <Input
                      id="phone-number"
                      placeholder="+1234567890"
                      value={testData.phoneNumber}
                      onChange={(e) => setTestData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1 for US, +44 for UK)
                    </p>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="template">Template *</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refetchTemplates}
                        disabled={templatesLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${templatesLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <Select 
                      value={testData.templateName} 
                      onValueChange={handleTemplateChange}
                      disabled={templatesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.name}>
                            <div className="flex items-center gap-2">
                              <span>{template.name}</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  template.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  template.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {template.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Parameters */}
                  {selectedTemplate && getParametersCount(selectedTemplate) > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Template Parameters</Label>
                        <Badge variant="outline">
                          {getParametersCount(selectedTemplate)} parameters required
                        </Badge>
                      </div>
                      
                      {testData.parameters.map((param, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1">
                            <Input
                              placeholder={`Parameter ${index + 1}`}
                              value={param}
                              onChange={(e) => handleParameterChange(index, e.target.value)}
                            />
                          </div>
                          <Badge variant="outline" className="px-2 py-1">
                            {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Send Button */}
                  <Button 
                    onClick={sendTestMessage} 
                    disabled={isSending || !testData.phoneNumber || !testData.templateName}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Message Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Message Preview
                  </CardTitle>
                  <CardDescription>
                    Preview how your template message will appear
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          {selectedTemplate.category}
                        </Badge>
                        <Badge variant="outline">
                          {selectedTemplate.language}
                        </Badge>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="text-sm text-green-800 font-medium mb-2">WhatsApp Message</div>
                        <div className="whitespace-pre-wrap text-sm">
                          {previewMessage || 'Select template parameters to see preview...'}
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Status:</span>
                          <Badge 
                            className={
                              selectedTemplate.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              selectedTemplate.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {selectedTemplate.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Components:</span>
                          <span>{selectedTemplate.components?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        Select a template to see the message preview
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
