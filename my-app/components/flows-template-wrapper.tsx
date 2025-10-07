// components/flows-template-wrapper.tsx
"use client";

import React, { useState, useEffect } from 'react';
import FlowsBuilder from '@/components/flows-builder';
import type { FlowJSON } from '@/types/flows';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FlowsTemplateWrapperProps {
  templateName: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  appService: any;
  onBack: () => void;
  onSubmit: (templateData: any) => Promise<boolean>;
}

interface FlowDetails {
  id: string;
  screens?: Array<{
    id: string;
    title: string;
    terminal?: boolean;
  }>;
  data_api_version?: string;
}

export default function FlowsTemplateWrapper({
  templateName,
  language,
  category,
  appService,
  onBack,
  onSubmit
}: FlowsTemplateWrapperProps) {
  const [loading, setLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fetchFlowDetails = async (flowId: string): Promise<FlowDetails | null> => {
    if (!appService?.access_token) {
      toast.error('Access token not available');
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${flowId}?fields=id,name,status,json_version,data_api_version,preview.invalidate(false)&access_token=${appService.access_token}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flow details');
      }

      const data = await response.json();
      
      // Parse the preview to get screens
      let screens: Array<{ id: string; title: string; terminal?: boolean }> = [];
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

      return {
        id: data.id,
        screens,
        data_api_version: data.data_api_version
      };
    } catch (error) {
      console.error('Error fetching flow details:', error);
      toast.error('Failed to load flow details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFlowComplete = async (flowJSON: FlowJSON, flowId: string) => {
    try {
      // Fetch actual flow details from Meta to get correct screen names
      const details = await fetchFlowDetails(flowId);
      
      if (!details) {
        toast.error('Failed to fetch flow details');
        return false;
      }

      if (!details.screens || details.screens.length === 0) {
        toast.error('No screens found in the selected flow');
        return false;
      }

      // Use the actual first screen ID from the Meta flow
      const firstScreenId = details.screens[0].id;
      
      // Determine flow action based on whether data endpoint is used
      const flowAction = details.data_api_version ? 'data_exchange' : 'navigate';

      // Create the template data structure for WhatsApp API
      const templateData = {
        name: templateName.toLowerCase().replace(/\s+/g, '_'),
        language: language,
        category: category,
        components: [
          {
            type: 'BODY',
            text: 'Tap the button below to get started.',
            example: {
              body_text: [['Tap the button below to get started.']]
            }
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'FLOW',
                text: 'Get Started',
                flow_id: flowId,
                flow_action: flowAction,
                ...(flowAction === 'navigate' && {
                  navigate_screen: firstScreenId
                })
              }
            ]
          }
        ]
      };

      // Log for debugging
      console.log('Flow details:', details);
      console.log('Using first screen:', firstScreenId);
      console.log('Template data:', JSON.stringify(templateData, null, 2));

      // Submit the template
      const success = await onSubmit(templateData);
      
      if (success) {
        toast.success('Flow template created! Ensure your Flow is published in Meta Business Manager.');
      }
      
      return success;
    } catch (error) {
      console.error('Error creating flow template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create flow template');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading flow details...</span>
      </div>
    );
  }

  return (
    <FlowsBuilder
      onComplete={handleFlowComplete}
      onBack={onBack}
      templateName={templateName}
      category={category}
      appService={appService}
    />
  );
}