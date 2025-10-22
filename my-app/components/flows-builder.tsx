"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save,
  ChevronLeft,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { FlowJSON } from '@/types/flows';

interface FlowsBuilderProps {
  onComplete: (flowId: string, selectedScreenId: string) => Promise<boolean>;
  onBack: () => void;
  templateName: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  appService: any;
}

interface MetaFlow {
  id: string;
  name: string;
  status: string;
  categories: string[];
}

interface FlowScreen {
  id: string;
  title: string;
  terminal?: boolean;
}

export default function FlowsBuilder({ 
  onComplete, 
  onBack, 
  templateName,
  appService 
}: FlowsBuilderProps) {
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [availableFlows, setAvailableFlows] = useState<MetaFlow[]>([]);
  const [flowScreens, setFlowScreens] = useState<FlowScreen[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [loadingFlows, setLoadingFlows] = useState(false);
  const [loadingScreens, setLoadingScreens] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMetaFlows = useCallback(async () => {
  if (!appService?.whatsapp_business_account_id || !appService?.access_token) {
    toast.error('WhatsApp Business Account not configured');
    return;
  }

  setLoadingFlows(true);
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${appService.whatsapp_business_account_id}/flows?fields=id,name,status,categories&access_token=${appService.access_token}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch flows');
    }

    const data = await response.json();
    const publishedFlows = (data.data || []).filter((flow: MetaFlow) => flow.status === 'PUBLISHED');
    
    setAvailableFlows(publishedFlows);
    
    if (publishedFlows.length > 0) {
      setSelectedFlowId(publishedFlows[0].id);
      toast.success(`Found ${publishedFlows.length} published flow(s)`);
    } else {
      toast.info('No published flows found. Publish a flow in Meta Business Manager first.');
    }
  } catch (error) {
    console.error('Error fetching flows:', error);
    toast.error('Failed to load flows from Meta');
  } finally {
    setLoadingFlows(false);
  }
}, [appService]);

const fetchFlowScreens = useCallback(async (flowId: string) => {
  if (!appService?.access_token) return;

  setLoadingScreens(true);
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${flowId}?fields=id,name,preview.invalidate(false)&access_token=${appService.access_token}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch flow details');
    }

    const data = await response.json();
    
    // Parse screens from preview
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

    setFlowScreens(screens);
    if (screens.length > 0) {
      setSelectedScreenId(screens[0].id);
    }
  } catch (error) {
    console.error('Error fetching flow screens:', error);
    toast.error('Failed to load flow screens');
  } finally {
    setLoadingScreens(false);
  }
}, [appService]);

useEffect(() => {
  fetchMetaFlows();
}, [fetchMetaFlows]);

useEffect(() => {
  if (selectedFlowId) {
    fetchFlowScreens(selectedFlowId);
  }
}, [selectedFlowId, fetchFlowScreens]);

  const handleSave = async () => {
    if (!selectedFlowId) {
      toast.error('Please select a Flow');
      return;
    }

    if (!selectedScreenId) {
      toast.error('Please select a starting screen');
      return;
    }

    setIsSubmitting(true);

    try {
      // Pass selectedScreenId as third parameter
      await onComplete(selectedFlowId, selectedScreenId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create flow template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFlow = availableFlows.find(f => f.id === selectedFlowId);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{templateName}</h2>
              <p className="text-sm text-muted-foreground">Select Flow & Starting Screen</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            size="lg"
            disabled={isSubmitting || !selectedFlowId || !selectedScreenId}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Flow Template
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Select an existing published Flow from Meta Business Manager. The template will reference this flow and allow users to start from a specific screen.
            </AlertDescription>
          </Alert>

          {/* Flow Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Flow</CardTitle>
              <CardDescription>
                Choose a published flow from your Meta Business account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select 
                    value={selectedFlowId} 
                    onValueChange={setSelectedFlowId}
                    disabled={loadingFlows || availableFlows.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a flow from Meta" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFlows.map(flow => (
                        <SelectItem key={flow.id} value={flow.id}>
                          <div className="flex items-center gap-2">
                            <span>{flow.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {flow.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchMetaFlows}
                  disabled={loadingFlows}
                  title="Refresh flows"
                >
                  {loadingFlows ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {selectedFlow && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedFlow.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {selectedFlow.id}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://business.facebook.com/latest/whatsapp_manager/flows?business_id=${appService?.whatsapp_business_account_id}&tab=flows&nav_ref=whatsapp_manager&asset_id=${selectedFlow.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View in Meta
                      </a>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {selectedFlow.categories?.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {availableFlows.length === 0 && !loadingFlows && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No published flows found. Create and publish a flow in Meta Business Manager first.
                    <Button
                      variant="link"
                      className="h-auto p-0 ml-1"
                      asChild
                    >
                      <a
                        href={`https://business.facebook.com/latest/whatsapp_manager/flows?business_id=${appService?.whatsapp_business_account_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Meta Business Manager
                      </a>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Screen Selection Card */}
          {selectedFlowId && (
            <Card>
              <CardHeader>
                <CardTitle>2. Select Starting Screen</CardTitle>
                <CardDescription>
                  Choose which screen users will see first when they open the flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingScreens ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading screens...</span>
                  </div>
                ) : flowScreens.length > 0 ? (
                  <>
                    <Select value={selectedScreenId} onValueChange={setSelectedScreenId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select starting screen">
                          {selectedScreenId && flowScreens.find(s => s.id === selectedScreenId)?.title}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {flowScreens.map(screen => (
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

                    {selectedScreenId && (
                      <div className="space-y-2">
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Found {flowScreens.length} screen(s) in this flow.
                          </AlertDescription>
                        </Alert>
                        <div className="text-sm p-3 bg-blue-50 rounded-md border border-blue-200">
                          <div className="font-medium text-blue-900 mb-1">Starting Screen:</div>
                          <div className="text-blue-700">{flowScreens.find(s => s.id === selectedScreenId)?.title}</div>
                          <div className="text-xs text-blue-600 mt-1">ID: {selectedScreenId}</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No screens found in this flow. Please ensure the flow is properly configured in Meta Business Manager.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary Card */}
          {selectedFlowId && selectedScreenId && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Ready to Create</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template Name:</span>
                  <span className="font-medium">{templateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flow:</span>
                  <span className="font-medium">{selectedFlow?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Screen:</span>
                  <span className="font-medium">
                    {flowScreens.find(s => s.id === selectedScreenId)?.title}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}