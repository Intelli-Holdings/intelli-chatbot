"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { type WhatsAppTemplate } from '@/services/whatsapp';
import { Upload, Image as ImageIcon, Video, FileText, Loader2, Info, MapPin } from 'lucide-react';

import { logger } from "@/lib/logger";
interface TestMessageDialogProps {
  template: WhatsAppTemplate | null;
  appService: any;
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string | null;
}

interface LocationData {
  latitude: string;
  longitude: string;
  name: string;
  address: string;
}

export default function TestMessageDialog({ template, appService, isOpen, onClose, organizationId }: TestMessageDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [headerVariables, setHeaderVariables] = useState<string[]>([]);
  const [buttonVariables, setButtonVariables] = useState<string[]>([]);
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null);
  const [headerMediaHandle, setHeaderMediaHandle] = useState<string>('');
  const [headerMediaId, setHeaderMediaId] = useState<string>('');
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
    const extractPlaceholderCount = (text?: string) => {
      if (!text) return 0;
      const matches = text.match(/\{\{(\d+)\}\}/g) || [];
      return matches.length;
    };

    if (template) {
      // Extract body variables
      const bodyComponent = template.components?.find(c => c.type === 'BODY');
      const bodyCount = extractPlaceholderCount(bodyComponent?.text);
      setVariables(bodyCount > 0 ? new Array(bodyCount).fill('') : []);

      // Extract header variables from header text (if any placeholders)
      const headerComponent = template.components?.find(c => c.type === 'HEADER');
      const headerCount = extractPlaceholderCount(headerComponent?.text);
      setHeaderVariables(headerCount > 0 ? new Array(headerCount).fill('') : []);

      // Extract button variables from URL buttons
      const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');
      let buttonCount = 0;
      if (buttonsComponent?.buttons?.length) {
        buttonsComponent.buttons.forEach((btn: any) => {
          if (btn.type === 'URL' && btn.url) {
            buttonCount += extractPlaceholderCount(btn.url);
          }
        });
      }
      setButtonVariables(buttonCount > 0 ? new Array(buttonCount).fill('') : []);

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

    // Check if media is variable or fixed
    // Variable media headers have a "text" field with placeholder like "{{1}}"
    const isVariable = !!(headerComponent as any).text;

    return {
      hasMedia: true,
      isVariable: isVariable, // Variable if has text field, fixed if not
      format: headerComponent.format as 'IMAGE' | 'VIDEO' | 'DOCUMENT',
      isLocation: false
    };
  };

  const uploadMediaToMeta = async (file: File): Promise<{ handle: string; id?: string }> => {
    if (!appService) {
      throw new Error('App service not provided');
    }

    const resolvedOrg =
      organizationId ||
      appService?.organizationId ||
      appService?.organization_id;

    if (!resolvedOrg) {
      throw new Error('Organization is required to upload media');
    }

    try {
      setIsUploadingMedia(true);

      const formData = new FormData();
      formData.append('media_file', file);
      formData.append('appservice_phone_number', appService.phone_number);
      formData.append('upload_type', 'media');
      if (appService.phone_number_id) {
        formData.append('phone_number_id', appService.phone_number_id);
      }
      if (appService.id) {
        formData.append('appservice_id', appService.id);
      }
      formData.append('organization', resolvedOrg);

      logger.info('Uploading media via backend...', {
        fileName: file.name,
        fileSize: file.size,
        appServicePhone: appService.phone_number
      });

      const response = await fetch('/api/whatsapp/templates/upload_media', {
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
        logger.error('Upload failed:', { error: error instanceof Error ? error.message : String(error) });
        throw new Error(error.error || 'Failed to upload media');
      }

      const data = await response.json();
      logger.info('Media upload response:', { data: data });

      if (!data.handle && !data.id) {
        throw new Error('No media handle received from upload');
      }

      return { handle: data.id || data.handle, id: data.id };
    } catch (error) {
      logger.error('Backend upload error:', { error: error instanceof Error ? error.message : String(error) });
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
      const { handle, id } = await uploadMediaToMeta(file);
      setHeaderMediaHandle(handle);
      setHeaderMediaId(id || '');
      toast.success('Media uploaded successfully!');
    } catch (error) {
      logger.error('File upload error:', { error: error instanceof Error ? error.message : String(error) });
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

    const orgId = organizationId || appService?.organizationId || appService?.organization_id;
    if (!orgId) {
      toast.error("Organization is required to send a test message");
      return;
    }

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

    // Validate media upload if template has media header (fixed or variable)
    if (headerInfo.hasMedia && !headerMediaHandle) {
      toast.error(`Please upload ${headerInfo.format?.toLowerCase()} for the template header`);
      return;
    }

    // Validate all required parameters are filled
    const emptyHeader = headerVariables.some(v => !v.trim());
    const emptyBody = variables.some(v => !v.trim());
    const emptyButtons = buttonVariables.some(v => !v.trim());

    if (headerVariables.length && emptyHeader) {
      toast.error("Please fill in all header parameter values");
      return;
    }
    if (variables.length && emptyBody) {
      toast.error("Please fill in all body parameter values");
      return;
    }
    if (buttonVariables.length && emptyButtons) {
      toast.error("Please fill in all button parameter values");
      return;
    }

    setIsSending(true);

    try {
      // Add body component if there are variables
      if (variables.length > 0) {
        const filledVariables = variables.filter(v => v.trim());
        if (filledVariables.length === 0) {
          toast.error("Please fill in at least one variable value");
          setIsSending(false);
          return;
        }

      }

      // Button parameters (URL placeholders)

      const headerComponent = template.components?.find(c => c.type === 'HEADER');
      const headerFormat = headerComponent?.format || 'TEXT';

      // Determine header params based on header type
      let finalHeaderParams = headerVariables;

      // For any media header we rely on the explicit media id/handle fields rather than header_params
      if (headerInfo.hasMedia) {
        finalHeaderParams = [];
      }

      const payload = {
        organization: orgId,
        template_name: template.name,
        template_language: template.language,
        header_format: headerFormat,
        phone_number: cleanNumber,
        header_params: finalHeaderParams,
        body_params: variables,
        button_params: buttonVariables,
        location: headerInfo.isLocation ? locationData : undefined,
        appservice_id: appService?.id,
        appservice_phone_number: appService?.phone_number,
        header_media_id: headerMediaId || headerMediaHandle || undefined,
        header_media_handle: headerMediaHandle || undefined,
        header_media_format: headerInfo.format,
      };

      const res = await fetch(`/api/whatsapp/templates/${template.id}/send_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result?.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      onClose();
      
      // Reset form
      setPhoneNumber('');
      setVariables([]);
      setHeaderVariables([]);
      setButtonVariables([]);
      setHeaderMediaFile(null);
      setHeaderMediaHandle('');
      setLocationData({
        latitude: '',
        longitude: '',
        name: '',
        address: ''
      });
    } catch (error) {
      logger.error('Send message error:', { error: error instanceof Error ? error.message : String(error) });
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

          {/* Media upload section - for templates with media headers (variable or fixed) */}
          {headerInfo.hasMedia && headerInfo.format && headerInfo.format !== 'LOCATION' && (
            <div className="space-y-2">
              <Label>Template Header Media ({headerInfo.format}) *</Label>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Upload a {headerInfo.format?.toLowerCase()} to send this template. If Meta stored fixed media, you can still override it here to avoid missing-media errors.
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
                      {isUploadingMedia && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                        </span>
                      )}
                      {!isUploadingMedia && headerMediaHandle && (
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
                        setHeaderMediaId('');
                      }}
                      disabled={isUploadingMedia}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {!isUploadingMedia && headerMediaHandle && (
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

          {/* Header variables */}
          {headerVariables.length > 0 && (
            <div className="space-y-2">
              <Label>Header Parameters</Label>
              {headerVariables.map((value, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`header-var-${index}`} className="text-sm">
                    Header Variable {index + 1}
                  </Label>
                  <Input
                    id={`header-var-${index}`}
                    placeholder={`Value for header {{${index + 1}}}`}
                    value={value}
                    onChange={(e) => {
                      const next = [...headerVariables];
                      next[index] = e.target.value;
                      setHeaderVariables(next);
                    }}
                  />
                </div>
              ))}
            </div>
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

          {/* Button variables */}
          {buttonVariables.length > 0 && (
            <div className="space-y-2">
              <Label>Button URL Parameters</Label>
              {buttonVariables.map((value, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`button-var-${index}`} className="text-sm">
                    Button Variable {index + 1}
                  </Label>
                  <Input
                    id={`button-var-${index}`}
                    placeholder={`Value for button {{${index + 1}}}`}
                    value={value}
                    onChange={(e) => {
                      const next = [...buttonVariables];
                      next[index] = e.target.value;
                      setButtonVariables(next);
                    }}
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
                isUploadingMedia ||
                (headerInfo.hasMedia && !headerMediaId && !headerMediaHandle) ||
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
