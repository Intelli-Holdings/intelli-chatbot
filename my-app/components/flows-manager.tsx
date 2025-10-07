"use client";

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Send, 
  RefreshCw, 
  Loader2,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
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
import { toast } from 'sonner';

interface FlowManagerProps {
  appService: any;
}

interface MetaFlow {
  id: string;
  name: string;
  status: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
  categories: string[];
  validation_errors?: any[];
  created_time?: string;
  updated_time?: string;
}

interface FlowScreen {
  id: string;
  title: string;
  terminal?: boolean;
}

interface FlowDetails {
  id: string;
  name: string;
  status: string;
  json_version?: string;
  data_api_version?: string;
  screens?: FlowScreen[];
}

export default function FlowManager({ appService }: FlowManagerProps) {
  const [flows, setFlows] = useState<MetaFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<MetaFlow | null>(null);
  const [flowDetails, setFlowDetails] = useState<FlowDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [senderNumber, setSenderNumber] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchFlows();
  }, []);

  useEffect(() => {
    if (appService?.phone_number) {
      setSenderNumber(appService.phone_number);
    }
  }, [appService]);

  const fetchFlows = async () => {
    if (!appService?.whatsapp_business_account_id || !appService?.access_token) {
      toast.error('WhatsApp Business Account not configured');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${appService.whatsapp_business_account_id}/flows?fields=id,name,status,categories,validation_errors,created_time,updated_time&access_token=${appService.access_token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flows');
      }

      const data = await response.json();
      setFlows(data.data || []);
      toast.success(`Loaded ${data.data?.length || 0} flows`);
    } catch (error) {
      console.error('Error fetching flows:', error);
      toast.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlowDetails = async (flowId: string) => {
    if (!appService?.access_token) {
      toast.error('Access token not available');
      return null;
    }

    setLoadingDetails(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${flowId}?fields=id,name,status,json_version,data_api_version,preview.invalidate(false),categories&access_token=${appService.access_token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flow details');
      }

      const data = await response.json();
      
      // Parse the preview to get screens
      let screens: FlowScreen[] = [];
      if (data.preview?.preview) {
        try {
          const previewData = JSON.parse(data.preview.preview);
          if (previewData.screens && Array.isArray(previewData.screens)) {
            screens = previewData.screens.map((screen: any) => ({
              id: screen.id,
              title: screen.title || screen.id,
              terminal: screen.terminal
            }));
          }
        } catch (e) {
          console.error('Error parsing preview:', e);
        }
      }

      const details: FlowDetails = {
        id: data.id,
        name: data.name,
        status: data.status,
        json_version: data.json_version,
        data_api_version: data.data_api_version,
        screens
      };

      setFlowDetails(details);
      
      // Auto-select first screen
      if (screens.length > 0) {
        setSelectedScreen(screens[0].id);
      }
      
      return details;
    } catch (error) {
      console.error('Error fetching flow details:', error);
      toast.error('Failed to load flow details');
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

    if (!selectedScreen) {
      toast.error('Please select a starting screen');
      return;
    }

    setSending(true);
    try {
      const messageData = {
        messaging_product: 'whatsapp',
        to: recipientNumber,
        type: 'interactive',
        interactive: {
          type: 'flow',
          header: {
            type: 'text',
            text: 'Complete this form'
          },
          body: {
            text: `Please complete the ${selectedFlow.name} form.`
          },
          action: {
            name: 'flow',
            parameters: {
              flow_message_version: '3',
              flow_token: `FLOW_TOKEN_${Date.now()}`,
              flow_id: selectedFlow.id,
              flow_cta: 'Open Form',
              flow_action: 'navigate',
              flow_action_payload: {
                screen: selectedScreen
              }
            }
          }
        }
      };

      const response = await fetch(
        `https://graph.facebook.com/v21.0/${appService.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to send flow');
      }

      toast.success('Flow sent successfully!');
      setSendDialogOpen(false);
      setRecipientNumber('');
    } catch (error) {
      console.error('Error sending flow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send flow');
    } finally {
      setSending(false);
    }
  };

  const handleOpenSendDialog = async (flow: MetaFlow) => {
    setSelectedFlow(flow);
    setSendDialogOpen(true);
    await fetchFlowDetails(flow.id);
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

                  {flow.updated_time && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Updated {new Date(flow.updated_time).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
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
              <Label htmlFor="screen">First screen</Label>
              {loadingDetails ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading screens...</span>
                </div>
              ) : flowDetails?.screens && flowDetails.screens.length > 0 ? (
                <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a screen" />
                  </SelectTrigger>
                  <SelectContent>
                    {flowDetails.screens.map((screen) => (
                      <SelectItem key={screen.id} value={screen.id}>
                        {screen.title}
                        {screen.terminal && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Terminal
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert className="mt-1">
                  <AlertDescription className="text-xs">
                    No screens found for this flow
                  </AlertDescription>
                </Alert>
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
              disabled={sending || !selectedScreen || !recipientNumber}
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
    </div>
  );
}