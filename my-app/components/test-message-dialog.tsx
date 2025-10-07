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
import { Upload, Image as ImageIcon, Video, FileText, Loader2, Info, MapPin } from 'lucide-react';

interface TestMessageDialogProps {
  template: WhatsAppTemplate | null;
  appService: any;
  isOpen: boolean;
  onClose: () => void;
}

interface LocationData {
  latitude: string;
  longitude: string;
  name: string;
  address: string;
}

export default function TestMessageDialog({ template, appService, isOpen, onClose }: TestMessageDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [headerVariables, setHeaderVariables] = useState<string[]>([]);
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null);
  const [headerMediaHandle, setHeaderMediaHandle] = useState<string>('');
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: '',
    longitude: '',
    name: '',
    address: ''
  });
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
        const headerParams = headerComponent.example.header_handle || headerComponent.example.header_text || [];
        setHeaderVariables(new Array(headerParams.length).fill(''));
      } else {
        setHeaderVariables([]);
      }

      // Reset media and location state
      setHeaderMediaFile(null);
      setHeaderMediaHandle('');
      setLocationData({
        latitude: '',
        longitude: '',
        name: '',
        address: ''
      });
    }
  }, [template]);

  // Check if template has media header and whether it's variable or fixed
  const getHeaderMediaInfo = () => {
    const headerComponent = template?.components?.find(c => c.type === 'HEADER');
    
    if (!headerComponent?.format) {
      return { hasMedia: false, isVariable: false, format: undefined, isLocation: false };
    }

    // Check if it's a location header (always variable - requires location data when sending)
    if (headerComponent.format === 'LOCATION') {
      return {
        hasMedia: false,
        isVariable: false,
        format: 'LOCATION' as const,
        isLocation: true
      };
    }

    // Check for other media types
    if (!['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format)) {
      return { hasMedia: false, isVariable: false, format: undefined, isLocation: false };
    }


    return {
      hasMedia: true,
      isVariable: false, // Media headers are fixed - use template's pre-uploaded media
      format: headerComponent.format as 'IMAGE' | 'VIDEO' | 'DOCUMENT',
      isLocation: false
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

  const validateLocationData = (): boolean => {
    if (!locationData.latitude.trim()) {
      toast.error("Latitude is required");
      return false;
    }
    if (!locationData.longitude.trim()) {
      toast.error("Longitude is required");
      return false;
    }
    if (!locationData.name.trim()) {
      toast.error("Location name is required");
      return false;
    }
    if (!locationData.address.trim()) {
      toast.error("Address is required");
      return false;
    }

    // Validate latitude range (-90 to 90)
    const lat = parseFloat(locationData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return false;
    }

    // Validate longitude range (-180 to 180)
    const lng = parseFloat(locationData.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return false;
    }

    return true;
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
    
    // Validate location data if template has location header
    if (headerInfo.isLocation && !validateLocationData()) {
      return;
    }

    setIsSending(true);

    try {
      const components = [];

      // Add location header component
      if (headerInfo.isLocation) {
        components.push({
          type: "header",
          parameters: [
            {
              type: "location",
              location: {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                name: locationData.name,
                address: locationData.address
              }
            }
          ]
        });
      }
      
      // Note: For IMAGE/VIDEO/DOCUMENT headers, we DON'T add a header component
      // The template will automatically use its pre-uploaded media from the template definition

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
      setLocationData({
        latitude: '',
        longitude: '',
        name: '',
        address: ''
      });
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

  const updateLocationField = (field: keyof LocationData, value: string) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!template) return null;

  const headerInfo = getHeaderMediaInfo();
  const acceptedFormats: Record<'IMAGE' | 'VIDEO' | 'DOCUMENT', string> = {
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

          {/* Location input section - for templates with LOCATION header */}
          {headerInfo.isLocation && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Details *
              </Label>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  This template requires location information. Enter the coordinates, name, and address.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="location-name" className="text-sm">Location Name *</Label>
                <Input
                  id="location-name"
                  placeholder="e.g., Philz Coffee"
                  value={locationData.name}
                  onChange={(e) => updateLocationField('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-address" className="text-sm">Address *</Label>
                <Input
                  id="location-address"
                  placeholder="e.g., 101 Forest Ave, Palo Alto, CA 94301"
                  value={locationData.address}
                  onChange={(e) => updateLocationField('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="location-latitude" className="text-sm">Latitude *</Label>
                  <Input
                    id="location-latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 37.4421"
                    value={locationData.latitude}
                    onChange={(e) => updateLocationField('latitude', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">-90 to 90</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-longitude" className="text-sm">Longitude *</Label>
                  <Input
                    id="location-longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -122.1616"
                    value={locationData.longitude}
                    onChange={(e) => updateLocationField('longitude', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">-180 to 180</p>
                </div>
              </div>
            </div>
          )}

          {/* Media upload section - ONLY for templates with VARIABLE media */}
          {headerInfo.isVariable && headerInfo.format && headerInfo.format !== 'LOCATION' && (
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
                accept={acceptedFormats[headerInfo.format as 'IMAGE' | 'VIDEO' | 'DOCUMENT']}
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
                (headerInfo.isLocation && (!locationData.latitude || !locationData.longitude || !locationData.name || !locationData.address))
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