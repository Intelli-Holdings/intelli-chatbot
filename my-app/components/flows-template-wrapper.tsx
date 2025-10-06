// components/flows-template-wrapper.tsx
"use client";

import React from 'react';
import FlowsBuilder from '@/components/flows-builder';
import type { FlowJSON } from '@/types/flows';
import { toast } from 'sonner';

interface FlowsTemplateWrapperProps {
  templateName: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  appService: any;
  onBack: () => void;
  onSubmit: (templateData: any) => Promise<boolean>;
}

export default function FlowsTemplateWrapper({
  templateName,
  language,
  category,
  appService,
  onBack,
  onSubmit
}: FlowsTemplateWrapperProps) {
  
  const handleFlowComplete = async (flowJSON: FlowJSON, flowId: string) => {
    try {
      // Get the first screen ID for navigation
      const firstScreenId = flowJSON.screens[0]?.id || 'SCREEN_1';
      
      // Determine flow action based on whether data endpoint is used
      const flowAction = flowJSON.data_api_version ? 'data_exchange' : 'navigate';

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

      // Log the Flow JSON for reference
      console.log('Flow JSON created:', JSON.stringify(flowJSON, null, 2));
      console.log('Template data:', JSON.stringify(templateData, null, 2));

      // Submit the template
      const success = await onSubmit(templateData);
      
      if (success) {
        toast.success('Flow template created! Remember to ensure your Flow is published in Meta Business Manager.');
      }
      
      return success;
    } catch (error) {
      console.error('Error creating flow template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create flow template');
      return false;
    }
  };

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