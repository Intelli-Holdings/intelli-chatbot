"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { type WhatsAppTemplate } from '@/services/whatsapp';
import { WhatsAppService } from '@/services/whatsapp';

interface TestMessageDialogProps {
  template: WhatsAppTemplate | null;
  appService: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TestMessageDialog({ template, appService, isOpen, onClose }: TestMessageDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  React.useEffect(() => {
    if (template) {
      // Extract variables from body text
      const bodyComponent = template.components?.find(c => c.type === 'BODY');
      if (bodyComponent?.text) {
        const variableMatches = bodyComponent.text.match(/\{\{(\d+)\}\}/g) || [];
        
        // Get unique variable numbers and find the maximum
        const uniqueVariables = new Set(
          variableMatches.map(match => parseInt(match.replace(/[{}]/g, '')))
        );
        
        // Create array based on highest variable number (e.g., {{1}}, {{3}} = 3 variables)
        const maxVariableNum = uniqueVariables.size > 0 ? Math.max(...Array.from(uniqueVariables)) : 0;
        setVariables(new Array(maxVariableNum).fill(''));
      }
    }
  }, [template]);

  const handleSendTest = async () => {
    if (!template || !appService) return;

    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    // Validate phone number format
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    if (cleanNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSending(true);

    try {
      const messageData = {
        messaging_product: "whatsapp",
        to: cleanNumber,
        type: "template",
        template: {
          name: template.name,
          language: {
            code: template.language
          },
          components: variables.length > 0 ? [
            {
              type: "body",
              parameters: variables.map(value => ({
                type: "text",
                text: value || `Sample Value ${variables.indexOf(value) + 1}`
              }))
            }
          ] : undefined
        }
      };

      await WhatsAppService.sendMessage(
        appService,
        messageData
      );

      toast.success("Test message sent successfully!");
      onClose();
      setPhoneNumber('');
      setVariables([]);
    } catch (error) {
      console.error('Send test message error:', error);
      toast.error("Failed to send test message");
    } finally {
      setIsSending(false);
    }
  };

  const updateVariable = (index: number, value: string) => {
    const newVariables = [...variables];
    newVariables[index] = value;
    setVariables(newVariables);
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Message</DialogTitle>
          <DialogDescription>
            Send a test message using template: {template.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              This will send a real WhatsApp message. Make sure you have permission from the recipient.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number *</Label>
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

          {variables.length > 0 && (
            <div className="space-y-2">
              <Label>Template Variables</Label>
              {variables.map((variable, index) => (
                <div key={index}>
                  <Label htmlFor={`var-${index}`} className="text-sm">
                    Variable {index + 1}
                  </Label>
                  <Input
                    id={`var-${index}`}
                    placeholder={`Value for {{${index + 1}}}`}
                    value={variable}
                    onChange={(e) => updateVariable(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 border rounded-lg bg-gray-50">
              <div className="text-sm">
                <div className="font-medium mb-1">Template: {template.name}</div>
                <div className="font-medium mb-1">Category: {template.category}</div>
                <div className="font-medium mb-2">Status: 
                  <span className={`ml-1 ${template.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {template.status}
                  </span>
                </div>
                {template.components?.map((component, index) => (
                  <div key={index} className="mb-2">
                    <div className="font-medium text-xs text-gray-500 uppercase">{component.type}</div>
                    <div>{component.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendTest} 
              disabled={isSending || template.status !== 'APPROVED'}
            >
              {isSending ? "Sending..." : "Send Test"}
            </Button>
          </div>

          {template.status !== 'APPROVED' && (
            <Alert>
              <AlertDescription>
                Only approved templates can be used to send messages.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
