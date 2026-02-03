"use client"

import Image from "next/image"
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, X, Upload, ChevronLeft, ChevronRight, 
  Info, Image as ImageIcon, Video, Trash2, AlertCircle, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

interface CarouselCard {
  id: string;
  headerMediaFile: File | null;
  headerMediaHandle: string;
  headerMediaPreview: string;
  headerMediaType: 'IMAGE' | 'VIDEO';
  bodyText: string;
  bodyVariables: { [key: string]: string };
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
  const [messageBodyVariables, setMessageBodyVariables] = useState<{ [key: string]: string }>({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState<CarouselCard[]>([
    {
      id: '1',
      headerMediaFile: null,
      headerMediaHandle: '',
      headerMediaPreview: '',
      headerMediaType: 'IMAGE',
      bodyText: '',
      bodyVariables: {},
      buttons: []
    },
    {
      id: '2',
      headerMediaFile: null,
      headerMediaHandle: '',
      headerMediaPreview: '',
      headerMediaType: 'IMAGE',
      bodyText: '',
      bodyVariables: {},
      buttons: []
    }
  ]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCard = cards[currentCardIndex];

  // Extract variables from text (e.g., {{1}}, {{2}})
  const extractVariables = (text: string): string[] => {
    if (!text) return [];
    const matches = text.match(/\{\{(\d+)\}\}/g) || [];
    const unique = Array.from(new Set(matches));
    return unique.sort((a, b) => {
      const aNum = parseInt(a.replace(/[{}]/g, ''));
      const bNum = parseInt(b.replace(/[{}]/g, ''));
      return aNum - bNum;
    });
  };

  // Handle message body change and extract variables
  const handleMessageBodyChange = (value: string) => {
    setMessageBody(value);
    
    const variables = extractVariables(value);
    const newVariables: { [key: string]: string } = {};
    
    variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '');
      newVariables[key] = messageBodyVariables[key] || '';
    });
    
    setMessageBodyVariables(newVariables);
  };

