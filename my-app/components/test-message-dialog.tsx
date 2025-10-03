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
import { Upload, Image as ImageIcon, Video, FileText, Loader2, Info } from 'lucide-react';

interface TestMessageDialogProps {
  template: WhatsAppTemplate | null;
  appService: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TestMessageDialog({ template, appService, isOpen, onClose }: TestMessageDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [headerVariables, setHeaderVariables] = useState<string[]>([]);
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null);
  const [headerMediaHandle, setHeaderMediaHandle] = useState<string>('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (template) {
      // Extract body variables
      const bodyComponent = template.components?.find(c => c.type === 'BODY');
      if (bodyComponent?.text) {
        const variableMatches = bodyComponent.text.match(/\{\{(\d+)\}\}/g) || [];
        const uniqueVariables = new Set(
          variableMatches.map(match => {
            const numberMatch = match.match(/\d+/);
            return numberMatch ? parseInt(numberMatch[0]) : 0;
          })
        );
        const maxVariableNum = uniqueVariables.size > 0 ? Math.max(...Array.from(uniqueVariables)) : 0;
        setVariables(new Array(maxVariableNum).fill(''));
      }

      // Extract header variables (for variable media templates)
      const headerComponent = template.components?.find(c => c.type === 'HEADER');
      if (headerComponent?.example?.header_handle || headerComponent?.example?.header_text) {
        // This template has variable media in the header
        const headerParams = headerComponent.example.header_handle || headerComponent.example.header_text || [];
        setHeaderVariables(new Array(headerParams.length).fill(''));
      } else {
        setHeaderVariables([]);
      }

      // Reset media state
      setHeaderMediaFile(null);
      setHeaderMediaHandle('');
    }
  }, [template]);

  // Check if template has media header and whether it's variable or fixed
  const getHeaderMediaInfo = () => {
    const headerComponent = template?.components?.find(c => c.type === 'HEADER');
    
    if (!headerComponent?.format || !['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format)) {
      return { hasMedia: false, isVariable: false, format: undefined };
    }

    // Check if header has variables (example parameters)
    const hasVariables = !!(
      headerComponent.example?.header_handle?.length || 
      headerComponent.example?.header_text?.length
    );

    return {
      hasMedia: true,
      isVariable: hasVariables,
      format: headerComponent.format as 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    };
  };

  const uploadMediaToMeta = async (file: File): Promise<string> => {
    if (!appService) {
      throw new Error('App service not provided');
    }

    if (!appService.access_token || appService.access_token === 'undefined') {
      console.error('Invalid access token in appService:', appService);
      throw new Error('Valid access token not available');
    }

    try {
      setIsUploadingMedia(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', appService.access_token);

      console.log('Uploading media to Resumable Upload API...', {
        fileName: file.name,
        fileSize: file.size
      });

      const response = await fetch('/api/whatsapp/upload-media', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText };
        }
        console.error('Upload failed:', error);
        throw new Error(error.error || 'Failed to upload media');
      }

      const data = await response.json();
      console.log('Media upload response:', data);
      
      if (!data.handle) {
        throw new Error('No media handle received from upload');
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

    setHeaderMediaFile(file);

    try {
      const handle = await uploadMediaToMeta(file);
      setHeaderMediaHandle(handle);
      toast.success('Media uploaded successfully!');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload media');
      setHeaderMediaFile(null);
      setHeaderMediaHandle('');
    }
  };

  const handleSendTest = async () => {
    if (!template || !appService) return;

    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    if (cleanNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const headerInfo = getHeaderMediaInfo();
    
    // Only require media upload if template has VARIABLE media
    if (headerInfo.isVariable && !headerMediaHandle) {
      toast.error(`Please upload ${headerInfo.format?.toLowerCase()} for the template header`);
      return;
    }

    setIsSending(true);

    try {
      const components = [];

      // Add header component ONLY if template has VARIABLE media
      if (headerInfo.isVariable && headerMediaHandle) {
        const headerComponent: any = {
          type: "header",
          parameters: []
        };

        if (headerInfo.format === 'IMAGE') {
          headerComponent.parameters.push({
            type: "image",
            image: {
              id: headerMediaHandle
            }
          });
        } else if (headerInfo.format === 'VIDEO') {
          headerComponent.parameters.push({
            type: "video",
            video: {
              id: headerMediaHandle
            }
          });
        } else if (headerInfo.format === 'DOCUMENT') {
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
      // If template has FIXED media (no variables), we don't add header component
      // The media is already part of the template definition

      // Add body component if there are variables
      if (variables.length > 0) {
        const filledVariables = variables.filter(v => v.trim());
        if (filledVariables.length === 0) {
          toast.error("Please fill in at least one variable value");
          setIsSending(false);
          return;
        }

        components.push({
          type: "body",
          parameters: variables.map((value, index) => ({
            type: "text",
            text: value || `Sample Value ${index + 1}`
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

      console.log('Sending message with data:', JSON.stringify(messageData, null, 2));

      await WhatsAppService.sendMessage(
        appService,
        messageData
      );

      toast.success("Message sent successfully!");
      onClose();
      
      // Reset form
      setPhoneNumber('');
      setVariables([]);
      setHeaderVariables([]);
      setHeaderMediaFile(null);
      setHeaderMediaHandle('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
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

  const headerInfo = getHeaderMediaInfo();
  const acceptedFormats = {
    IMAGE: 'image/jpeg,image/png',
    VIDEO: 'video/mp4',
    DOCUMENT: 'application/pdf'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a message using template: {template.name}
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
              Include country code (e.g., +1 for US, +256 for Uganda)
            </p>
          </div>

          {/* Media upload section - ONLY for templates with VARIABLE media */}
          {headerInfo.isVariable && headerInfo.format && (
            <div className="space-y-2">
              <Label>Template Header Media ({headerInfo.format}) *</Label>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This template requires you to upload media for each message sent.
                </AlertDescription>
              </Alert>

              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFormats[headerInfo.format]}
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {headerMediaFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {headerInfo.format === 'IMAGE' && <ImageIcon className="h-4 w-4" />}
                      {headerInfo.format === 'VIDEO' && <Video className="h-4 w-4" />}
                      {headerInfo.format === 'DOCUMENT' && <FileText className="h-4 w-4" />}
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
                  
                  {headerMediaHandle && (
                    <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                      <span className="font-medium text-green-700 dark:text-green-400">
                        ✓ Media handle received and ready to send
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingMedia}
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {headerInfo.format.toLowerCase()}
                    </>
                  )}
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground">
                {headerInfo.format === 'IMAGE' && 'Supported: JPG, PNG (max 5MB)'}
                {headerInfo.format === 'VIDEO' && 'Supported: MP4 (max 16MB)'}
                {headerInfo.format === 'DOCUMENT' && 'Supported: PDF (max 100MB)'}
              </p>
            </div>
          )}

          {/* Info for templates with FIXED media */}
          {headerInfo.hasMedia && !headerInfo.isVariable && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This template has fixed media that was uploaded during template creation. No media upload needed for sending.
              </AlertDescription>
            </Alert>
          )}

          {/* Body variables */}
          {variables.length > 0 && (
            <div className="space-y-2">
              <Label>Template Variables</Label>
              {variables.map((variable, index) => (
                <div key={index} className="space-y-1">
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

          {/* Template Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-sm space-y-2">
                <div className="font-medium">Template: {template.name}</div>
                <div className="font-medium">Category: {template.category}</div>
                <div className="font-medium">
                  Status: 
                  <span className={`ml-1 ${template.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {template.status}
                  </span>
                </div>
                {template.components?.map((component, index) => (
                  <div key={index} className="pt-2">
                    <div className="font-medium text-xs text-gray-500 dark:text-gray-400 uppercase">
                      {component.type}
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {component.text || (component.format ? `[${component.format}]` : '')}
                    </div>
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
              disabled={
                isSending || 
                template.status !== 'APPROVED' || 
                (headerInfo.isVariable && !headerMediaHandle)
              }
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
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