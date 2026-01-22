'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Image, Video, FileText, Type, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { menu } = data;

  const currentHeaderType: HeaderType = menu.header?.type || 'none';

  const updateMenu = (updates: Partial<ChatbotMenu>) => {
    const newMenu = { ...menu, ...updates };
    onUpdate({ menu: newMenu, label: newMenu.name });
  };

  const handleHeaderTypeChange = (type: HeaderType) => {
    if (type === 'none') {
      updateMenu({ header: undefined });
    } else {
      updateMenu({
        header: {
          type: type as MenuHeader['type'],
          content: menu.header?.content || '',
        },
      });
    }
  };

  const handleHeaderContentChange = (content: string) => {
    if (menu.header) {
      updateMenu({
        header: { ...menu.header, content },
      });
    }
  };

  const addOption = () => {
    if (menu.messageType === 'interactive_buttons' && menu.options.length >= 3) {
      toast.error('Maximum 3 buttons allowed for interactive buttons');
      return;
    }
    if (menu.options.length >= CHATBOT_LIMITS.maxListItemsPerSection) {
      toast.error(`Maximum ${CHATBOT_LIMITS.maxListItemsPerSection} options allowed`);
      return;
    }

    const newOption: MenuOption = {
      id: generateId(),
      title: `Option ${menu.options.length + 1}`,
      action: {
        type: 'fallback_ai',
      },
    };

    updateMenu({ options: [...menu.options, newOption] });
  };

  const updateOption = (index: number, updates: Partial<MenuOption>) => {
    const newOptions = [...menu.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateMenu({ options: newOptions });
  };

  const deleteOption = (index: number) => {
    updateMenu({ options: menu.options.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Menu Name */}
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={menu.name}
          onChange={(e) => updateMenu({ name: e.target.value })}
          placeholder="Interactive message name"
        />
      </div>

      {/* Message Type */}
      <div className="space-y-2">
        <Label>Message Type</Label>
        <Select
          value={menu.messageType}
          onValueChange={(value: ChatbotMenu['messageType']) =>
            updateMenu({ messageType: value })
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
              value={menu.header?.content || ''}
              onChange={(e) => handleHeaderContentChange(e.target.value)}
              placeholder="Header text"
              maxLength={CHATBOT_LIMITS.maxHeaderTextLength}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(menu.header?.content || '').length}/{CHATBOT_LIMITS.maxHeaderTextLength}
            </p>
          </TabsContent>

          <TabsContent value="image" className="mt-2 space-y-2">
            <Input
              value={menu.header?.content || ''}
              onChange={(e) => handleHeaderContentChange(e.target.value)}
              placeholder="Image URL (https://...)"
            />
            {menu.header?.content && (
              <div className="relative w-full h-24 bg-muted rounded-lg overflow-hidden">
                <img
                  src={menu.header.content}
                  alt="Header preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Enter a public image URL (JPG, PNG)
            </p>
          </TabsContent>

          <TabsContent value="video" className="mt-2 space-y-2">
            <Input
              value={menu.header?.content || ''}
              onChange={(e) => handleHeaderContentChange(e.target.value)}
              placeholder="Video URL (https://...)"
            />
            <p className="text-xs text-muted-foreground">
              Enter a public video URL (MP4)
            </p>
          </TabsContent>

          <TabsContent value="document" className="mt-2 space-y-2">
            <Input
              value={menu.header?.content || ''}
              onChange={(e) => handleHeaderContentChange(e.target.value)}
              placeholder="Document URL (https://...)"
            />
            <p className="text-xs text-muted-foreground">
              Enter a public document URL (PDF)
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
          value={menu.body}
          onChange={(e) => updateMenu({ body: e.target.value })}
          placeholder="Enter your message..."
          rows={3}
          maxLength={CHATBOT_LIMITS.maxBodyLength}
        />
        <p className="text-xs text-muted-foreground text-right">
          {menu.body.length}/{CHATBOT_LIMITS.maxBodyLength}
        </p>
      </div>

      {/* Footer */}
      <div className="space-y-2">
        <Label>Footer (optional)</Label>
        <Input
          value={menu.footer || ''}
          onChange={(e) => updateMenu({ footer: e.target.value || undefined })}
          placeholder="Footer text"
          maxLength={CHATBOT_LIMITS.maxFooterLength}
        />
      </div>

      {/* Options */}
      {menu.messageType !== 'text' && (
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label>
              {menu.messageType === 'interactive_buttons' ? 'Buttons' : 'List Options'}
            </Label>
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {menu.options.map((option, index) => (
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

                  {menu.messageType === 'interactive_list' && (
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
                          targetMenuId: value === 'show_menu' ? option.action.targetMenuId : undefined,
                          message: value === 'send_message' ? option.action.message : undefined,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="show_menu">Go to Menu</SelectItem>
                      <SelectItem value="send_message">Send Message</SelectItem>
                      <SelectItem value="fallback_ai">Hand off to AI</SelectItem>
                      <SelectItem value="end">End Conversation</SelectItem>
                    </SelectContent>
                  </Select>

                  {option.action.type === 'show_menu' && (
                    <Select
                      value={option.action.targetMenuId || ''}
                      onValueChange={(value) =>
                        updateOption(index, {
                          action: { ...option.action, targetMenuId: value },
                        })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select target menu" />
                      </SelectTrigger>
                      <SelectContent>
                        {menus
                          .filter((m) => m.id !== menu.id)
                          .map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}

                  {option.action.type === 'send_message' && (
                    <Textarea
                      value={option.action.message || ''}
                      onChange={(e) =>
                        updateOption(index, {
                          action: { ...option.action, message: e.target.value },
                        })
                      }
                      placeholder="Message to send..."
                      rows={2}
                      className="text-sm"
                    />
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

            {menu.options.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No options added yet
              </p>
            )}
          </div>
        </div>
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
