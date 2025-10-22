"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, X, ChevronLeft, Info, ShoppingCart, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductCard {
  id: string;
  productRetailerId: string;
  buttonType: 'spm' | 'url';
  urlButtonText?: string;
  url?: string;
  urlVariable?: string;
}

interface ProductCarouselCreatorProps {
  onComplete: (carouselData: any) => void;
  onBack: () => void;
  catalogId: string;
  templateName: string;
  language: string;
}

export default function ProductCarouselCreator({
  onComplete,
  onBack,
  catalogId,
  templateName,
  language
}: ProductCarouselCreatorProps) {
  const [messageBody, setMessageBody] = useState('');
  const [messageBodyVariables, setMessageBodyVariables] = useState<{ [key: string]: string }>({});
  const [cards, setCards] = useState<ProductCard[]>([
    { id: '1', productRetailerId: '', buttonType: 'spm' },
    { id: '2', productRetailerId: '', buttonType: 'spm' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleMessageBodyChange = (value: string) => {
    setMessageBody(value);
    const variables = extractVariables(value);
    const newVariables: { [key: string]: string } = {};
    variables.forEach(v => {
      const key = v.replace(/[{}]/g, '');
      newVariables[key] = messageBodyVariables[key] || '';
    });
    setMessageBodyVariables(newVariables);
  };

  const addCard = () => {
    if (cards.length >= 10) {
      toast.error('Maximum 10 cards allowed');
      return;
    }
    setCards([...cards, {
      id: Date.now().toString(),
      productRetailerId: '',
      buttonType: 'spm'
    }]);
  };

  const removeCard = (id: string) => {
    if (cards.length <= 2) {
      toast.error('Minimum 2 cards required');
      return;
    }
    setCards(cards.filter(c => c.id !== id));
  };

  const updateCard = (id: string, field: keyof ProductCard, value: any) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const validateCarousel = (): boolean => {
    if (!messageBody || !messageBody.trim()) {
      toast.error('Message body is required');
      return false;
    }

    if (messageBody.trim().length < 10) {
      toast.error('Message body must be at least 10 characters');
      return false;
    }

    const msgBodyVars = extractVariables(messageBody);
    for (const variable of msgBodyVars) {
      const key = variable.replace(/[{}]/g, '');
      if (!messageBodyVariables[key] || !messageBodyVariables[key].trim()) {
        toast.error(`Please provide example value for variable ${variable}`);
        return false;
      }
    }

    if (cards.length < 2) {
      toast.error('Minimum 2 cards required');
      return false;
    }

    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].productRetailerId.trim()) {
        toast.error(`Card ${i + 1}: Product ID is required`);
        return false;
      }

      if (cards[i].buttonType === 'url') {
        if (!cards[i].urlButtonText?.trim()) {
          toast.error(`Card ${i + 1}: URL button text is required`);
          return false;
        }

        if (!cards[i].url?.trim()) {
          toast.error(`Card ${i + 1}: URL is required`);
          return false;
        }

        if (cards[i].url?.includes('{{1}}') && !cards[i].urlVariable?.trim()) {
          toast.error(`Card ${i + 1}: URL variable example is required`);
          return false;
        }
      }
    }

    const firstButtonType = cards[0].buttonType;
    for (let i = 1; i < cards.length; i++) {
      if (cards[i].buttonType !== firstButtonType) {
        toast.error('All cards must have the same button type');
        return false;
      }
    }

    return true;
  };

  const handleComplete = async () => {
    if (!validateCarousel()) return;

    setIsSubmitting(true);

    try {
      const components: any[] = [];

      // Body component
      const bodyComponent: any = {
        type: 'BODY',
        text: messageBody.trim()
      };

      const msgBodyVars = extractVariables(messageBody);
      if (msgBodyVars.length > 0) {
        const exampleValues = msgBodyVars.map(variable => {
          const key = variable.replace(/[{}]/g, '');
          return messageBodyVariables[key].trim();
        });

        bodyComponent.example = {
          body_text: msgBodyVars.length === 1 ? exampleValues[0] : [exampleValues]
        };
      }

      components.push(bodyComponent);

      // Carousel component - Only need to define 2 cards for product carousel
      const carouselComponent: any = {
        type: 'CAROUSEL',
        cards: cards.slice(0, 2).map(card => {
          const cardComponents: any[] = [];

          // Header component
          cardComponents.push({
            type: 'HEADER',
            format: 'product'
          });

          // Buttons component
          const buttonsComponent: any = {
            type: 'BUTTONS',
            buttons: []
          };

          if (card.buttonType === 'spm') {
            buttonsComponent.buttons.push({
              type: 'spm',
              text: 'View'
            });
          } else {
            const urlButton: any = {
              type: 'url',
              text: card.urlButtonText?.trim(),
              url: card.url?.trim()
            };

            if (card.url?.includes('{{1}}') && card.urlVariable) {
              urlButton.example = [card.urlVariable.trim()];
            }

            buttonsComponent.buttons.push(urlButton);
          }

          cardComponents.push(buttonsComponent);

          return { components: cardComponents };
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
      toast.error(error instanceof Error ? error.message : 'Failed to create product carousel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const msgBodyVars = extractVariables(messageBody);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Product Carousel Template</h2>
          <p className="text-muted-foreground">
            Create a template with up to 10 product cards from your catalog
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Product carousel templates require an ecommerce product catalog connected to your WhatsApp Business Account.
            Define 2 cards here; you can send up to 10 cards when using the approved template.
          </AlertDescription>
        </Alert>

        {/* Message Body */}
        <Card>
          <CardHeader>
            <CardTitle>Message Body (Required)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Message Text</Label>
              <Textarea
                value={messageBody}
                onChange={(e) => handleMessageBodyChange(e.target.value)}
                placeholder="Enter message body... Use {{1}}, {{2}} for variables"
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This text appears above the carousel
              </p>
            </div>

            {msgBodyVars.length > 0 && (
              <div className="space-y-3">
                <Label>Variable Examples</Label>
                {msgBodyVars.map((variable) => {
                  const key = variable.replace(/[{}]/g, '');
                  return (
                    <div key={variable}>
                      <Label className="text-xs">{variable}</Label>
                      <Input
                        value={messageBodyVariables[key] || ''}
                        onChange={(e) => setMessageBodyVariables({
                          ...messageBodyVariables,
                          [key]: e.target.value
                        })}
                        placeholder={`Example value for ${variable}`}
                        className="mt-1"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Cards ({cards.length}/10)</CardTitle>
              <Button
                onClick={addCard}
                size="sm"
                disabled={cards.length >= 10}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cards.map((card, index) => (
              <Card key={card.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Card {index + 1}
                    </h4>
                    {cards.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCard(card.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Product Retailer ID</Label>
                    <Input
                      value={card.productRetailerId}
                      onChange={(e) => updateCard(card.id, 'productRetailerId', e.target.value)}
                      placeholder="e.g., vrpj01fvwp"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Button Type</Label>
                    <Select
                      value={card.buttonType}
                      onValueChange={(value) => updateCard(card.id, 'buttonType', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spm">View (In-app)</SelectItem>
                        <SelectItem value="url">URL Button</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {card.buttonType === 'url' && (
                    <>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={card.urlButtonText || ''}
                          onChange={(e) => updateCard(card.id, 'urlButtonText', e.target.value)}
                          placeholder="e.g., Buy now"
                          maxLength={25}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>URL</Label>
                        <Input
                          value={card.url || ''}
                          onChange={(e) => updateCard(card.id, 'url', e.target.value)}
                          placeholder="https://example.com/product/{{1}}"
                          className="mt-1"
                        />
                      </div>

                      {card.url?.includes('{{1}}') && (
                        <div>
                          <Label>URL Variable Example</Label>
                          <Input
                            value={card.urlVariable || ''}
                            onChange={(e) => updateCard(card.id, 'urlVariable', e.target.value)}
                            placeholder="e.g., blue-elf"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isSubmitting}>
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
    </div>
  );
}
