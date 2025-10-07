"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, X, Upload, ChevronLeft, ChevronRight, 
  Info, Image as ImageIcon, Video, Trash2, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface CarouselCard {
  id: string;
  headerMediaFile: File | null;
  headerMediaHandle: string;
  headerMediaPreview: string;
  headerMediaType: 'IMAGE' | 'VIDEO';
  bodyText: string;
  buttons: CarouselButton[];
}

interface CarouselButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
  urlVariable?: string;
}

interface CarouselTemplateCreatorProps {
  onComplete: (carouselData: any) => void;
  onBack: () => void;
  appService: any;
  templateName: string;
  language: string;
}

const MEDIA_LIMITS = {
  IMAGE: { maxSize: 5 * 1024 * 1024, formats: ['.jpg', '.jpeg', '.png'], accept: 'image/jpeg,image/png' },
  VIDEO: { maxSize: 16 * 1024 * 1024, formats: ['.mp4'], accept: 'video/mp4' }
};

export default function CarouselTemplateCreator({
  onComplete,
  onBack,
  appService,
  templateName,
  language
}: CarouselTemplateCreatorProps) {
  const [messageBody, setMessageBody] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState<CarouselCard[]>([
    {
      id: '1',
      headerMediaFile: null,
      headerMediaHandle: '',
      headerMediaPreview: '',
      headerMediaType: 'IMAGE',
      bodyText: '',
      buttons: []
    },
    {
      id: '2',
      headerMediaFile: null,
      headerMediaHandle: '',
      headerMediaPreview: '',
      headerMediaType: 'IMAGE',
      bodyText: '',
      buttons: []
    }
  ]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCard = cards[currentCardIndex];

  const uploadMediaToMeta = async (file: File): Promise<string> => {
    if (!appService?.access_token || appService.access_token === 'undefined') {
      throw new Error('Valid access token not available');
    }

    try {
      setIsUploadingMedia(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', appService.access_token);

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
        throw new Error(error.error || 'Failed to upload media');
      }

      const data = await response.json();
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

    const mediaType = currentCard.headerMediaType;
    const limits = MEDIA_LIMITS[mediaType];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!limits.formats.includes(fileExtension)) {
      toast.error(`Invalid file format. Accepted: ${limits.formats.join(', ')}`);
      return;
    }

    if (file.size > limits.maxSize) {
      toast.error(`File exceeds ${limits.maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    updateCard(currentCardIndex, {
      headerMediaFile: file,
      headerMediaPreview: previewUrl
    });

    try {
      const handle = await uploadMediaToMeta(file);
      updateCard(currentCardIndex, { headerMediaHandle: handle });
      toast.success('Media uploaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload media');
      updateCard(currentCardIndex, {
        headerMediaFile: null,
        headerMediaPreview: '',
        headerMediaHandle: ''
      });
    }
  };

  const updateCard = (index: number, updates: Partial<CarouselCard>) => {
    setCards(prev => prev.map((card, i) => 
      i === index ? { ...card, ...updates } : card
    ));
  };

  const addCard = () => {
    if (cards.length >= 10) {
      toast.error('Maximum 10 cards allowed');
      return;
    }

    setCards(prev => [...prev, {
      id: String(prev.length + 1),
      headerMediaFile: null,
      headerMediaHandle: '',
      headerMediaPreview: '',
      headerMediaType: cards[0].headerMediaType,
      bodyText: '',
      buttons: []
    }]);
    setCurrentCardIndex(cards.length);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 2) {
      toast.error('Minimum 2 cards required');
      return;
    }

    setCards(prev => prev.filter((_, i) => i !== index));
    if (currentCardIndex >= cards.length - 1) {
      setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
    }
  };

  const addButton = () => {
    if (currentCard.buttons.length >= 2) {
      toast.error('Maximum 2 buttons per card');
      return;
    }

    updateCard(currentCardIndex, {
      buttons: [...currentCard.buttons, {
        type: 'QUICK_REPLY',
        text: ''
      }]
    });
  };

  const updateButton = (buttonIndex: number, updates: Partial<CarouselButton>) => {
    const newButtons = [...currentCard.buttons];
    newButtons[buttonIndex] = { ...newButtons[buttonIndex], ...updates };
    updateCard(currentCardIndex, { buttons: newButtons });
  };

  const removeButton = (buttonIndex: number) => {
    updateCard(currentCardIndex, {
      buttons: currentCard.buttons.filter((_, i) => i !== buttonIndex)
    });
  };

  const validateCarousel = (): boolean => {
    if (!messageBody.trim()) {
      toast.error('Message body is required');
      return false;
    }

    // Check all cards have media
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].headerMediaHandle) {
        toast.error(`Card ${i + 1}: Media upload required`);
        setCurrentCardIndex(i);
        return false;
      }
    }

    // Check structure consistency
    const firstHasBody = !!cards[0].bodyText.trim();
    const firstButtonCount = cards[0].buttons.length;

    for (let i = 1; i < cards.length; i++) {
      const hasBody = !!cards[i].bodyText.trim();
      if (hasBody !== firstHasBody) {
        toast.error(`Card ${i + 1}: All cards must have same structure (body text)`);
        setCurrentCardIndex(i);
        return false;
      }

      if (cards[i].buttons.length !== firstButtonCount) {
        toast.error(`Card ${i + 1}: All cards must have same number of buttons`);
        setCurrentCardIndex(i);
        return false;
      }
    }

    return true;
  };

  const handleComplete = () => {
    if (!validateCarousel()) return;

    const carouselData = {
      messageBody,
      cards: cards.map(card => ({
        headerMediaHandle: card.headerMediaHandle,
        headerMediaType: card.headerMediaType,
        bodyText: card.bodyText,
        buttons: card.buttons
      }))
    };

    onComplete(carouselData);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          {templateName} • Carousel Template
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Carousel templates allow 2-10 cards with images/videos. All cards must have the same structure.
        </AlertDescription>
      </Alert>

      {/* Message Body */}
      <div className="space-y-2">
        <Label htmlFor="message-body">Message Body (appears above carousel) *</Label>
        <Textarea
          id="message-body"
          placeholder="Check out these amazing products! {{1}}"
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          rows={3}
          maxLength={1024}
        />
        <p className="text-xs text-muted-foreground">
          This message appears above the carousel cards
        </p>
      </div>

      {/* Card Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Card {currentCardIndex + 1} of {cards.length}</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentCardIndex(Math.min(cards.length - 1, currentCardIndex + 1))}
            disabled={currentCardIndex === cards.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          {cards.length < 10 && (
            <Button variant="outline" size="sm" onClick={addCard}>
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          )}
          {cards.length > 2 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => removeCard(currentCardIndex)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Current Card Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Card {currentCardIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Media Type Selection */}
          <div className="space-y-2">
            <Label>Media Type *</Label>
            <Select
              value={currentCard.headerMediaType}
              onValueChange={(value: 'IMAGE' | 'VIDEO') => {
                updateCard(currentCardIndex, { 
                  headerMediaType: value,
                  headerMediaFile: null,
                  headerMediaHandle: '',
                  headerMediaPreview: ''
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </div>
                </SelectItem>
                <SelectItem value="VIDEO">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Header Media *</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={MEDIA_LIMITS[currentCard.headerMediaType].accept}
              onChange={handleFileUpload}
              className="hidden"
            />

            {currentCard.headerMediaFile ? (
              <div className="space-y-2">
                {currentCard.headerMediaPreview && currentCard.headerMediaType === 'IMAGE' && (
                  <Image 
                    src={currentCard.headerMediaPreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                    width={400}
                    height={200}
                  />
                )}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {currentCard.headerMediaType === 'IMAGE' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                    <span className="text-sm">{currentCard.headerMediaFile.name}</span>
                    {currentCard.headerMediaHandle && (
                      <span className="text-xs text-green-600">✓ Uploaded</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateCard(currentCardIndex, {
                      headerMediaFile: null,
                      headerMediaHandle: '',
                      headerMediaPreview: ''
                    })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingMedia}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload {currentCard.headerMediaType}
              </Button>
            )}
          </div>

          {/* Body Text */}
          <div className="space-y-2">
            <Label htmlFor={`body-${currentCardIndex}`}>
              Card Body Text (Optional)
            </Label>
            <Textarea
              id={`body-${currentCardIndex}`}
              placeholder="Product description with {{1}} variable"
              value={currentCard.bodyText}
              onChange={(e) => updateCard(currentCardIndex, { bodyText: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              All cards must have same structure - if one has body text, all must
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Buttons (Max 2 per card)</Label>
              {currentCard.buttons.length < 2 && (
                <Button variant="outline" size="sm" onClick={addButton}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Button
                </Button>
              )}
            </div>

            {currentCard.buttons.map((button, btnIndex) => (
              <Card key={btnIndex} className="p-3">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-sm">Button {btnIndex + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeButton(btnIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Button text (25 chars max)"
                    value={button.text}
                    onChange={(e) => updateButton(btnIndex, { text: e.target.value })}
                    maxLength={25}
                  />

                  <Select
                    value={button.type}
                    onValueChange={(value: any) => updateButton(btnIndex, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                      <SelectItem value="URL">Website URL</SelectItem>
                      <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
                    </SelectContent>
                  </Select>

                  {button.type === 'URL' && (
                    <>
                      <Input
                        placeholder="https://example.com/product/{{1}}"
                        value={button.url || ''}
                        onChange={(e) => updateButton(btnIndex, { url: e.target.value })}
                      />
                      {button.url?.includes('{{1}}') && (
                        <Input
                          placeholder="Example value for {{1}}"
                          value={button.urlVariable || ''}
                          onChange={(e) => updateButton(btnIndex, { urlVariable: e.target.value })}
                        />
                      )}
                    </>
                  )}

                  {button.type === 'PHONE_NUMBER' && (
                    <Input
                      placeholder="15551234567 (no + sign)"
                      value={button.phone_number || ''}
                      onChange={(e) => updateButton(btnIndex, { phone_number: e.target.value })}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {cards.some(c => !c.headerMediaHandle) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            All cards must have media uploaded before creating the template
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleComplete}>
          Create Carousel Template
        </Button>
      </div>
    </div>
  );
}