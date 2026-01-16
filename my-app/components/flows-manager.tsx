"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  Eye,
  Send,
  RefreshCw,
  Loader2,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { WhatsAppService, type WhatsAppFlow, type FlowDetails } from '@/services/whatsapp';

interface FlowManagerProps {
  appService: any;
}

export default function FlowManager({ appService }: FlowManagerProps) {
  const [activeTab, setActiveTab] = useState<'manage' | 'create-template' | 'send'>('manage');
  const [flows, setFlows] = useState<WhatsAppFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<WhatsAppFlow | null>(null);
  const [flowDetails, setFlowDetails] = useState<FlowDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Send flow dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [senderNumber, setSenderNumber] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [manualScreenId, setManualScreenId] = useState('');
  const [useManualScreenId, setUseManualScreenId] = useState(false);
  const [sending, setSending] = useState(false);

  // Create template dialog state
  const [createTemplateDialogOpen, setCreateTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateBodyText, setTemplateBodyText] = useState('');
  const [templateButtonText, setTemplateButtonText] = useState('Open Form');
  const [templateCategory, setTemplateCategory] = useState<'MARKETING' | 'UTILITY'>('UTILITY');
  const [templateLanguage, setTemplateLanguage] = useState('en_US');
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const fetchFlows = useCallback(async () => {
    if (!appService?.whatsapp_business_account_id || !appService?.access_token) {
      toast.error('WhatsApp Business Account not configured');
      return;
    }

    setLoading(true);
    try {
      const flowsData = await WhatsAppService.fetchFlows(appService);
      setFlows(flowsData);
      toast.success(`Loaded ${flowsData.length} flow(s)`);
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load flows');
    } finally {
      setLoading(false);
    }
  }, [appService]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  useEffect(() => {
    if (appService?.phone_number) {
      setSenderNumber(appService.phone_number);
    }
  }, [appService]);

  const fetchFlowDetails = async (flowId: string) => {
    if (!appService?.access_token) {
      toast.error('Access token not available');
      return null;
    }

    setLoadingDetails(true);
    try {
      const details = await WhatsAppService.fetchFlowDetails(appService, flowId);
      setFlowDetails(details);

      // Auto-select first screen
      if (details.screens && details.screens.length > 0) {
        setSelectedScreen(details.screens[0].id);
      }

      return details;
    } catch (error) {
      console.error('Error fetching flow details:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load flow details');
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSendFlow = async () => {
    if (!recipientNumber.trim()) {
      toast.error('Please enter a recipient phone number');
      return;
    }

    if (!selectedFlow) {
      toast.error('No flow selected');
      return;
    }

    // Determine which screen ID to use
    let screenId = '';
    if (useManualScreenId) {
      screenId = manualScreenId.trim() || 'FIRST_ENTRY_SCREEN';
    } else if (selectedScreen) {
      screenId = selectedScreen;
    } else {
      // Default to FIRST_ENTRY_SCREEN if no screen selected
      screenId = 'FIRST_ENTRY_SCREEN';
    }

    setSending(true);
    try {
      await WhatsAppService.sendInteractiveFlowMessage(
        appService,
        recipientNumber,
        selectedFlow.id,
        {
          headerText: 'Complete this form',
          bodyText: `Please complete the ${selectedFlow.name} form.`,
          buttonText: 'Open Form',
          flowToken: `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          flowAction: 'navigate',
          screen: screenId
          // Note: flowData omitted - will only be added if it's a non-empty object
        }
      );

      toast.success('Flow message queued successfully', {
        description: `The flow has been sent to ${recipientNumber} with screen: ${screenId}`,
        duration: 5000,
      });

      setSendDialogOpen(false);
      setRecipientNumber('');
      setSelectedScreen('');
      setManualScreenId('');
      setUseManualScreenId(false);
      setFlowDetails(null);
    } catch (error) {
      // Extract error message and details
      const errorMessage = error instanceof Error ? error.message : 'Failed to send flow';
      const errorDetails = (error as any).details;

      // Show toast with error details if available
      if (errorDetails) {
        toast.error('Failed to send flow', {
          description: errorDetails,
          duration: 7000,
        });
      } else {
        toast.error(errorMessage, {
          duration: 5000,
        });
      }

      // Also log the full error for debugging
      console.error('Flow send error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!templateBodyText.trim()) {
      toast.error('Please enter body text');
      return;
    }

    if (!selectedFlow) {
      toast.error('No flow selected');
      return;
    }

    setCreatingTemplate(true);
    try {
      // Note: navigate_screen is NOT supported when creating templates
      // The screen is specified when SENDING the template, not when creating it
      const result = await WhatsAppService.createFlowTemplate(appService, {
        name: templateName,
        language: templateLanguage,
        category: templateCategory,
        bodyText: templateBodyText,
        flowId: selectedFlow.id,
        flowAction: 'navigate',
        buttonText: templateButtonText
        // navigateScreen is omitted - will be specified when sending
      });

      toast.success('Flow template created successfully!', {
        description: `Template "${templateName}" is pending approval and will be available once Meta approves it.`,
        duration: 5000,
      });

      setCreateTemplateDialogOpen(false);
      setTemplateName('');
      setTemplateBodyText('');
      setTemplateButtonText('Open Form');
      setSelectedFlow(null);
      setFlowDetails(null);
    } catch (error) {
      // Extract error message and details
      const errorMessage = error instanceof Error ? error.message : 'Failed to create template';
      const errorDetails = (error as any).details;

      // Show toast with error details if available
      if (errorDetails) {
        toast.error('Failed to create template', {
          description: errorDetails,
          duration: 7000,
        });
      } else {
        toast.error(errorMessage, {
          duration: 5000,
        });
      }

      // Also log the full error for debugging
      console.error('Template creation error:', error);
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleOpenSendDialog = async (flow: WhatsAppFlow) => {
    setSelectedFlow(flow);
    setSendDialogOpen(true);
    await fetchFlowDetails(flow.id);
  };

  const handleOpenCreateTemplateDialog = async (flow: WhatsAppFlow) => {
    setSelectedFlow(flow);
    setCreateTemplateDialogOpen(true);
    // Note: No need to fetch flow details for template creation
    // Screens are only needed when SENDING the template
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DRAFT':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'DEPRECATED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PUBLISHED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-yellow-100 text-yellow-800',
      DEPRECATED: 'bg-red-100 text-red-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getViewUrl = (flowId: string) => {
    if (!appService?.whatsapp_business_account_id) return '#';
    return `https://business.facebook.com/latest/whatsapp_manager/flows?business_id=${appService.whatsapp_business_account_id}&tab=flows&nav_ref=whatsapp_manager&asset_id=${flowId}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">WhatsApp Flows</h2>
            <p className="text-sm text-muted-foreground">
              Manage and send your WhatsApp Flows
            </p>
          </div>
          <Button onClick={fetchFlows} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {!appService?.whatsapp_business_account_id && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              WhatsApp Business Account not configured. Please set up your account first.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {loading && flows.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : flows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <div className="text-lg font-medium mb-2">No Flows Found</div>
              <p className="text-sm">
                Create a Flow in Meta Business Manager to get started
              </p>
            </div>
            <Button asChild>
              <a
                href={`https://business.facebook.com/latest/whatsapp_manager/flows?business_id=${appService?.whatsapp_business_account_id || ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Meta Business Manager
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map((flow) => (
            <Card 
              key={flow.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      ID: {flow.id}
                    </CardDescription>
                  </div>
                  {getStatusIcon(flow.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadge(flow.status)}>
                      {flow.status}
                    </Badge>
                    {flow.categories?.map(cat => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  {flow.validation_errors && flow.validation_errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {flow.validation_errors.length} validation error(s)
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href={getViewUrl(flow.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={flow.status !== 'PUBLISHED'}
                        onClick={() => handleOpenSendDialog(flow)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send
                      </Button>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled={flow.status !== 'PUBLISHED'}
                      onClick={() => handleOpenCreateTemplateDialog(flow)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Create Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Send Flow Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Flow</DialogTitle>
            <DialogDescription>
              Test the Flow experience by sending it to your phone number
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                The message will be subject to limits and pricing. Make sure you are within the 24-hour customer service window to receive the message.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="sender">Sender number</Label>
              <Input
                id="sender"
                value={senderNumber}
                disabled
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="recipient">Recipient number</Label>
              <Input
                id="recipient"
                placeholder="Enter phone number"
                value={recipientNumber}
                onChange={(e) => setRecipientNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include country code (e.g., 254712345678)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="screen">First screen</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setUseManualScreenId(!useManualScreenId)}
                  className="h-6 text-xs"
                >
                  {useManualScreenId ? 'Use Dropdown' : 'Enter Manually'}
                </Button>
              </div>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading screens...</span>
                </div>
              ) : useManualScreenId ? (
                <div className="mt-1 space-y-2">
                  <Input
                    id="manualScreen"
                    placeholder="Enter screen ID (e.g., WELCOME_SCREEN)"
                    value={manualScreenId}
                    onChange={(e) => setManualScreenId(e.target.value)}
                  />
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Enter your flow&apos;s starting screen ID. Leave empty to use default &apos;FIRST_ENTRY_SCREEN&apos;
                    </AlertDescription>
                  </Alert>
                  {manualScreenId && (
                    <p className="text-xs text-muted-foreground">
                      Will use: <code className="bg-muted px-1 py-0.5 rounded">{manualScreenId}</code>
                    </p>
                  )}
                  {!manualScreenId && (
                    <p className="text-xs text-muted-foreground">
                      Will use default: <code className="bg-muted px-1 py-0.5 rounded">FIRST_ENTRY_SCREEN</code>
                    </p>
                  )}
                </div>
              ) : flowDetails?.screens && flowDetails.screens.length > 0 ? (
                <div className="mt-1">
                  <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                    <SelectTrigger id="screen">
                      <SelectValue placeholder="Select a screen">
                        {selectedScreen && flowDetails.screens.find(s => s.id === selectedScreen)?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {flowDetails.screens.map((screen) => (
                        <SelectItem key={screen.id} value={screen.id}>
                          <div className="flex items-center gap-2">
                            <span>{screen.title}</span>
                            {screen.terminal && (
                              <Badge variant="outline" className="text-xs">
                                Terminal
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Screen ID: {selectedScreen}
                  </p>
                </div>
              ) : (
                <div className="mt-1 space-y-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      No screens found. You can still send the flow using the default screen or enter manually.
                    </AlertDescription>
                  </Alert>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUseManualScreenId(true)}
                    className="w-full"
                  >
                    Enter Screen ID Manually
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Or leave as-is to use: <code className="bg-muted px-1 py-0.5 rounded">FIRST_ENTRY_SCREEN</code>
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setSendDialogOpen(false);
                setRecipientNumber('');
                setFlowDetails(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendFlow}
              disabled={sending || !recipientNumber}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={createTemplateDialogOpen} onOpenChange={setCreateTemplateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Flow Template</DialogTitle>
            <DialogDescription>
              Create a message template that includes this Flow as a button
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This will create a business-initiated message template with a Flow button. The template will need Meta approval before you can use it.
              </AlertDescription>
            </Alert>

            {selectedFlow && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">{selectedFlow.name}</div>
                <div className="text-xs text-muted-foreground">Flow ID: {selectedFlow.id}</div>
              </div>
            )}

            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="e.g., appointment_booking"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={templateCategory} onValueChange={(v: any) => setTemplateCategory(v)}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTILITY">Utility</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                <SelectTrigger id="language" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_US">English (US)</SelectItem>
                  <SelectItem value="en_GB">English (UK)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bodyText">Body Text</Label>
              <Input
                id="bodyText"
                placeholder="e.g., Book your appointment by completing the form"
                value={templateBodyText}
                onChange={(e) => setTemplateBodyText(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                placeholder="e.g., Open Form"
                value={templateButtonText}
                onChange={(e) => setTemplateButtonText(e.target.value)}
                className="mt-1"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum 30 characters
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                The starting screen will be specified when you send this template to users. You don&apos;t need to select it during template creation.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setCreateTemplateDialogOpen(false);
                setTemplateName('');
                setTemplateBodyText('');
                setTemplateButtonText('Open Form');
                setSelectedFlow(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              disabled={creatingTemplate || !templateName || !templateBodyText}
            >
              {creatingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
