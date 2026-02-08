'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, GripVertical, Image, Video, FileText, Type, X, Check, Upload, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  QuestionNodeData,
  ChatbotMenu,
  MenuOption,
  MenuHeader,
  generateId,
  CHATBOT_LIMITS,
} from '@/types/chatbot-automation';
import { toast } from 'sonner';
import { useAppServices } from '@/hooks/use-app-services';
import { uploadMediaViaAzure, shouldUseAzureUpload } from '@/lib/azure-media-upload';

interface QuestionNodeEditorProps {
  data: QuestionNodeData;
  onUpdate: (data: Partial<QuestionNodeData>) => void;
  menus: ChatbotMenu[];
}

type HeaderType = 'none' | 'text' | 'image' | 'video' | 'document';

export default function QuestionNodeEditor({
  data,
  onUpdate,
  menus,
}: QuestionNodeEditorProps) {
  // Local state for editing
  const [localMenu, setLocalMenu] = useState<ChatbotMenu>(data.menu);
  const [delaySeconds, setDelaySeconds] = useState<number>(data.delaySeconds || 0);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get app service for access token
  const { selectedAppService, loading: appServiceLoading, error: appServiceError } = useAppServices();

  // Debug: log app service state
  useEffect(() => {
    console.log('[FlowBuilder] AppService state:', {
      loading: appServiceLoading,
      error: appServiceError,
      hasService: !!selectedAppService,
      phoneNumber: selectedAppService?.phone_number,
    });
  }, [appServiceLoading, appServiceError, selectedAppService]);

  // Reset local state when data changes (e.g., switching nodes)
  useEffect(() => {
    setLocalMenu(data.menu);
    setDelaySeconds(data.delaySeconds || 0);
    setHasChanges(false);
    setUploadedFileName('');
  }, [data.menu.id, data.delaySeconds]);

  const currentHeaderType: HeaderType = localMenu.header?.type || 'none';

  // Handle file upload - uses Azure for large files to bypass server limits
  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'document') => {
    if (appServiceLoading) {
      toast.error('Loading WhatsApp service, please wait...');
      return;
    }

    if (!selectedAppService) {
      toast.error('No WhatsApp service configured. Please set up a WhatsApp Business account first.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (!selectedAppService.access_token || !selectedAppService.phone_number_id) {
      toast.error('WhatsApp service is not properly configured');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    try {
      // Use Azure upload for large files (> 4MB) to bypass server limits
      if (shouldUseAzureUpload(file)) {
        const result = await uploadMediaViaAzure(
          file,
          {
            accessToken: selectedAppService.access_token,
            phoneNumberId: selectedAppService.phone_number_id,
            uploadType: 'media',
          },
          (progress) => {
            // Could add progress UI here if needed
            console.log('Upload progress:', progress.message);
          }
        );

        if (!result.success || !result.id) {
          throw new Error(result.error || 'Upload failed: missing media ID');
        }

        updateLocalMenu({
          header: {
            type,
            content: result.id,
          },
        });
        setUploadedFileName(file.name);
        toast.success('File uploaded successfully');
        return;
      }

      // Standard upload for small files
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', selectedAppService.access_token);
      formData.append('phoneNumberId', selectedAppService.phone_number_id);
      formData.append('uploadType', 'media');

      const response = await fetch('/api/whatsapp/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to upload file';
        try {
          const error = JSON.parse(text);
          errorMessage = error.error || errorMessage;
        } catch {
          if (text) {
            errorMessage = text;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result || !result.id) {
        throw new Error('Invalid response: missing media ID');
      }

      updateLocalMenu({
        header: {
          type,
          content: result.id,
        },
      });
      setUploadedFileName(file.name);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptTypes = (type: 'image' | 'video' | 'document') => {
    switch (type) {
      case 'image':
        return 'image/jpeg,image/jpg,image/png';
      case 'video':
        return 'video/mp4';
      case 'document':
        return 'application/pdf';
    }
  };

  const updateLocalMenu = (updates: Partial<ChatbotMenu>) => {
    setLocalMenu(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!localMenu.body.trim()) {
      toast.error('Please enter a body message');
      return;
    }
    onUpdate({ menu: localMenu, label: 'Interactive Message', delaySeconds });
    setHasChanges(false);
    toast.success('Changes saved');
  };

  const handleDelayChange = (enabled: boolean) => {
    setDelaySeconds(enabled ? 2 : 0);
    setHasChanges(true);
  };

  const handleDelaySecondsChange = (value: number) => {
    setDelaySeconds(Math.max(1, Math.min(30, value)));
    setHasChanges(true);
  };

  const handleHeaderTypeChange = (type: HeaderType) => {
    if (type === 'none') {
      updateLocalMenu({ header: undefined });
    } else {
      updateLocalMenu({
        header: {
          type: type as MenuHeader['type'],
          content: localMenu.header?.content || '',
        },
      });
    }
  };

  const handleHeaderContentChange = (content: string) => {
    if (localMenu.header) {
      updateLocalMenu({
        header: { ...localMenu.header, content },
      });
    }
  };

  const addOption = () => {
    // Validate based on message type
    const maxOptions = localMenu.messageType === 'interactive_buttons'
      ? 3
      : CHATBOT_LIMITS.maxListItemsPerSection;

    if (localMenu.options.length >= maxOptions) {
      toast.error(
        localMenu.messageType === 'interactive_buttons'
          ? 'Maximum 3 buttons allowed for interactive buttons'
          : `Maximum ${CHATBOT_LIMITS.maxListItemsPerSection} options allowed`
      );
      return;
    }

    const newOption: MenuOption = {
      id: generateId(),
      title: `Option ${localMenu.options.length + 1}`,
      action: {
        type: 'fallback_ai',
      },
    };

    updateLocalMenu({ options: [...localMenu.options, newOption] });
  };

  const updateOption = (index: number, updates: Partial<MenuOption>) => {
    const newOptions = [...localMenu.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateLocalMenu({ options: newOptions });
  };

  const deleteOption = (index: number) => {
    updateLocalMenu({ options: localMenu.options.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Message Type */}
      <div className="space-y-2">
        <Label>Message Type</Label>
        <Select
          value={localMenu.messageType}
          onValueChange={(value: ChatbotMenu['messageType']) =>
            updateLocalMenu({ messageType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text Only</SelectItem>
            <SelectItem value="interactive_buttons">Buttons (max 3)</SelectItem>
            <SelectItem value="interactive_list">List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Header Section */}
      <div className="space-y-3 pt-2 border-t">
        <Label>Header (optional)</Label>

        {/* Header Type Tabs */}
        <Tabs value={currentHeaderType} onValueChange={(v) => handleHeaderTypeChange(v as HeaderType)}>
          <TabsList className="grid grid-cols-5 h-9">
            <TabsTrigger value="none" className="text-xs px-2">
              <X className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs px-2">
              <Type className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs px-2">
              <Image className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs px-2">
              <Video className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="document" className="text-xs px-2">
              <FileText className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="none" className="mt-2">
            <p className="text-xs text-muted-foreground">No header</p>
          </TabsContent>

          <TabsContent value="text" className="mt-2">
            <Input
              value={localMenu.header?.content || ''}
              onChange={(e) => handleHeaderContentChange(e.target.value)}
              placeholder="Header text"
              maxLength={CHATBOT_LIMITS.maxHeaderTextLength}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(localMenu.header?.content || '').length}/{CHATBOT_LIMITS.maxHeaderTextLength}
            </p>
          </TabsContent>

          <TabsContent value="image" className="mt-2 space-y-2">
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept={getAcceptTypes('image')}
                onChange={(e) => handleFileSelect(e, 'image')}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadedFileName && localMenu.header?.type === 'image' ? uploadedFileName : 'Upload Image'}
                  </>
                )}
              </Button>
              {localMenu.header?.content && localMenu.header?.type === 'image' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Image uploaded</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG (max 100MB)
            </p>
          </TabsContent>

          <TabsContent value="video" className="mt-2 space-y-2">
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept={getAcceptTypes('video')}
                onChange={(e) => handleFileSelect(e, 'video')}
                className="hidden"
                id="video-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('video-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadedFileName && localMenu.header?.type === 'video' ? uploadedFileName : 'Upload Video'}
                  </>
                )}
              </Button>
              {localMenu.header?.content && localMenu.header?.type === 'video' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Video uploaded</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported format: MP4 (max 100MB)
            </p>
          </TabsContent>

          <TabsContent value="document" className="mt-2 space-y-2">
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept={getAcceptTypes('document')}
                onChange={(e) => handleFileSelect(e, 'document')}
                className="hidden"
                id="document-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('document-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadedFileName && localMenu.header?.type === 'document' ? uploadedFileName : 'Upload Document'}
                  </>
                )}
              </Button>
              {localMenu.header?.content && localMenu.header?.type === 'document' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Document uploaded</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported format: PDF (max 100MB)
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Body */}
      <div className="space-y-2 pt-2 border-t">
        <Label>
          Body Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={localMenu.body}
          onChange={(e) => updateLocalMenu({ body: e.target.value })}
          placeholder="Enter your message..."
          rows={3}
          maxLength={CHATBOT_LIMITS.maxBodyLength}
        />
        <p className="text-xs text-muted-foreground text-right">
          {localMenu.body.length}/{CHATBOT_LIMITS.maxBodyLength}
        </p>
      </div>

      {/* Footer */}
      <div className="space-y-2">
        <Label>Footer (optional)</Label>
        <Input
          value={localMenu.footer || ''}
          onChange={(e) => updateLocalMenu({ footer: e.target.value || undefined })}
          placeholder="Footer text"
          maxLength={CHATBOT_LIMITS.maxFooterLength}
        />
      </div>

      {/* Delay */}
      <div className="space-y-3 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label>Delay Reply</Label>
              <p className="text-xs text-muted-foreground">
                Add a delay before sending
              </p>
            </div>
          </div>
          <Switch
            checked={delaySeconds > 0}
            onCheckedChange={handleDelayChange}
          />
        </div>

        {delaySeconds > 0 && (
          <div className="space-y-2">
            <Label>Delay Duration (seconds)</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={delaySeconds}
              onChange={(e) => handleDelaySecondsChange(parseInt(e.target.value) || 0)}
            />
          </div>
        )}
      </div>

      {/* Options */}
      {localMenu.messageType !== 'text' && (
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label>
              {localMenu.messageType === 'interactive_buttons' ? 'Buttons' : 'List Options'}
            </Label>
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {localMenu.options.map((option, index) => (
              <div
                key={option.id}
                className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground mt-2 cursor-grab flex-shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Input
                    value={option.title}
                    onChange={(e) => updateOption(index, { title: e.target.value })}
                    placeholder="Button text"
                    maxLength={CHATBOT_LIMITS.maxButtonTitleLength}
                    className="h-8"
                  />

                  {localMenu.messageType === 'interactive_list' && (
                    <Input
                      value={option.description || ''}
                      onChange={(e) =>
                        updateOption(index, { description: e.target.value || undefined })
                      }
                      placeholder="Description (optional)"
                      maxLength={CHATBOT_LIMITS.maxButtonDescriptionLength}
                      className="h-8 text-sm"
                    />
                  )}

                  <Select
                    value={option.action.type}
                    onValueChange={(value: MenuOption['action']['type']) =>
                      updateOption(index, {
                        action: {
                          ...option.action,
                          type: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_message">Send Message</SelectItem>
                      <SelectItem value="fallback_ai">Hand off to AI</SelectItem>
                    </SelectContent>
                  </Select>

                  {option.action.type === 'send_message' && (
                    <p className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/30 px-2 py-1.5 rounded">
                      Connect this button to a Message node in the flow
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => deleteOption(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {localMenu.options.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No options added yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <Button onClick={handleSave} size="sm" className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          Each button/option creates a connection point. Drag from the option handle to connect to the next step in your flow.
        </p>
      </div>
    </div>
  );
}
