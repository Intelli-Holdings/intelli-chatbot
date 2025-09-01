"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Upload, Send, Users } from 'lucide-react';
import { type WhatsAppTemplate, WhatsAppService } from '@/services/whatsapp';

interface TemplateBroadcastProps {
  templates: WhatsAppTemplate[];
  appService: any;
}

export default function TemplateBroadcast({ templates, appService }: TemplateBroadcastProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendingMethod, setSendingMethod] = useState<'individual' | 'bulk'>('individual');

  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');

  const handleTemplateSelect = (templateName: string) => {
    const template = approvedTemplates.find(t => t.name === templateName);
    setSelectedTemplate(template || null);
    
    if (template) {
      // Extract variables from body text
      const bodyComponent = template.components?.find(c => c.type === 'BODY');
      if (bodyComponent?.text) {
          variableMatches.map(match => parseInt(match.match(/\d+/)[0]))
        );
        
        // Create array based on highest variable number (e.g., {{1}}, {{3}} = 3 variables)
        const maxVariableNum = uniqueVariables.size > 0 ? Math.max(...Array.from(uniqueVariables)) : 0;
        setVariables(new Array(maxVariableNum).fill(''));
      }
    }
  };

  const addRecipient = () => {
    if (recipientInput.trim()) {
      const cleanNumber = recipientInput.replace(/[^\d]/g, '');
      if (cleanNumber.length >= 10) {
        setRecipients([...recipients, cleanNumber]);
        setRecipientInput('');
      } else {
        toast.error("Please enter a valid phone number");
      }
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const numbers = lines
          .map(line => line.trim().replace(/[^\d]/g, ''))
          .filter(number => number.length >= 10);
        
        setRecipients([...recipients, ...numbers]);
        toast.success(`Added ${numbers.length} phone numbers`);
      };
      reader.readAsText(file);
    }
  };

  const updateVariable = (index: number, value: string) => {
    const newVariables = [...variables];
    newVariables[index] = value;
    setVariables(newVariables);
  };

  const sendMessages = async () => {
    if (!selectedTemplate || !appService) {
      toast.error("Please select a template and ensure app service is configured");
      return;
    }

    if (recipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const recipient of recipients) {
        try {
          const messageData = {
            messaging_product: "whatsapp",
            to: recipient,
            type: "template",
            template: {
              name: selectedTemplate.name,
              language: {
                code: selectedTemplate.language
              },
              components: variables.length > 0 ? [
                {
                  type: "body",
                  parameters: variables.map(value => ({
                    type: "text",
                    text: value || `Sample Value`
                  }))
                }
              ] : undefined
            }
          };

          await WhatsAppService.sendMessage(
            appService,
            messageData
          );

          successCount++;
          
          // Add delay between messages to avoid rate limiting
          if (recipients.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Failed to send to ${recipient}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} messages`);
      }
      if (failCount > 0) {
        toast.error(`Failed to send ${failCount} messages`);
      }

      // Clear form after sending
      setRecipients([]);
      setVariables([]);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error("Failed to send messages");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Template Broadcast
        </CardTitle>
        <CardDescription>
          Send template messages to multiple recipients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {approvedTemplates.length === 0 && (
          <Alert>
            <AlertDescription>
              No approved templates available. Create and get approval for templates first.
            </AlertDescription>
          </Alert>
        )}

        {approvedTemplates.length > 0 && (
          <>
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an approved template" />
                </SelectTrigger>
                <SelectContent>
                  {approvedTemplates.map(template => (
                    <SelectItem key={template.id} value={template.name}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="space-y-2">
                <Label>Template Preview</Label>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="text-sm space-y-2">
                    {selectedTemplate.components?.map((component, index) => (
                      <div key={index}>
                        <div className="font-medium text-xs text-gray-500 uppercase">{component.type}</div>
                        <div>{component.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Variables */}
            {selectedTemplate && variables.length > 0 && (
              <div className="space-y-2">
                <Label>Template Variables</Label>
                <div className="grid grid-cols-2 gap-4">
                  {variables.map((variable, index) => (
                    <div key={index}>
                      <Label className="text-sm">Variable {index + 1}</Label>
                      <Input
                        placeholder={`Value for {{${index + 1}}}`}
                        value={variable}
                        onChange={(e) => updateVariable(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recipient Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Recipients ({recipients.length})</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendingMethod('individual')}
                    className={sendingMethod === 'individual' ? 'bg-blue-50' : ''}
                  >
                    Manual Entry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSendingMethod('bulk')}
                    className={sendingMethod === 'bulk' ? 'bg-blue-50' : ''}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Bulk Upload
                  </Button>
                </div>
              </div>

              {sendingMethod === 'individual' && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter phone number (e.g., +1234567890)"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  />
                  <Button onClick={addRecipient}>Add</Button>
                </div>
              )}

              {sendingMethod === 'bulk' && (
                <div>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleBulkUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a text or CSV file with phone numbers (one per line)
                  </p>
                </div>
              )}

              {/* Recipients List */}
              {recipients.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
                  <div className="flex flex-wrap gap-1">
                    {recipients.map((recipient, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeRecipient(index)}
                      >
                        {recipient} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {recipients.length} recipients selected
              </div>
              <Button
                onClick={sendMessages}
                disabled={!selectedTemplate || recipients.length === 0 || isSending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSending ? "Sending..." : `Send to ${recipients.length} recipients`}
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Make sure you have permission to message all recipients. 
                WhatsApp has strict policies against spam. Only send to opted-in contacts.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}