  // Handle card body change and extract variables
  const handleCardBodyChange = (value: string) => {
    const variables = extractVariables(value);
    const newVariables: { [key: string]: string } = {};
    
    variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '');
      newVariables[key] = currentCard.bodyVariables[key] || '';
    });
    
    updateCard(currentCardIndex, { 
      bodyText: value,
      bodyVariables: newVariables
    });
  };

  const uploadMediaToMeta = async (file: File): Promise<string> => {
    if (!appService) {
      throw new Error('App service not provided');
    }

    try {
      setIsUploadingMedia(true);
      const formData = new FormData();
      formData.append('media_file', file);
      formData.append('appservice_phone_number', appService.phone_number);
      formData.append('upload_type', 'resumable');

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
      toast.info('Uploading media to Meta...');
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
      bodyVariables: {},
      buttons: []
    }]);
    setCurrentCardIndex(cards.length);
    toast.success('Card added');
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
    toast.success('Card removed');
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
    // CRITICAL: Check message body (appears above carousel) - REQUIRED by Meta API
    if (!messageBody || !messageBody.trim()) {
      toast.error('❌ Message body is required! This text appears above the carousel.');
      return false;
    }

    // Message body must have meaningful content (at least 10 characters)
    if (messageBody.trim().length < 10) {
      toast.error('Message body must be at least 10 characters long');
      return false;
    }

    // Message body should not be just spaces or special characters
    if (!/[a-zA-Z0-9]/.test(messageBody)) {
      toast.error('Message body must contain alphanumeric characters');
      return false;
    }

    // Check message body variables have example values
    const msgBodyVars = extractVariables(messageBody);
    for (const variable of msgBodyVars) {
      const key = variable.replace(/[{}]/g, '');
      if (!messageBodyVariables[key] || !messageBodyVariables[key].trim()) {
        toast.error(`Please provide example value for message body variable ${variable}`);
        return false;
      }
    }

    // Validate minimum number of cards
    if (cards.length < 2) {
      toast.error('Minimum 2 cards required for carousel template');
      return false;
    }

    // Check all cards have media
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].headerMediaHandle) {
        toast.error(`Card ${i + 1}: Media upload required`);
        setCurrentCardIndex(i);
        return false;
      }
      
      // Validate media handle format
      if (!cards[i].headerMediaHandle.includes(':')) {
        toast.error(`Card ${i + 1}: Invalid media handle format`);
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
        toast.error(`Card ${i + 1}: All cards must have same number of buttons (${firstButtonCount})`);
        setCurrentCardIndex(i);
        return false;
      }

      // Validate card body variables
      if (hasBody) {
        const cardBodyVars = extractVariables(cards[i].bodyText);
        for (const variable of cardBodyVars) {
          const key = variable.replace(/[{}]/g, '');
          if (!cards[i].bodyVariables[key] || !cards[i].bodyVariables[key].trim()) {
            toast.error(`Card ${i + 1}: Please provide example value for variable ${variable}`);
            setCurrentCardIndex(i);
            return false;
          }
        }
      }
    }

    // Validate buttons thoroughly
    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < cards[i].buttons.length; j++) {
        const button = cards[i].buttons[j];
        
        if (!button.text || !button.text.trim()) {
          toast.error(`Card ${i + 1}, Button ${j + 1}: Button text is required`);
          setCurrentCardIndex(i);
          return false;
        }

        if (button.text.trim().length > 25) {
          toast.error(`Card ${i + 1}, Button ${j + 1}: Button text exceeds 25 characters`);
          setCurrentCardIndex(i);
          return false;
        }

        if (button.type === 'URL') {
          if (!button.url || !button.url.trim()) {
            toast.error(`Card ${i + 1}, Button ${j + 1}: URL is required`);
            setCurrentCardIndex(i);
            return false;
          }
          
          // Validate URL format
          try {
            const urlToValidate = button.url.replace('{{1}}', 'test');
            new URL(urlToValidate);
          } catch {
            toast.error(`Card ${i + 1}, Button ${j + 1}: Invalid URL format`);
            setCurrentCardIndex(i);
            return false;
          }
          
          // Check if URL is complete (not truncated)
          if (button.url.length > 2000) {
            toast.error(`Card ${i + 1}, Button ${j + 1}: URL exceeds 2000 characters`);
            setCurrentCardIndex(i);
            return false;
          }
          
          if (button.url.includes('{{1}}')) {
            if (!button.urlVariable || !button.urlVariable.trim()) {
              toast.error(`Card ${i + 1}, Button ${j + 1}: URL variable example is required`);
              setCurrentCardIndex(i);
              return false;
            }
          }
        }

        if (button.type === 'PHONE_NUMBER') {
          if (!button.phone_number || !button.phone_number.trim()) {
            toast.error(`Card ${i + 1}, Button ${j + 1}: Phone number is required`);
            setCurrentCardIndex(i);
            return false;
          }
          
          // Validate phone number format (should start with +)
          if (!button.phone_number.startsWith('+')) {
            toast.error(`Card ${i + 1}, Button ${j + 1}: Phone number must start with +`);
            setCurrentCardIndex(i);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateCarousel()) return;

    setIsSubmitting(true);

    try {
      // Build components array according to Meta's API format
      const components: any[] = [];

      // CRITICAL: Body component MUST be first and is REQUIRED by Meta API
      // This is the main message that appears ABOVE the carousel
      const bodyComponent: any = {
        type: 'BODY',
        text: messageBody.trim()
      };

      // Add message body variable examples (if any)
      const msgBodyVars = extractVariables(messageBody);
      if (msgBodyVars.length > 0) {
        const exampleValues = msgBodyVars.map(variable => {
          const key = variable.replace(/[{}]/g, '');
          return messageBodyVariables[key].trim(); // Ensure trimmed
        });

        // CRITICAL: Meta requires ARRAY OF ARRAYS format for body_text examples
        // Even for single variable, wrap in nested array
        bodyComponent.example = {
          body_text: [exampleValues]
        };
      }

      // Add body component first (REQUIRED)
      components.push(bodyComponent);

      // Carousel component
      const carouselComponent: any = {
        type: 'CAROUSEL',
        cards: cards.map(card => {
          const cardComponents: any[] = [];

          // Header component (image/video)
          cardComponents.push({
            type: 'HEADER',
            format: card.headerMediaType.toLowerCase(),
            example: {
              header_handle: [card.headerMediaHandle]
            }
          });

          // Body component (optional for cards)
          if (card.bodyText && card.bodyText.trim()) {
            const cardBodyComponent: any = {
              type: 'BODY',
              text: card.bodyText.trim()
            };

            const cardBodyVars = extractVariables(card.bodyText);
            if (cardBodyVars.length > 0) {
              const exampleValues = cardBodyVars.map(variable => {
                const key = variable.replace(/[{}]/g, '');
                return card.bodyVariables[key].trim();
              });

              // CRITICAL: Always use nested array format [exampleValues] for card body too
              cardBodyComponent.example = {
                body_text: [exampleValues]
              };
            }

            cardComponents.push(cardBodyComponent);
          }

          // Buttons component
          if (card.buttons.length > 0) {
            const buttonsComponent: any = {
              type: 'BUTTONS',
              buttons: card.buttons.map(button => {
                const btnData: any = {
                  type: button.type.toLowerCase(),
                  text: button.text.trim()
                };

                if (button.type === 'URL') {
                  btnData.url = button.url?.trim();
                  if (button.url?.includes('{{1}}') && button.urlVariable) {
                    btnData.example = [button.urlVariable.trim()];
                  }
                } else if (button.type === 'PHONE_NUMBER') {
                  btnData.phone_number = button.phone_number?.trim();
                }

                return btnData;
              })
            };

            cardComponents.push(buttonsComponent);
          }

          return {
            components: cardComponents
          };
        })
      };

      components.push(carouselComponent);

      const carouselData = {
        name: templateName.toLowerCase().replace(/\s+/g, '_'),
        language: language,
        category: 'MARKETING',
        components
      };

      await onComplete(carouselData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create carousel template');
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageBodyVars = extractVariables(messageBody);
  const currentCardBodyVars = extractVariables(currentCard.bodyText);
  
  // Check if message body is filled (for UI feedback)
  const isMessageBodyValid = messageBody.trim().length >= 10;
  const canProceedToCards = isMessageBodyValid;

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
          <strong>Important:</strong> Carousel templates require a message body that appears ABOVE the carousel. This is different from the individual card body text. Min 2-10 cards, all cards must have same structure.
        </AlertDescription>
      </Alert>

      {/* Message Body - CRITICAL SECTION */}
      <Card className='border-1 border-gray-100'>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              📝 Message Body (Required - Appears Above Carousel)
              <span className="text-red-500">*</span>
            </span>
            {isMessageBodyValid && (
              <Badge variant="outline" className="text-green-600 bg-green-100">
                ✓ Valid
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={!isMessageBodyValid ? "warning" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {!isMessageBodyValid 
                ? '⚠️ This field is required. Enter at least 10 characters.'
                : '✅ Message body is valid. This text will appear above your carousel cards.'}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Textarea
              id="message-body"
              placeholder="Rare succulents for sale! {{1}}, add these unique plants to your collection. Use code {{2}} for discount!"
              value={messageBody}
              onChange={(e) => handleMessageBodyChange(e.target.value)}
              rows={4}
              maxLength={1024}
              required
              className={!isMessageBodyValid ? 'border-yellow-300 focus:border-yellow-500' : 'border-green-300'}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Use {`{{1}}`}, {`{{2}}`}, etc. for variables
              </p>
              <p className={`text-xs font-medium ${messageBody.length < 10 ? 'text-red-500' : messageBody.length > 900 ? 'text-orange-500' : 'text-green-600'}`}>
                {messageBody.length}/1024 characters {messageBody.length < 10 && '(min 10 required)'}
              </p>
            </div>
          </div>

          {/* Message Body Variable Examples */}
          {messageBodyVars.length > 0 && (
            <div className="space-y-3 pt-3 border-t">
              <Label className="text-sm font-medium">Variable Examples (Required)</Label>
              <div className="grid gap-3">
                {messageBodyVars.map((variable) => {
                  const key = variable.replace(/[{}]/g, '');
                  const hasValue = messageBodyVariables[key]?.trim();
                  return (
                    <div key={variable} className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        Variable {key}
                        <Badge variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                        {!hasValue && <span className="text-red-500 text-xs">* Required</span>}
                      </Label>
                      <Input
                        placeholder={`Example value for ${variable}`}
                        value={messageBodyVariables[key] || ''}
                        onChange={(e) => setMessageBodyVariables(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))}
                        required
                        className={!hasValue ? 'border-red-300' : ''}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Navigation - disabled if message body not valid */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label>Card {currentCardIndex + 1} of {cards.length}</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
            disabled={currentCardIndex === 0 || !canProceedToCards}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentCardIndex(Math.min(cards.length - 1, currentCardIndex + 1))}
            disabled={currentCardIndex === cards.length - 1 || !canProceedToCards}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          {cards.length < 10 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addCard}
              disabled={!canProceedToCards}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          )}
          {cards.length > 2 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => removeCard(currentCardIndex)}
              disabled={!canProceedToCards}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* Current Card Editor */}
      <Card className={!canProceedToCards ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Card {currentCardIndex + 1} Content</span>
            {currentCard.headerMediaHandle && (
              <Badge variant="outline" className="text-xs text-green-600">
                ✓ Media Uploaded
              </Badge>
            )}
          </CardTitle>
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
              disabled={currentCardIndex > 0}
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
            {currentCardIndex > 0 && (
              <p className="text-xs text-muted-foreground">
                All cards must use same media type as Card 1
              </p>
            )}
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
                    width={600}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg"
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
                    {isUploadingMedia && (
                      <Loader2 className="h-3 w-3 animate-spin" />
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
                    disabled={isUploadingMedia}
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
                {isUploadingMedia ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {currentCard.headerMediaType}
                  </>
                )}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {currentCard.headerMediaType === 'IMAGE' ? 'JPG, PNG • Max 5MB' : 'MP4 • Max 16MB'}
            </p>
          </div>

          {/* Body Text */}
          <div className="space-y-2">
            <Label htmlFor={`body-${currentCardIndex}`}>
              Card Body Text (Optional)
            </Label>
            <Textarea
              id={`body-${currentCardIndex}`}
              placeholder="Add a touch of elegance with {{1}} succulent"
              value={currentCard.bodyText}
              onChange={(e) => handleCardBodyChange(e.target.value)}
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {currentCard.bodyText.length}/160 characters • If one card has body text, all must have it
            </p>
          </div>

          {/* Card Body Variable Examples */}
          {currentCardBodyVars.length > 0 && (
            <div className="space-y-3 pt-3 border-t">
              <Label className="text-sm font-medium">Card Body Variable Examples</Label>
              <div className="grid gap-3">
                {currentCardBodyVars.map((variable) => {
                  const key = variable.replace(/[{}]/g, '');
                  return (
                    <div key={variable} className="space-y-2">
                      <Label className="text-sm">
                        Variable {key}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {variable}
                        </Badge>
                      </Label>
                      <Input
                        placeholder={`Example value for ${variable}`}
                        value={currentCard.bodyVariables[key] || ''}
                        onChange={(e) => {
                          const newVariables = { ...currentCard.bodyVariables };
                          newVariables[key] = e.target.value;
                          updateCard(currentCardIndex, { bodyVariables: newVariables });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3 pt-3 border-t">
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
                        <div className="space-y-2">
                          <Label className="text-xs">URL Variable Example</Label>
                          <Input
                            placeholder="Example: blue-elf"
                            value={button.urlVariable || ''}
                            onChange={(e) => updateButton(btnIndex, { urlVariable: e.target.value })}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {button.type === 'PHONE_NUMBER' && (
                    <Input
                      placeholder="+15551234567"
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
      {!isMessageBodyValid && (
        <Alert variant="info">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Message body must be completed first!</strong> Meta API requires a message body (min 10 characters) before creating carousel templates.
          </AlertDescription>
        </Alert>
      )}

      {cards.some(c => !c.headerMediaHandle) && (
        <Alert variant="info">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            All cards must have media uploaded before creating the template
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleComplete} 
          disabled={isSubmitting || isUploadingMedia || !isMessageBodyValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Template...
            </>
          ) : (
            'Create Carousel Template'
          )}
        </Button>
      </div>
    </div>
  );
}