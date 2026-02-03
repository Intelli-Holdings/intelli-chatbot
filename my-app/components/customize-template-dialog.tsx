"use client"

import React, { useState, useRef, useEffect } from 'react';
import { TemplateCreationHandler } from '@/utils/template-creator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  Eye, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Info,
  Loader2,
  Plus,
  Trash2,
  Link as LinkIcon,
  Phone as PhoneIcon
} from 'lucide-react';
import { DefaultTemplate } from '@/data/default-templates';

interface CustomizeTemplateDialogProps {
  template: DefaultTemplate | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (templateData: any, customizations: TemplateCustomizations) => Promise<boolean>;
  loading?: boolean;
  appService: any;
  organizationId?: string | null;
}

interface TemplateCustomizations {
  variables: { [key: string]: string };
  urlButtonVariables: { [key: string]: string };
  phoneNumbers: { [key: string]: string }; // NEW: Store custom phone numbers
  buttonUrls: { [key: string]: string }; // NEW: Store custom URLs
  mediaFile?: File;
  mediaPreview?: string;
}

interface MediaRequirement {
  required: boolean;
  format: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  component: any;
}

const MEDIA_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024,
    formats: ['.jpg', '.jpeg', '.png'],
    mimeTypes: ['image/jpeg', 'image/png'],
    accept: 'image/jpeg,image/png'
  },
  VIDEO: {
    maxSize: 16 * 1024 * 1024,
    formats: ['.mp4'],
    mimeTypes: ['video/mp4'],
    accept: 'video/mp4'
  },
  DOCUMENT: {
    maxSize: 100 * 1024 * 1024,
    formats: ['.pdf'],
    mimeTypes: ['application/pdf'],
    accept: 'application/pdf'
  }
};

