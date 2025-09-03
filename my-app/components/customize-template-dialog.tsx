"use client"

import React, { useState, useRef, useEffect } from 'react';
import { metaConfigService } from '@/services/meta-config';
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
  Trash2
} from 'lucide-react';
import { DefaultTemplate } from '@/data/default-templates';

interface CustomizeTemplateDialogProps {
  template: DefaultTemplate | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (templateData: any, customizations: TemplateCustomizations) => Promise<boolean>;
  loading?: boolean;
  appService: any;
}

interface TemplateCustomizations {
  variables: { [key: string]: string };
  mediaFile?: File;
  mediaPreview?: string;
}

interface MediaRequirement {
  required: boolean;
  format: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  component: any;
}

// File size limits and accepted formats
const MEDIA_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    formats: ['.jpg', '.jpeg', '.png'],
    mimeTypes: ['image/jpeg', 'image/png'],
    accept: 'image/jpeg,image/png'
  },
  VIDEO: {
    maxSize: 16 * 1024 * 1024, // 16MB
    formats: ['.mp4'],
    mimeTypes: ['video/mp4'],
    accept: 'video/mp4'
  },
  DOCUMENT: {
    maxSize: 100 * 1024 * 1024, // 100MB
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
  appService
}: CustomizeTemplateDialogProps) {
  const [customizations, setCustomizations] = useState<TemplateCustomizations>({
    variables: {},
    mediaFile: undefined,
    mediaPreview: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset customizations when template changes
  useEffect(() => {
    if (template) {
      const variables: { [key: string]: string } = {};
      
      // Extract all variables from all components
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

      setCustomizations({
        variables,
        mediaFile: undefined,
        mediaPreview: undefined
      });
    }
  }, [template]);

  if (!template) return null;

  // Check if template requires media
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

  // Extract all variables from template text
  const getAllVariables = () => {
    const variables: string[] = [];
    
    template.components?.forEach(component => {
      if (component.text) {
        const matches = component.text.match(/\{\{(\d+)\}\}/g) || [];
        matches.forEach(match => {
          if (!variables.includes(match)) {
            variables.push(match);
          }
        });
      }
    });

    return variables.sort((a, b) => {
      const aNum = parseInt(a.replace(/[{}]/g, ''));
      const bNum = parseInt(b.replace(/[{}]/g, ''));
      return aNum - bNum;
    });
  };

  const allVariables = getAllVariables();

  // Handle variable input change
  const updateVariable = (variableKey: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [variableKey]: value
      }
    }));
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const limits = MEDIA_LIMITS[mediaRequirement.format];
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!limits.formats.includes(fileExtension)) {
      toast.error(`Invalid file format. Accepted formats: ${limits.formats.join(', ')}`);
      return;
    }

    // Check file size
    if (file.size > limits.maxSize) {
      const maxSizeMB = limits.maxSize / (1024 * 1024);
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Create preview URL for images and videos
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

  // Remove uploaded file
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

  // Upload file to Meta's API and get media handle
  const uploadMediaToMeta = async (file: File): Promise<string> => {
    try {
      setIsUploadingMedia(true);
      
      // Get the correct App ID from Meta using the access token
      const config = await metaConfigService.getConfigForAppService(appService);
      if (!config) {
        throw new Error('Could not get Meta app configuration');
      }

      // Use the backend API to upload the file
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
      return data.handle;
    } catch (error) {
      console.error('Meta upload error:', error);
      throw error;
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (mediaRequirement.required && !customizations.mediaFile) {
      toast.error('Media file is required for this template');
      return;
    }

    // Validate all variables are filled
    const emptyVariables = allVariables.filter(variable => {
      const key = variable.replace(/[{}]/g, '');
      return !customizations.variables[key]?.trim();
    });

    if (emptyVariables.length > 0) {
      toast.error('Please fill in all template variables');
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle media upload if required
      let headerMediaHandle = null;
      
      if (mediaRequirement.required && customizations.mediaFile) {
        try {
          toast.info("Uploading media to Meta...");
          headerMediaHandle = await uploadMediaToMeta(customizations.mediaFile);
        } catch (uploadError) {
          toast.error("Failed to upload media to Meta.");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare template data for the template creator
      const templateInputData = {
        name: template.name,
        category: template.category,
        language: template.language || 'en_US',
        headerType: mediaRequirement.required ? mediaRequirement.format : 'NONE',
        headerMediaHandle,
        body: template.components?.find(c => c.type === 'BODY')?.text || '',
        bodyVariables: allVariables,
        footer: template.components?.find(c => c.type === 'FOOTER')?.text || '',
        buttonType: template.components?.find(c => c.type === 'BUTTONS') ? 'QUICK_REPLY' : 'NONE',
        buttons: template.components?.find(c => c.type === 'BUTTONS')?.buttons || [],
        // Add customization values
        customVariableValues: customizations.variables
      };

      // Use the template creation handler
      const formattedTemplate = TemplateCreationHandler.createTemplate(templateInputData);

      // Override examples with actual customized values
      formattedTemplate.components = formattedTemplate.components.map(component => {
        if (component.type === 'BODY' && component.example?.body_text) {
          // Replace example values with actual customized values
          const customizedValues = allVariables.map(variable => {
            const key = variable.replace(/[{}]/g, '');
            return customizations.variables[key] || `Sample ${key}`;
          });
          
          component.example.body_text = [customizedValues];
        }

        if (component.type === 'HEADER' && component.example?.header_text) {
          // Replace example values with actual customized values for header
          const customizedValues = allVariables.map(variable => {
            const key = variable.replace(/[{}]/g, '');
            return customizations.variables[key] || `Sample ${key}`;
          });
          
          component.example.header_text = customizedValues;
        }

        return component;
      });

      const success = await onSubmit(formattedTemplate, customizations);
      if (success) {
        onClose();
        // Clean up preview URLs
        if (customizations.mediaPreview) {
          URL.revokeObjectURL(customizations.mediaPreview);
        }
      }
    } catch (error) {
      console.error('Template creation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview template with filled variables
  const getPreviewText = (text: string) => {
    if (!text) return '';
    
    let result = text;
    allVariables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '');
      const value = customizations.variables[key];
      if (value) {
        result = result.replace(variable, value);
      }
    });
    
    return result;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Customize Template: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customization Form */}
          <div className="space-y-6">
            {/* Media Upload Section */}
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

                    {/* Media Preview */}
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

            {/* Variables Section */}
            {allVariables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Fill in the values for dynamic variables in your template.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-4">
                    {allVariables.map((variable) => {
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
          </div>

          {/* Template Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="space-y-3">
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
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                                {mediaRequirement.format === 'IMAGE' && (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={customizations.mediaPreview}
                                      alt="Header"
                                      className="w-full max-h-32 object-cover"
                                    />
                                  </>
                                )}
                                {mediaRequirement.format === 'VIDEO' && (
                                  <video
                                    src={customizations.mediaPreview}
                                    className="w-full max-h-32 object-cover"
                                    muted
                                  />
                                )}
                              </div>
                            )}
                            {mediaRequirement.required && !customizations.mediaPreview && (
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-8 flex items-center justify-center">
                                {mediaRequirement.format === 'IMAGE' && <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                                {mediaRequirement.format === 'VIDEO' && <Video className="h-8 w-8 text-muted-foreground" />}
                                {mediaRequirement.format === 'DOCUMENT' && <FileText className="h-8 w-8 text-muted-foreground" />}
                              </div>
                            )}
                          </div>
                        )}

                        {component.type === 'BODY' && component.text && (
                          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {getPreviewText(component.text)}
                          </div>
                        )}

                        {component.type === 'FOOTER' && component.text && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                            {component.text}
                          </div>
                        )}

                        {component.type === 'BUTTONS' && component.buttons && (
                          <div className="pt-2 space-y-1">
                            {component.buttons.map((button: any, buttonIndex: number) => (
                              <div 
                                key={buttonIndex}
                                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-center text-sm bg-gray-50 dark:bg-gray-800"
                              >
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {button.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-3">
                    <span className="text-xs text-gray-400">Template Preview</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
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

