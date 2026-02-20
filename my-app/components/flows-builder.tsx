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

import { logger } from "@/lib/logger";
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

export default function FlowsBuilder({
  onComplete,
  onBack,
  templateName,
  appService
}: FlowsBuilderProps) {
  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [availableFlows, setAvailableFlows] = useState<MetaFlow[]>([]);
  const [loadingFlows, setLoadingFlows] = useState(false);
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
    logger.error('Error fetching flows:', { error: error instanceof Error ? error.message : String(error) });
    toast.error('Failed to load flows from Meta');
  } finally {
    setLoadingFlows(false);
  }
}, [appService]);

useEffect(() => {
  fetchMetaFlows();
}, [fetchMetaFlows]);

  const handleSave = async () => {
    if (!selectedFlowId) {
      toast.error('Please select a Flow');
      return;
    }

    setIsSubmitting(true);

    try {
      // Note: Screen is NOT required for template creation
      // The screen is specified when SENDING the template, not when creating it
      await onComplete(selectedFlowId, '');
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
              <p className="text-sm text-muted-foreground">Select Flow for Template</p>
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            size="lg"
            disabled={isSubmitting || !selectedFlowId}
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
              Select an existing published Flow from Meta Business Manager. The template will include a button to open this flow. The starting screen will be specified when you send the template to users.
            </AlertDescription>
          </Alert>

          {/* Flow Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Select Flow</CardTitle>
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

          {/* Summary Card */}
          {selectedFlowId && (
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
                  <span className="font-medium text-xs">
                    Specified when sending template
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