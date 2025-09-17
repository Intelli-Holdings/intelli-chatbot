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
import { metaConfigService } from '@/services/meta-config';
import { Upload, Image as ImageIcon, Video, FileText } from 'lucide-react';

interface TestMessageDialogProps {
  template: WhatsAppTemplate | null;
  appService: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TestMessageDialog({ template, appService, isOpen, onClose }: TestMessageDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null);
  const [headerMediaHandle, setHeaderMediaHandle] = useState<string>('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (template) {
      // Extract variables from body text
      const bodyComponent = template.components?.find(c => c.type === 'BODY');
      if (bodyComponent?.text) {
        const variableMatches = bodyComponent.text.match(/\{\{(\d+)\}\}/g) || [];
        const uniqueVariables = new Set(
          variableMatches.map(match => {
            const numberMatch = match.match(/\d+/);
            return numberMatch ? parseInt(numberMatch[0]) : 0;
          })
        );
        
        // Create array based on highest variable number
        const maxVariableNum = uniqueVariables.size > 0 ? Math.max(...Array.from(uniqueVariables)) : 0;
        setVariables(new Array(maxVariableNum).fill(''));
      }

      // Reset media state when template changes
      setHeaderMediaFile(null);
      setHeaderMediaHandle('');
    }
  }, [template]);

  // Check if template has media header
  const getHeaderMediaType = () => {
    const headerComponent = template?.components?.find(c => c.type === 'HEADER');
    if (headerComponent?.format && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format)) {
      return headerComponent.format;
    }
    return undefined;
  };

  const uploadMediaToMeta = async (file: File): Promise<string> => {
    try {
      setIsUploadingMedia(true);
      
      const config = await metaConfigService.getConfigForAppService(appService);
      if (!config) {
        throw new Error('Could not get Meta app configuration');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('appId', config.appId);
      formData.append('accessToken', config.accessToken);

      const response = await fetch('/api/whatsapp/upload-media', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload media');
      }

      const data = await response.json();
      console.log('Media upload response:', data);
      
      if (!data.handle) {
        throw new Error('Media upload succeeded but no handle was returned');
      }
      
      return data.handle;
    } catch (error) {
      console.error('Meta upload error:', error);
      throw error;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const mediaType = getHeaderMediaType();
    if (!mediaType) return;

    setHeaderMediaFile(file);

    try {
      const handle = await uploadMediaToMeta(file);
      setHeaderMediaHandle(handle);
      toast.success('Media uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload media');
      setHeaderMediaFile(null);
    }
  };

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

    // Check if media is required but not uploaded
    const mediaType = getHeaderMediaType();
    if (mediaType && !headerMediaHandle) {
      toast.error(`Please upload ${mediaType.toLowerCase()} for the template header`);
      return;
    }

    setIsSending(true);

    try {
      const components = [];

      // Add header component if template has media header
      if (mediaType && headerMediaHandle) {
        const headerComponent: any = {
          type: "header",
          parameters: []
        };

        if (mediaType === 'IMAGE') {
          headerComponent.parameters.push({
            type: "image",
            image: {
              id: headerMediaHandle  // Use the handle as media ID
            }
          });
        } else if (mediaType === 'VIDEO') {
          headerComponent.parameters.push({
            type: "video",
            video: {
              id: headerMediaHandle
            }
          });
        } else if (mediaType === 'DOCUMENT') {
          headerComponent.parameters.push({
            type: "document",
            document: {
              id: headerMediaHandle,
              filename: headerMediaFile?.name || "document.pdf"
            }
          });
        }

        components.push(headerComponent);
      }

      // Add body component if there are variables
      if (variables.length > 0) {
        components.push({
          type: "body",
          parameters: variables.map(value => ({
            type: "text",
            text: value || `Sample Value ${variables.indexOf(value) + 1}`
          }))
        });
      }

      const messageData = {
        messaging_product: "whatsapp",
        to: cleanNumber,
        type: "template",
        template: {
          name: template.name,
          language: {
            code: template.language
          },
          components: components.length > 0 ? components : undefined
        }
      };

      console.log('Sending message with data:', messageData);

      await WhatsAppService.sendMessage(
        appService,
        messageData
      );

      toast.success("Test message sent successfully!");
      onClose();
      
      // Reset form
      setPhoneNumber('');
      setVariables([]);
      setHeaderMediaFile(null);
      setHeaderMediaHandle('');
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

  const mediaType = getHeaderMediaType();
  const acceptedFormats = {
    IMAGE: 'image/jpeg,image/png',
    VIDEO: 'video/mp4',
    DOCUMENT: 'application/pdf'
  };

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

          {/* Media upload section for templates with media headers */}
          {mediaType && (
            <div className="space-y-2">
              <Label>Template Header Media ({mediaType}) *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats[mediaType as keyof typeof acceptedFormats]}
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {headerMediaFile ? (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {mediaType === 'IMAGE' && <ImageIcon className="h-4 w-4" />}
                    {mediaType === 'VIDEO' && <Video className="h-4 w-4" />}
                    {mediaType === 'DOCUMENT' && <FileText className="h-4 w-4" />}
                    <span className="text-sm">{headerMediaFile.name}</span>
                    {headerMediaHandle && (
                      <span className="text-xs text-green-600">✓ Uploaded</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setHeaderMediaFile(null);
                      setHeaderMediaHandle('');
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingMedia}
                >
                  {isUploadingMedia ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {mediaType.toLowerCase()}
                    </>
                  )}
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground">
                {mediaType === 'IMAGE' && 'Supported: JPG, PNG (max 5MB)'}
                {mediaType === 'VIDEO' && 'Supported: MP4 (max 16MB)'}
                {mediaType === 'DOCUMENT' && 'Supported: PDF (max 100MB)'}
              </p>
            </div>
          )}

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
                    <div>{component.text || (component.format ? `[${component.format}]` : '')}</div>
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
              disabled={isSending || template.status !== 'APPROVED' || (mediaType && !headerMediaHandle)}
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