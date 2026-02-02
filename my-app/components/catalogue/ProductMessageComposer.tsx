'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { Send, Plus, X, Loader2, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ProductGrid } from './ProductGrid';
import type { MetaProduct, ProductSection } from '@/types/ecommerce';
import { COMMERCE_LIMITS, formatCurrency, type SupportedCurrency } from '@/types/ecommerce';

interface ProductMessageComposerProps {
  catalogId: string;
  products: MetaProduct[];
  productsLoading?: boolean;
  productsError?: string | null;
  onSearchProducts?: (query: string) => Promise<void>;
  searchQuery?: string;
  onClearSearch?: () => void;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  onRefreshProducts?: () => Promise<void>;
  onSendSingleProduct: (
    productRetailerId: string,
    bodyText?: string,
    footerText?: string
  ) => Promise<void>;
  onSendMultiProduct: (
    headerText: string,
    bodyText: string,
    sections: ProductSection[],
    footerText?: string
  ) => Promise<void>;
  sending?: boolean;
  error?: string | null;
  className?: string;
}

interface Section {
  id: string;
  title: string;
  products: MetaProduct[];
}

export function ProductMessageComposer({
  catalogId,
  products,
  productsLoading = false,
  productsError = null,
  onSearchProducts,
  searchQuery = '',
  onClearSearch,
  onLoadMore,
  hasMore = false,
  onRefreshProducts,
  onSendSingleProduct,
  onSendMultiProduct,
  sending = false,
  error = null,
  className,
}: ProductMessageComposerProps) {
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

  // Single product state
  const [selectedProduct, setSelectedProduct] = useState<MetaProduct | null>(null);
  const [singleBodyText, setSingleBodyText] = useState('');
  const [singleFooterText, setSingleFooterText] = useState('');

  // Multi-product state
  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: 'Featured Products', products: [] },
  ]);
  const [multiHeaderText, setMultiHeaderText] = useState('');
  const [multiBodyText, setMultiBodyText] = useState('');
  const [multiFooterText, setMultiFooterText] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Calculate total products in multi-product
  const totalMultiProducts = sections.reduce(
    (sum, section) => sum + section.products.length,
    0
  );

  // Handle single product selection
  const handleSingleProductSelect = useCallback((product: MetaProduct) => {
    setSelectedProduct(product);
    setIsProductPickerOpen(false);
  }, []);

  // Handle multi-product selection for a section
  const handleMultiProductSelect = useCallback(
    (product: MetaProduct, selected: boolean) => {
      if (!editingSectionId) return;

      setSections((prev) =>
        prev.map((section) => {
          if (section.id !== editingSectionId) return section;

          if (selected) {
            // Add product if not already in section
            if (!section.products.some((p) => p.retailer_id === product.retailer_id)) {
              return { ...section, products: [...section.products, product] };
            }
          } else {
            // Remove product
            return {
              ...section,
              products: section.products.filter(
                (p) => p.retailer_id !== product.retailer_id
              ),
            };
          }
          return section;
        })
      );
    },
    [editingSectionId]
  );

  // Get selected products for current section being edited
  const getSelectedProductsForSection = useCallback(() => {
    if (!editingSectionId) return [];
    const section = sections.find((s) => s.id === editingSectionId);
    return section?.products || [];
  }, [editingSectionId, sections]);

  // Add new section
  const addSection = useCallback(() => {
    const newId = String(Date.now());
    setSections((prev) => [
      ...prev,
      { id: newId, title: `Section ${prev.length + 1}`, products: [] },
    ]);
  }, []);

  // Remove section
  const removeSection = useCallback((sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }, []);

  // Update section title
  const updateSectionTitle = useCallback((sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
  }, []);

  // Remove product from section
  const removeProductFromSection = useCallback(
    (sectionId: string, productRetailerId: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                products: s.products.filter(
                  (p) => p.retailer_id !== productRetailerId
                ),
              }
            : s
        )
      );
    },
    []
  );

  // Handle send single product
  const handleSendSingle = async () => {
    if (!selectedProduct) return;

    await onSendSingleProduct(
      selectedProduct.retailer_id,
      singleBodyText || undefined,
      singleFooterText || undefined
    );

    // Reset form after successful send
    setSelectedProduct(null);
    setSingleBodyText('');
    setSingleFooterText('');
  };

  // Handle send multi-product
  const handleSendMulti = async () => {
    if (!multiHeaderText || !multiBodyText || totalMultiProducts === 0) return;

    const formattedSections: ProductSection[] = sections
      .filter((s) => s.products.length > 0)
      .map((s) => ({
        title: s.title,
        product_items: s.products.map((p) => ({
          product_retailer_id: p.retailer_id,
        })),
      }));

    await onSendMultiProduct(
      multiHeaderText,
      multiBodyText,
      formattedSections,
      multiFooterText || undefined
    );

    // Reset form after successful send
    setSections([{ id: '1', title: 'Featured Products', products: [] }]);
    setMultiHeaderText('');
    setMultiBodyText('');
    setMultiFooterText('');
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Send Product Message</CardTitle>
        <CardDescription>
          Send single or multiple products to customers via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'single' | 'multi')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Product</TabsTrigger>
            <TabsTrigger value="multi">Multi-Product</TabsTrigger>
          </TabsList>

          {/* Single Product Tab */}
          <TabsContent value="single" className="space-y-4 mt-4">
            {/* Selected Product Display */}
            {selectedProduct ? (
              <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/50">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="h-full w-full object-cover rounded"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(
                      selectedProduct.price,
                      selectedProduct.currency as SupportedCurrency
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Dialog
                open={isProductPickerOpen && activeTab === 'single'}
                onOpenChange={setIsProductPickerOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Select Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Select a Product</DialogTitle>
                    <DialogDescription>
                      Choose a product to send to the customer
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <ProductGrid
                      products={products}
                      loading={productsLoading}
                      error={productsError}
                      onSearch={onSearchProducts}
                      searchQuery={searchQuery}
                      onClearSearch={onClearSearch}
                      onLoadMore={onLoadMore}
                      hasMore={hasMore}
                      onRefresh={onRefreshProducts}
                      showSendButton
                      onSendProduct={handleSingleProductSelect}
                    />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}

            {/* Body Text */}
            <div className="space-y-2">
              <Label htmlFor="single-body">Message (optional)</Label>
              <Textarea
                id="single-body"
                placeholder="Add a message to send with the product..."
                value={singleBodyText}
                onChange={(e) => setSingleBodyText(e.target.value)}
                maxLength={COMMERCE_LIMITS.MAX_BODY_TEXT_LENGTH}
              />
              <p className="text-xs text-muted-foreground text-right">
                {singleBodyText.length}/{COMMERCE_LIMITS.MAX_BODY_TEXT_LENGTH}
              </p>
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="single-footer">Footer (optional)</Label>
              <Input
                id="single-footer"
                placeholder="Add a footer..."
                value={singleFooterText}
                onChange={(e) => setSingleFooterText(e.target.value)}
                maxLength={COMMERCE_LIMITS.MAX_FOOTER_TEXT_LENGTH}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSendSingle}
              disabled={!selectedProduct || sending}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Product
                </>
              )}
            </Button>
          </TabsContent>

          {/* Multi-Product Tab */}
          <TabsContent value="multi" className="space-y-4 mt-4">
            {/* Header Text */}
            <div className="space-y-2">
              <Label htmlFor="multi-header">Header *</Label>
              <Input
                id="multi-header"
                placeholder="e.g., Our Best Products"
                value={multiHeaderText}
                onChange={(e) => setMultiHeaderText(e.target.value)}
                maxLength={COMMERCE_LIMITS.MAX_HEADER_TEXT_LENGTH}
              />
              <p className="text-xs text-muted-foreground text-right">
                {multiHeaderText.length}/{COMMERCE_LIMITS.MAX_HEADER_TEXT_LENGTH}
              </p>
            </div>

            {/* Body Text */}
            <div className="space-y-2">
              <Label htmlFor="multi-body">Message *</Label>
              <Textarea
                id="multi-body"
                placeholder="Browse our selection of products..."
                value={multiBodyText}
                onChange={(e) => setMultiBodyText(e.target.value)}
                maxLength={COMMERCE_LIMITS.MAX_BODY_TEXT_LENGTH}
              />
              <p className="text-xs text-muted-foreground text-right">
                {multiBodyText.length}/{COMMERCE_LIMITS.MAX_BODY_TEXT_LENGTH}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Product Sections</Label>
                <Badge variant="secondary">
                  {totalMultiProducts}/{COMMERCE_LIMITS.MAX_PRODUCTS_PER_MESSAGE} products
                </Badge>
              </div>

              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="border rounded-md p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Section title"
                      value={section.title}
                      onChange={(e) =>
                        updateSectionTitle(section.id, e.target.value)
                      }
                      maxLength={COMMERCE_LIMITS.MAX_SECTION_TITLE_LENGTH}
                      className="flex-1"
                    />
                    {sections.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSection(section.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Products in section */}
                  {section.products.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {section.products.map((product) => (
                        <Badge
                          key={product.retailer_id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {product.name}
                          <button
                            onClick={() =>
                              removeProductFromSection(
                                section.id,
                                product.retailer_id
                              )
                            }
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Add products button */}
                  <Dialog
                    open={isProductPickerOpen && editingSectionId === section.id}
                    onOpenChange={(open) => {
                      setIsProductPickerOpen(open);
                      if (!open) setEditingSectionId(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSectionId(section.id)}
                        disabled={
                          totalMultiProducts >= COMMERCE_LIMITS.MAX_PRODUCTS_PER_MESSAGE
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Products
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Select Products for {section.title}</DialogTitle>
                        <DialogDescription>
                          Select products to add to this section (max{' '}
                          {COMMERCE_LIMITS.MAX_PRODUCTS_PER_MESSAGE} total)
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] pr-4">
                        <ProductGrid
                          products={products}
                          loading={productsLoading}
                          error={productsError}
                          onSearch={onSearchProducts}
                          searchQuery={searchQuery}
                          onClearSearch={onClearSearch}
                          onLoadMore={onLoadMore}
                          hasMore={hasMore}
                          onRefresh={onRefreshProducts}
                          selectable
                          selectedProducts={getSelectedProductsForSection()}
                          onProductSelect={handleMultiProductSelect}
                          maxSelections={
                            COMMERCE_LIMITS.MAX_PRODUCTS_PER_MESSAGE - totalMultiProducts + section.products.length
                          }
                        />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}

              {sections.length < COMMERCE_LIMITS.MAX_SECTIONS_PER_MESSAGE && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSection}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              )}
            </div>

            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="multi-footer">Footer (optional)</Label>
              <Input
                id="multi-footer"
                placeholder="Add a footer..."
                value={multiFooterText}
                onChange={(e) => setMultiFooterText(e.target.value)}
                maxLength={COMMERCE_LIMITS.MAX_FOOTER_TEXT_LENGTH}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSendMulti}
              disabled={
                !multiHeaderText ||
                !multiBodyText ||
                totalMultiProducts === 0 ||
                sending
              }
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send {totalMultiProducts} Product{totalMultiProducts !== 1 && 's'}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ProductMessageComposer;