export function CustomizeTemplateDialog({ 
  template, 
  open, 
  onClose, 
  onSubmit, 
  loading = false,
  appService,
  organizationId
}: CustomizeTemplateDialogProps) {
  const [customizations, setCustomizations] = useState<TemplateCustomizations>({
    variables: {},
    urlButtonVariables: {},
    phoneNumbers: {},
    buttonUrls: {},
    mediaFile: undefined,
    mediaPreview: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (template) {
      const variables: { [key: string]: string } = {};
      const urlButtonVariables: { [key: string]: string } = {};
      const phoneNumbers: { [key: string]: string } = {};
      const buttonUrls: { [key: string]: string } = {};
      
      // Extract body/header variables
      template.components?.forEach(component => {
        if (component.text) {
          const matches = component.text.match(/\{\{(\d+)\}\}/g) || [];
          matches.forEach(match => {
            const variableKey = match.replace(/[{}]/g, '');
            if (!variables[variableKey]) {
              variables[variableKey] = '';
            }
          });
        }
      });

      // Extract button information
      const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');
      buttonsComponent?.buttons?.forEach((button, buttonIndex) => {
        // Phone number buttons
        if (button.type === 'PHONE_NUMBER') {
          const key = `phone_${buttonIndex}`;
          phoneNumbers[key] = button.phone_number || '';
        }
        
        // URL buttons
        if (button.type === 'URL') {
          const urlKey = `url_${buttonIndex}`;
          buttonUrls[urlKey] = button.url || '';
          
          // URL variables
          if (button.url?.includes('{{')) {
            const matches = button.url.match(/\{\{(\d+)\}\}/g) || [];
            matches.forEach(match => {
              const key = `url_button_${buttonIndex}_${match.replace(/[{}]/g, '')}`;
              urlButtonVariables[key] = '';
            });
          }
        }
      });

      setCustomizations({
        variables,
        urlButtonVariables,
        phoneNumbers,
        buttonUrls,
        mediaFile: undefined,
        mediaPreview: undefined
      });
    }
  }, [template]);

  if (!template) return null;

  const extractVariables = (text?: string): string[] => {
    if (!text) return [];
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    const unique = Array.from(new Set(matches));
    return unique.sort((a, b) => {
      const aNum = parseInt(a.replace(/[{}]/g, ''));
      const bNum = parseInt(b.replace(/[{}]/g, ''));
      return aNum - bNum;
    });
  };

  const getMediaRequirement = (): MediaRequirement => {
    const headerComponent = template.components?.find(c => c.type === 'HEADER');
    
    if (headerComponent && headerComponent.format && 
        ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format)) {
      return {
        required: true,
        format: headerComponent.format as 'IMAGE' | 'VIDEO' | 'DOCUMENT',
        component: headerComponent
      };
    }

    return {
      required: false,
      format: 'IMAGE',
      component: null
    };
  };

  const mediaRequirement = getMediaRequirement();

  const getAllVariables = () => {
    const bodyVariables: string[] = [];
    const urlButtonVariables: Array<{variable: string, buttonIndex: number, buttonText: string}> = [];
    
    template.components?.forEach(component => {
      if (component.type === 'BODY' && component.text) {
        const matches = component.text.match(/\{\{(\d+)\}\}/g) || [];
        matches.forEach(match => {
          if (!bodyVariables.includes(match)) {
            bodyVariables.push(match);
          }
        });
      }
      
      if (component.type === 'HEADER' && component.format === 'TEXT' && component.text) {
        const matches = component.text.match(/\{\{(\d+)\}\}/g) || [];
        matches.forEach(match => {
          if (!bodyVariables.includes(match)) {
            bodyVariables.push(match);
          }
        });
      }
    });

    const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');
    buttonsComponent?.buttons?.forEach((button, index) => {
      if (button.type === 'URL' && button.url?.includes('{{')) {
        const matches = button.url.match(/\{\{(\d+)\}\}/g) || [];
        matches.forEach(match => {
          urlButtonVariables.push({
            variable: match,
            buttonIndex: index,
            buttonText: button.text || 'Button'
          });
        });
      }
    });

    return {
      bodyVariables: bodyVariables.sort((a, b) => {
        const aNum = parseInt(a.replace(/[{}]/g, ''));
        const bNum = parseInt(b.replace(/[{}]/g, ''));
        return aNum - bNum;
      }),
      urlButtonVariables
    };
  };

  const variableData = getAllVariables();
  const bodyText = template.components?.find(c => c.type === 'BODY')?.text || '';
  const headerComponent = template.components?.find(c => c.type === 'HEADER');
  const headerText = headerComponent?.format === 'TEXT' ? (headerComponent.text || '') : '';
  const bodyVariables = extractVariables(bodyText);
  const headerVariables = extractVariables(headerText);

  // Get buttons for customization
  const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');
  const phoneButtons = buttonsComponent?.buttons?.filter(b => b.type === 'PHONE_NUMBER') || [];
  const urlButtons = buttonsComponent?.buttons?.filter(b => b.type === 'URL') || [];

  const updateVariable = (variableKey: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variableKey]: value
      }
    }));
  };

  const updateUrlButtonVariable = (key: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      urlButtonVariables: {
        ...prev.urlButtonVariables,
        [key]: value
      }
    }));
  };

  const updatePhoneNumber = (key: string, value: string) => {
    // Auto-format phone number
    let cleanValue = value.replace(/\s/g, '');
    setCustomizations(prev => ({
      ...prev,
      phoneNumbers: {
        ...prev.phoneNumbers,
        [key]: cleanValue
      }
    }));
  };

  const updateButtonUrl = (key: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      buttonUrls: {
        ...prev.buttonUrls,
        [key]: value
      }
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const limits = MEDIA_LIMITS[mediaRequirement.format];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!limits.formats.includes(fileExtension)) {
      toast.error(`Invalid file format. Accepted formats: ${limits.formats.join(', ')}`);
      return;
    }

    if (file.size > limits.maxSize) {
      const maxSizeMB = limits.maxSize / (1024 * 1024);
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    let previewUrl = "";
    if (mediaRequirement.format === 'IMAGE' || mediaRequirement.format === 'VIDEO') {
      previewUrl = URL.createObjectURL(file);
    }

    setCustomizations(prev => ({
      ...prev,
      mediaFile: file,
      mediaPreview: previewUrl
    }));

    toast.success(`${file.name} uploaded successfully`);
  };

  const removeUploadedFile = () => {
    if (customizations.mediaPreview) {
      URL.revokeObjectURL(customizations.mediaPreview);
    }
    
    setCustomizations(prev => ({
      ...prev,
      mediaFile: undefined,
      mediaPreview: undefined
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadMediaToMeta = async (file: File): Promise<string> => {
    if (!appService) {
      throw new Error('App service not provided');
    }

    try {
      setIsUploadingMedia(true);

      const resolvedOrg =
        organizationId ||
        appService?.organizationId ||
        appService?.organization_id;

      if (!resolvedOrg) {
        throw new Error('Organization is required to upload media');
      }

      const formData = new FormData();
      formData.append('media_file', file);
      formData.append('appservice_phone_number', appService.phone_number);
      if (appService.id) {
        formData.append('appservice_id', String(appService.id));
      }
      formData.append('upload_type', 'resumable');
      formData.append('organization', resolvedOrg);

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
        console.error('Upload failed:', error);
        throw new Error(error.error || 'Failed to upload media');
      }

      const data = await response.json();

      if (!data.handle) {
        throw new Error('No media handle received from upload');
      }

      return data.handle;
    } catch (error) {
      console.error('Backend upload error:', error);
      throw error;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSubmit = async () => {
    if (mediaRequirement.required && !customizations.mediaFile) {
      toast.error('Media file is required for this template');
      return;
    }

    // Validate body/header variables
    const emptyBodyVars = variableData.bodyVariables.filter(variable => {
      const key = variable.replace(/[{}]/g, '');
      return !customizations.variables[key]?.trim();
    });

    if (emptyBodyVars.length > 0) {
      toast.error('Please fill in all message variables');
      return;
    }

    // Validate URL button variables
    const emptyUrlVars = variableData.urlButtonVariables.filter(({ variable, buttonIndex }) => {
      const key = `url_button_${buttonIndex}_${variable.replace(/[{}]/g, '')}`;
      return !customizations.urlButtonVariables[key]?.trim();
    });

    if (emptyUrlVars.length > 0) {
      toast.error('Please fill in all button URL parameters');
      return;
    }

    // Validate phone numbers
    buttonsComponent?.buttons?.forEach((button, index) => {
      if (button.type === 'PHONE_NUMBER') {
        const key = `phone_${index}`;
        const phoneNumber = customizations.phoneNumbers[key];
        if (!phoneNumber || !phoneNumber.trim()) {
          toast.error(`Please enter phone number for "${button.text}" button`);
          return;
        }
      }
    });

    // Validate button URLs
    buttonsComponent?.buttons?.forEach((button, index) => {
      if (button.type === 'URL') {
        const key = `url_${index}`;
        const url = customizations.buttonUrls[key];
        if (!url || !url.trim()) {
          toast.error(`Please enter URL for "${button.text}" button`);
          return;
        }
      }
    });

    setIsSubmitting(true);

    try {
      let headerMediaHandle = null;
      
      if (mediaRequirement.required && customizations.mediaFile) {
        try {
          toast.info("Uploading media to Meta...");
          headerMediaHandle = await uploadMediaToMeta(customizations.mediaFile);
          toast.success("Media uploaded successfully!");
        } catch (uploadError) {
          console.error('Failed to upload media:', uploadError);
          toast.error(uploadError instanceof Error ? uploadError.message : "Failed to upload media to Meta");
          setIsSubmitting(false);
          return;
        }
      }

      let headerType: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' = 'NONE';
      let headerTextForTemplate: string | undefined = undefined;
      let headerVariablesForTemplate: string[] | undefined = undefined;

      if (headerComponent) {
        if (headerComponent.format === 'TEXT') {
          headerType = 'TEXT';
          headerTextForTemplate = headerText;
          headerVariablesForTemplate = headerVariables;
        } else if (headerComponent.format === 'IMAGE' || headerComponent.format === 'VIDEO' || headerComponent.format === 'DOCUMENT') {
          headerType = headerComponent.format as 'IMAGE' | 'VIDEO' | 'DOCUMENT';
        }
      }

      // Apply custom phone numbers and URLs to buttons
      const customizedButtons = buttonsComponent?.buttons?.map((button, index) => {
        const customButton = { ...button };
        
        if (button.type === 'PHONE_NUMBER') {
          const key = `phone_${index}`;
          let phoneNumber = customizations.phoneNumbers[key] || button.phone_number || '';
          // Ensure E.164 format
          if (phoneNumber && !phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
          }
          customButton.phone_number = phoneNumber;
        }
        
        if (button.type === 'URL') {
          const key = `url_${index}`;
          customButton.url = customizations.buttonUrls[key] || button.url || '';
        }
        
        return customButton;
      }) || [];
      
      const templateInputData = {
        name: template.name,
        category: template.category,
        language: template.language,
        add_security_recommendation: template.add_security_recommendation,
        code_expiration_minutes: template.code_expiration_minutes,
        headerType: headerType === 'NONE' ? (mediaRequirement.required ? mediaRequirement.format : 'NONE') : headerType,
        headerText: headerTextForTemplate,
        headerVariables: headerVariablesForTemplate,
        headerMediaHandle,
        body: (template.category === 'AUTHENTICATION' && bodyVariables.length > 0) 
          ? '' 
          : bodyText,
        bodyVariables: bodyVariables,
        footer: template.components?.find(c => c.type === 'FOOTER')?.text || '',
        buttonType: template.components?.find(c => c.type === 'BUTTONS') ? 'CALL_TO_ACTION' : 'NONE',
        buttons: customizedButtons, // Use customized buttons
        customVariableValues: customizations.variables
      };

      const formattedTemplate = TemplateCreationHandler.createTemplate(templateInputData);

      // CRITICAL SAFETY NET: Ensure examples are in correct Meta API format
      formattedTemplate.components = formattedTemplate.components.map(component => {
        const originalComponent = template.components?.find(c => c.type === component.type);
        
        if (component.type === 'BODY') {
          const componentBodyVariables = extractVariables(component.text);

          if (!component.example) component.example = {};

          // AUTHENTICATION: Preserve original prefilled examples if provided; otherwise use empty [[]]
          if (template.category === 'AUTHENTICATION') {
            const orig = originalComponent?.example?.body_text;
            if (orig && Array.isArray(orig) && Array.isArray(orig[0]) && orig[0].length > 0) {
              component.example.body_text = orig;
            } else {
              component.example.body_text = [[]];
            }
          } else if (componentBodyVariables.length > 0) {
            const bodyValues = componentBodyVariables.map(variable => {
              const key = variable.replace(/[{}]/g, '');
              return customizations.variables[key] || `Sample ${key}`;
            });

            // CRITICAL: body_text must be array of arrays [[value1, value2, ...]]
            component.example.body_text = [bodyValues];
          } else if (originalComponent?.example?.body_text) {
            const originalExample = originalComponent.example.body_text;
            if (Array.isArray(originalExample[0])) {
              component.example.body_text = originalExample;
            } else {
              component.example.body_text = [originalExample];
            }
          } else {
            component.example.body_text = [[]];
          }
        }

        if (component.type === 'HEADER') {
          if (component.format === 'TEXT' && headerVariables.length > 0) {
            const headerValues = headerVariables.map(variable => {
              const key = variable.replace(/[{}]/g, '');
              return customizations.variables[key] || `Sample ${key}`;
            });

            if (!component.example) component.example = {};
            component.example.header_text = headerValues;
          }
          
          if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format || '')) {
            if (!component.example) component.example = {};
            if (headerMediaHandle) {
              component.example.header_handle = [headerMediaHandle];
            } else if (originalComponent?.example?.header_handle) {
              component.example.header_handle = originalComponent.example.header_handle;
            } else {
              component.example.header_handle = [''];
            }
          }
        }

        if (component.type === 'BUTTONS' && component.buttons) {
          component.buttons = component.buttons.map((button: any, btnIndex: number) => {
            if (button.type) {
              button.type = button.type.toUpperCase();
            }
            
            if (button.type === 'URL' && button.url?.includes('{{')) {
              const urlVariable = (button.url.match(/\{\{(\d+)\}\}/g) || [])[0];
              if (urlVariable) {
                const key = `url_button_${btnIndex}_${urlVariable.replace(/[{}]/g, '')}`;
                const exampleValue = customizations.urlButtonVariables[key] || 'default-value';
                button.example = [exampleValue];
              }
            }

            // CRITICAL: Ensure phone numbers have E.164 format
            if (button.type === 'PHONE_NUMBER' && button.phone_number) {
              if (!button.phone_number.startsWith('+')) {
                button.phone_number = '+' + button.phone_number;
              }
            }
            
            return button;
          });
        }

        return component;
      });

      console.log('Final template being sent to API:', JSON.stringify(formattedTemplate, null, 2));

      try {
        const success = await onSubmit(formattedTemplate, customizations);
        if (success) {
          onClose();
          if (customizations.mediaPreview) {
            URL.revokeObjectURL(customizations.mediaPreview);
          }
        }
      } catch (error) {
        console.error('Template creation error:', error);
        toast.error(error instanceof Error ? error.message : "Failed to create template");
      }
    } catch (error) {
      console.error('Template submission error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPreviewText = (text: string, isUrlButton: boolean = false, buttonIndex?: number) => {
    if (!text) return '';
    
    let result = text;
    
    if (isUrlButton && buttonIndex !== undefined) {
      const matches = text.match(/\{\{(\d+)\}\}/g) || [];
      matches.forEach(variable => {
        const key = `url_button_${buttonIndex}_${variable.replace(/[{}]/g, '')}`;
        const value = customizations.urlButtonVariables[key];
        if (value) {
          result = result.replace(variable, value);
        } else {
          result = result.replace(variable, `[URL Param]`);
        }
      });
    } else {
      variableData.bodyVariables.forEach(variable => {
        const key = variable.replace(/[{}]/g, '');
        const value = customizations.variables[key];
        if (value) {
          result = result.replace(variable, value);
        }
      });
    }
    
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Customize Template: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Customization Fields */}
          <div className="space-y-6">
            {mediaRequirement.required && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {mediaRequirement.format === 'IMAGE' && <ImageIcon className="h-5 w-5" />}
                    {mediaRequirement.format === 'VIDEO' && <Video className="h-5 w-5" />}
                    {mediaRequirement.format === 'DOCUMENT' && <FileText className="h-5 w-5" />}
                    Upload {mediaRequirement.format}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This template requires a {mediaRequirement.format.toLowerCase()} file for the header.
                      {isUploadingMedia && (
                        <div className="flex items-center gap-2 mt-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs">Uploading to Meta...</span>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={MEDIA_LIMITS[mediaRequirement.format].accept}
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {customizations.mediaFile ? (
                      <Card className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{customizations.mediaFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(customizations.mediaFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeUploadedFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {mediaRequirement.format}
                      </Button>
                    )}

                    {customizations.mediaPreview && (
                      <Card className="p-3">
                        <div className="text-xs font-medium mb-2">Preview</div>
                        {mediaRequirement.format === 'IMAGE' && (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={customizations.mediaPreview}
                              alt="Preview"
                              className="w-full max-h-48 object-contain rounded"
                            />
                          </>
                        )}
                        {mediaRequirement.format === 'VIDEO' && (
                          <video
                            src={customizations.mediaPreview}
                            className="w-full max-h-48 rounded"
                            controls
                          />
                        )}
                      </Card>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {mediaRequirement.format === 'IMAGE' && "Supported: JPG, PNG (max 5MB)"}
                    {mediaRequirement.format === 'VIDEO' && "Supported: MP4 (max 16MB)"}
                    {mediaRequirement.format === 'DOCUMENT' && "Supported: PDF (max 100MB)"}
                  </div>
                </CardContent>
              </Card>
            )}

            {variableData.bodyVariables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      These variables will be used in your message body and header.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4">
                    {variableData.bodyVariables.map((variable) => {
                      const key = variable.replace(/[{}]/g, '');
                      
                      return (
                        <div key={variable} className="space-y-2">
                          <Label className="text-sm font-medium">
                            Variable {key}
                            <Badge variant="outline" className="ml-2 text-xs">
                              {variable}
                            </Badge>
                          </Label>
                          <Input                        
                            placeholder={`Enter value for ${variable}`}
                            value={customizations.variables[key] || ''}
                            onChange={(e) => updateVariable(key, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NEW: Phone Number Customization */}
            {phoneButtons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5" />
                    Phone Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Customize phone numbers for call buttons. Must be in E.164 format (e.g., +15551234567).
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4">
                    {phoneButtons.map((button, index) => {
                      const actualIndex = buttonsComponent?.buttons?.findIndex(b => b === button) ?? index;
                      const key = `phone_${actualIndex}`;
                      
                      return (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm font-medium">
                            {button.text} Button
                            <Badge variant="outline" className="ml-2 text-xs">
                              Phone
                            </Badge>
                          </Label>
                          <Input
                            type="tel"
                            placeholder="+15551234567"
                            value={customizations.phoneNumbers[key] || ''}
                            onChange={(e) => updatePhoneNumber(key, e.target.value)}
                            onBlur={(e) => {
                              let value = e.target.value.trim();
                              if (value && !value.startsWith('+')) {
                                value = '+' + value;
                                updatePhoneNumber(key, value);
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            E.164 format required. The + will be added automatically if missing.
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NEW: URL Customization */}
            {urlButtons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Button URLs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Customize the URLs for your link buttons.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4">
                    {urlButtons.map((button, index) => {
                      const actualIndex = buttonsComponent?.buttons?.findIndex(b => b === button) ?? index;
                      const key = `url_${actualIndex}`;
                      
                      return (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm font-medium">
                            {button.text} Button
                            <Badge variant="outline" className="ml-2 text-xs">
                              URL
                            </Badge>
                          </Label>
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            value={customizations.buttonUrls[key] || ''}
                            onChange={(e) => updateButtonUrl(key, e.target.value)}
                          />
                          {button.url?.includes('{{') && (
                            <p className="text-xs text-blue-600">
                              Note: This URL contains variables. Fill them below.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {variableData.urlButtonVariables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    URL Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      These parameters will be appended to button URLs.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4">
                    {variableData.urlButtonVariables.map(({ variable, buttonIndex, buttonText }) => {
                      const key = `url_button_${buttonIndex}_${variable.replace(/[{}]/g, '')}`;
                      const button = template.components?.find(c => c.type === 'BUTTONS')?.buttons?.[buttonIndex];
                      
                      return (
                        <div key={key} className="space-y-2">
                          <Label className="text-sm font-medium">
                            {buttonText} - Parameter
                            <Badge variant="outline" className="ml-2 text-xs">
                              {variable}
                            </Badge>
                          </Label>
                          <Input                        
                            placeholder={`Enter parameter value`}
                            value={customizations.urlButtonVariables[key] || ''}
                            onChange={(e) => updateUrlButtonVariable(key, e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Current URL: {button?.url}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - WhatsApp-Style Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  WhatsApp Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* WhatsApp chat background */}
                <div className="bg-[#e5ddd5] dark:bg-gray-800 p-4 rounded-lg min-h-[400px]">
                  {/* Message bubble - right side (business sending) */}
                  <div className="flex justify-end mb-2">
                    <div className="max-w-[85%]">
                      <div className="bg-[#dcf8c6] dark:bg-green-900 rounded-lg shadow-md p-3 space-y-2">
                        {/* Header */}
                        {template.components?.map((component, index) => (
                          <div key={index}>
                            {component.type === 'HEADER' && (
                              <div className="space-y-2">
                                {component.format === 'TEXT' && component.text && (
                                  <div className="font-semibold text-sm">
                                    {getPreviewText(component.text)}
                                  </div>
                                )}
                                {mediaRequirement.required && customizations.mediaPreview && (
                                  <div className="rounded-md overflow-hidden -mx-1 -mt-1 mb-2">
                                    {mediaRequirement.format === 'IMAGE' && (
                                      <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={customizations.mediaPreview}
                                          alt="Header"
                                          className="w-full max-h-48 object-cover"
                                        />
                                      </>
                                    )}
                                    {mediaRequirement.format === 'VIDEO' && (
                                      <video
                                        src={customizations.mediaPreview}
                                        className="w-full max-h-48 object-cover"
                                        muted
                                      />
                                    )}
                                  </div>
                                )}
                                {mediaRequirement.required && !customizations.mediaPreview && (
                                  <div className="bg-gray-200 dark:bg-gray-700 rounded-md p-8 flex items-center justify-center -mx-1 -mt-1 mb-2">
                                    {mediaRequirement.format === 'IMAGE' && <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                                    {mediaRequirement.format === 'VIDEO' && <Video className="h-8 w-8 text-muted-foreground" />}
                                    {mediaRequirement.format === 'DOCUMENT' && <FileText className="h-8 w-8 text-muted-foreground" />}
                                  </div>
                                )}
                              </div>
                            )}

                            {component.type === 'BODY' && component.text && (
                              <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {getPreviewText(component.text)}
                              </div>
                            )}

                            {component.type === 'FOOTER' && component.text && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 pt-1">
                                {component.text}
                              </div>
                            )}

                            {component.type === 'BUTTONS' && component.buttons && (
                              <div className="pt-2 space-y-1">
                                {component.buttons.map((button: any, buttonIndex: number) => {
                                  let displayUrl = button.url || '';
                                  let displayPhone = button.phone_number || '';
                                  
                                  // Get custom values
                                  if (button.type === 'PHONE_NUMBER') {
                                    const key = `phone_${buttonIndex}`;
                                    displayPhone = customizations.phoneNumbers[key] || displayPhone;
                                  }
                                  
                                  if (button.type === 'URL') {
                                    const key = `url_${buttonIndex}`;
                                    displayUrl = customizations.buttonUrls[key] || displayUrl;
                                    displayUrl = getPreviewText(displayUrl, true, buttonIndex);
                                  }
                                  
                                  return (
                                    <div 
                                      key={buttonIndex}
                                      className="border-t border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm bg-white/50 dark:bg-black/20"
                                    >
                                      <span className="text-[#00a5f4] dark:text-blue-400 font-medium flex items-center justify-center gap-2">
                                        {button.type === 'PHONE_NUMBER' && <PhoneIcon className="h-3 w-3" />}
                                        {button.type === 'URL' && <LinkIcon className="h-3 w-3" />}
                                        {button.text}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* WhatsApp message timestamp */}
                        <div className="flex justify-end items-center gap-1 pt-1">
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">
                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 16 15" fill="none">
                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground space-y-1">
                  <p>• This preview shows how your message will appear in WhatsApp</p>
                  <p>• Messages from businesses appear on the right (green bubble)</p>
                  <p>• Customize all fields on the left to see changes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingMedia || loading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Template...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
