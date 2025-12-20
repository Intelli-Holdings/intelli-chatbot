"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, X, Upload, ChevronLeft, ChevronRight,
  Info, Loader2, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface CardButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

interface CarouselCard {
  id: string;
  mediaFile: File | null;
  mediaHandle: string;
  mediaPreview: string;
  mediaType: 'IMAGE' | 'VIDEO';
  bodyText?: string;
  buttons: CardButton[];  // Each card must have at least one button
}

interface SimpleCarouselCreatorProps {
  onComplete: (carouselData: any) => void;
  onBack: () => void;
  appService: any;
  templateName: string;
  language: string;
}

export default function SimpleCarouselCreator({
  onComplete,
  onBack,
  appService,
  templateName,
  language
}: SimpleCarouselCreatorProps) {
  const [messageBody, setMessageBody] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState<CarouselCard[]>([
    {
      id: '1',
      mediaFile: null,
      mediaHandle: '',
      mediaPreview: '',
      mediaType: 'IMAGE',
      bodyText: '',
      buttons: [{ type: 'QUICK_REPLY', text: 'View Details' }]
    },
    {
      id: '2',
      mediaFile: null,
      mediaHandle: '',
      mediaPreview: '',
      mediaType: 'IMAGE',
      bodyText: '',
      buttons: [{ type: 'QUICK_REPLY', text: 'View Details' }]
    }
  ]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCard = cards[currentCardIndex];

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    const maxSize = isImage ? 5 * 1024 * 1024 : 16 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max size: ${isImage ? '5MB' : '16MB'}`);
      return;
    }

    const preview = URL.createObjectURL(file);
    const newCards = [...cards];
    newCards[currentCardIndex] = {
      ...currentCard,
      mediaFile: file,
      mediaPreview: preview,
      mediaType: isImage ? 'IMAGE' : 'VIDEO'
    };
    setCards(newCards);

    uploadMedia(file, currentCardIndex);
  };

  const uploadMedia = async (file: File, cardIndex: number) => {
    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('media_file', file);
      formData.append('appservice_phone_number', appService.phone_number);
      formData.append('upload_type', 'resumable');

      const response = await fetch('/api/whatsapp/templates/upload_media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      const newCards = [...cards];
      newCards[cardIndex] = {
        ...newCards[cardIndex],
        mediaHandle: data.handle
      };
      setCards(newCards);

      toast.success('Media uploaded!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const addCard = () => {
    if (cards.length >= 10) {
      toast.error('Maximum 10 cards');
      return;
    }
    setCards([...cards, {
      id: Date.now().toString(),
      mediaFile: null,
      mediaHandle: '',
      mediaPreview: '',
      mediaType: 'IMAGE',
      bodyText: '',
      buttons: [{ type: 'QUICK_REPLY', text: 'View Details' }]
    }]);
    setCurrentCardIndex(cards.length);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 2) {
      toast.error('Minimum 2 cards required');
      return;
    }
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    if (currentCardIndex >= newCards.length) {
      setCurrentCardIndex(newCards.length - 1);
    }
  };

  const addButton = () => {
    if (currentCard.buttons.length >= 2) {
      toast.error('Maximum 2 buttons per card');
      return;
    }

    const newCards = [...cards];
    newCards[currentCardIndex] = {
      ...currentCard,
      buttons: [...currentCard.buttons, { type: 'QUICK_REPLY', text: '' }]
    };
    setCards(newCards);
  };

  const removeButton = (buttonIndex: number) => {
    if (currentCard.buttons.length <= 1) {
      toast.error('At least one button is required per card');
      return;
    }

    const newCards = [...cards];
    newCards[currentCardIndex] = {
      ...currentCard,
      buttons: currentCard.buttons.filter((_, i) => i !== buttonIndex)
    };
    setCards(newCards);
  };

  const updateButton = (buttonIndex: number, field: string, value: any) => {
    const newCards = [...cards];
    const updatedButtons = [...currentCard.buttons];
    updatedButtons[buttonIndex] = {
      ...updatedButtons[buttonIndex],
      [field]: value
    };
    newCards[currentCardIndex] = {
      ...currentCard,
      buttons: updatedButtons
    };
    setCards(newCards);
  };

  const handleComplete = async () => {
    // Simple validation
    if (!messageBody.trim()) {
      toast.error('Message body is required');
      return;
    }

    if (messageBody.trim().length < 10) {
      toast.error('Message body must be at least 10 characters');
      return;
    }

    if (cards.length < 2) {
      toast.error('Minimum 2 cards required');
      return;
    }

    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].mediaHandle) {
        toast.error(`Card ${i + 1}: Please upload media`);
        setCurrentCardIndex(i);
        return;
      }

      if (!cards[i].buttons || cards[i].buttons.length === 0) {
        toast.error(`Card ${i + 1}: At least one button is required`);
        setCurrentCardIndex(i);
        return;
      }

      // Validate button text
      for (let j = 0; j < cards[i].buttons.length; j++) {
        if (!cards[i].buttons[j].text || !cards[i].buttons[j].text.trim()) {
          toast.error(`Card ${i + 1}, Button ${j + 1}: Button text is required`);
          setCurrentCardIndex(i);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // Build template exactly like Meta's documentation
      const components: any[] = [];

      // 1. Body component (message above carousel)
      components.push({
        type: 'BODY',
        text: messageBody.trim()
      });

      // 2. Carousel component
      const carouselCards = cards.map(card => {
        const cardComponents: any[] = [
          {
            type: 'HEADER',
            format: card.mediaType.toLowerCase(),
            example: {
              header_handle: [card.mediaHandle]
            }
          }
        ];

        // Add optional card body text
        if (card.bodyText && card.bodyText.trim()) {
          cardComponents.push({
            type: 'BODY',
            text: card.bodyText.trim()
          });
        }

        // Add buttons (required by Meta API - at least one button per card)
        if (card.buttons && card.buttons.length > 0) {
          const formattedButtons = card.buttons.map(btn => {
            const button: any = {
              type: btn.type,
              text: btn.text
            };

            if (btn.type === 'URL' && btn.url) {
              button.url = btn.url;
            } else if (btn.type === 'PHONE_NUMBER' && btn.phone_number) {
              button.phone_number = btn.phone_number;
            }

            return button;
          });

          cardComponents.push({
            type: 'BUTTONS',
            buttons: formattedButtons
          });
        }

        return { components: cardComponents };
      });

      components.push({
        type: 'CAROUSEL',
        cards: carouselCards
      });

      const templateData = {
        name: templateName.toLowerCase().replace(/\s+/g, '_'),
        language: language,
        category: 'MARKETING',
        components
      };

      await onComplete(templateData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create carousel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div>
        <h2 className="text-2xl font-bold mb-2">Media Carousel Template</h2>
        <p className="text-muted-foreground">
          Simple carousel with 2-10 image/video cards
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Create a carousel template with 2-10 media cards. Each card has an image/video header and optional body text.
        </AlertDescription>
      </Alert>

      {/* Message Body */}
      <Card>
        <CardHeader>
          <CardTitle>Message Body (Required)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Enter the message that appears above your carousel..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {messageBody.length}/1024 characters
          </p>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cards ({cards.length}/10)</CardTitle>
            <Button onClick={addCard} size="sm" disabled={cards.length >= 10}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
              disabled={currentCardIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Badge>Card {currentCardIndex + 1} of {cards.length}</Badge>
              {currentCard.mediaHandle && (
                <Badge variant="outline" className="text-green-600">
                  ✓ Uploaded
                </Badge>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentCardIndex(Math.min(cards.length - 1, currentCardIndex + 1))}
              disabled={currentCardIndex === cards.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Card {currentCardIndex + 1}</h4>
                {cards.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCard(currentCardIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label>Media (Image or Video)</Label>
                <div className="mt-2">
                  {currentCard.mediaPreview ? (
                    <div className="relative">
                      {currentCard.mediaType === 'IMAGE' ? (
                        <img
                          src={currentCard.mediaPreview}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={currentCard.mediaPreview}
                          className="w-full h-64 object-cover rounded-lg"
                          controls
                        />
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingMedia}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload image or video
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG (max 5MB) or MP4 (max 16MB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,video/mp4"
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {isUploadingMedia && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Uploading media to Meta...
                  </AlertDescription>
                </Alert>
              )}

              {/* Optional Card Body Text */}
              <div>
                <Label>Card Body Text (Optional)</Label>
                <Textarea
                  value={currentCard.bodyText || ''}
                  onChange={(e) => {
                    const newCards = [...cards];
                    newCards[currentCardIndex] = {
                      ...currentCard,
                      bodyText: e.target.value
                    };
                    setCards(newCards);
                  }}
                  placeholder="Add text that appears below the image/video on this card (optional)"
                  rows={3}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This text appears on the individual card. Leave empty if you only want the media.
                </p>
              </div>

              {/* Buttons (Required) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Buttons (Required - at least 1, max 2)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addButton}
                    disabled={currentCard.buttons.length >= 2}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Button
                  </Button>
                </div>

                <div className="space-y-3">
                  {currentCard.buttons.map((button, btnIndex) => (
                    <Card key={btnIndex} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Button {btnIndex + 1}</Label>
                          {currentCard.buttons.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeButton(btnIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs">Type</Label>
                         <Select 
  value={button.type} 
  onValueChange={(value) => updateButton(btnIndex, 'type', value)}
>
  <SelectTrigger className="w-full mt-1">
    <SelectValue placeholder="Select button type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
    <SelectItem value="URL">URL</SelectItem>
    <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
  </SelectContent>
</Select>
                        </div>

                        <div>
                          <Label className="text-xs">Button Text (max 25 chars)</Label>
                          <Input
                            value={button.text}
                            onChange={(e) => updateButton(btnIndex, 'text', e.target.value.substring(0, 25))}
                            placeholder="e.g., View Details"
                            maxLength={25}
                            className="mt-1"
                          />
                        </div>

                        {button.type === 'URL' && (
                          <div>
                            <Label className="text-xs">URL</Label>
                            <Input
                              value={button.url || ''}
                              onChange={(e) => updateButton(btnIndex, 'url', e.target.value)}
                              placeholder="https://example.com"
                              className="mt-1"
                            />
                          </div>
                        )}

                        {button.type === 'PHONE_NUMBER' && (
                          <div>
                            <Label className="text-xs">Phone Number</Label>
                            <Input
                              value={button.phone_number || ''}
                              onChange={(e) => updateButton(btnIndex, 'phone_number', e.target.value)}
                              placeholder="1234567890"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Cards Overview */}
          <div className="grid grid-cols-5 gap-2">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`relative border-2 rounded-lg overflow-hidden cursor-pointer ${
                  index === currentCardIndex ? 'border-primary' : 'border-gray-200'
                }`}
                onClick={() => setCurrentCardIndex(index)}
              >
                {card.mediaPreview ? (
                  <img
                    src={card.mediaPreview}
                    alt={`Card ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-100 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                  {index + 1}
                </div>
                {card.mediaHandle && (
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                    <div className="w-2 h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleComplete} disabled={isSubmitting || isUploadingMedia}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Template'
          )}
        </Button>
      </div>
    </div>
  );
}
