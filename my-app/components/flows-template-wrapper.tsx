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
  
  const handleFlowComplete = async (
    flowId: string, 
    selectedScreenId: string
  ): Promise<boolean> => {
    try {
      // Create the template data structure for WhatsApp API
      // CRITICAL: Must include flow_id, flow_action, and navigate_screen
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
                flow_action: 'navigate',
                navigate_screen: selectedScreenId
              }
            ]
          }
        ]
      };

      // Log for debugging
      console.log('Flow template data:', JSON.stringify(templateData, null, 2));

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