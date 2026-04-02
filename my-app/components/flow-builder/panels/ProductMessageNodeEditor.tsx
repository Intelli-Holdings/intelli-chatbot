'use client';

import { useState, useEffect } from 'react';
import { Check, Package, ShoppingBag, Plus, Trash2, Loader2 } from 'lucide-react';
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
import { ProductMessageNodeData, ProductMessageType } from '../nodes/ProductMessageNode';
import { useCatalogues, useProducts } from '@/hooks/use-catalogue';
import { useAppServices } from '@/hooks/use-app-services';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProductMessageNodeEditorProps {
  data: ProductMessageNodeData;
  onUpdate: (data: Partial<ProductMessageNodeData>) => void;
}

export default function ProductMessageNodeEditor({ data, onUpdate }: ProductMessageNodeEditorProps) {
  const { selectedAppService } = useAppServices();
  const { catalogues, loading: loadingCatalogues } = useCatalogues(selectedAppService);

  // Track the live catalogue selection (not just saved data)
  const [activeCatalogId, setActiveCatalogId] = useState(data.catalogId || '');

  const {
    products: metaProducts,
    loading: loadingProducts,
    search,
  } = useProducts(selectedAppService, activeCatalogId || null);

  // Map Meta products to common format
  const products = (metaProducts || []).map((p) => ({
    id: p.id,
    retailer_id: p.retailer_id,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    availability: p.availability,
    image_url: p.image_url,
    category: p.category,
  }));

  const [localData, setLocalData] = useState({
    catalogId: data.catalogId || '',
    productRetailerId: data.productRetailerId || '',
    productName: data.productName || '',
    bodyText: data.bodyText || '',
    footerText: data.footerText || '',
    headerText: data.headerText || '',
    sections: data.sections || [],
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLocalData({
      catalogId: data.catalogId || '',
      productRetailerId: data.productRetailerId || '',
      productName: data.productName || '',
      bodyText: data.bodyText || '',
      footerText: data.footerText || '',
      headerText: data.headerText || '',
      sections: data.sections || [],
    });
    setHasChanges(false);
    setActiveCatalogId(data.catalogId || '');
  }, [data]);

  const handleChange = <K extends keyof typeof localData>(key: K, value: typeof localData[K]) => {
    setLocalData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localData);
    setHasChanges(false);
    toast.success('Product message saved');
  };

  const handleProductSelect = (productId: string, productName?: string) => {
    setLocalData((prev) => ({
      ...prev,
      productRetailerId: productId,
      productName: productName || productId,
    }));
    setHasChanges(true);
  };

  const handleAddSection = () => {
    const newSection = {
      title: `Section ${localData.sections.length + 1}`,
      productRetailerIds: [],
    };
    handleChange('sections', [...localData.sections, newSection]);
  };

  const handleRemoveSection = (index: number) => {
    const newSections = localData.sections.filter((_, i) => i !== index);
    handleChange('sections', newSections);
  };

  const handleSectionTitleChange = (index: number, title: string) => {
    const newSections = [...localData.sections];
    newSections[index] = { ...newSections[index], title };
    handleChange('sections', newSections);
  };

  const handleAddProductToSection = (sectionIndex: number, productId: string) => {
    const newSections = [...localData.sections];
    if (!newSections[sectionIndex].productRetailerIds.includes(productId)) {
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        productRetailerIds: [...newSections[sectionIndex].productRetailerIds, productId],
      };
      handleChange('sections', newSections);
    }
  };

  const handleRemoveProductFromSection = (sectionIndex: number, productId: string) => {
    const newSections = [...localData.sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      productRetailerIds: newSections[sectionIndex].productRetailerIds.filter(
        (id) => id !== productId
      ),
    };
    handleChange('sections', newSections);
  };

  const isSingleProduct = data.messageType === 'single';

  return (
    <div className="space-y-4">
      {/* Message Type Info */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          {isSingleProduct ? (
            <Package className="h-4 w-4 text-emerald-500" />
          ) : (
            <ShoppingBag className="h-4 w-4 text-teal-500" />
          )}
          <span className="font-medium text-sm">
            {isSingleProduct ? 'Single Product Message' : 'Multi-Product Message'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isSingleProduct
            ? 'Send a native WhatsApp product card from your Meta catalogue'
            : 'Send a list of products organized in sections (max 30 items)'}
        </p>
      </div>

      {/* Meta Catalogue Selection */}
      <div className="space-y-2">
        <Label>Meta Catalogue</Label>
        {!selectedAppService ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Select a WhatsApp number in Settings to load catalogues.
            </AlertDescription>
          </Alert>
        ) : loadingCatalogues ? (
          <div className="text-xs text-muted-foreground">Loading catalogues...</div>
        ) : catalogues.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              No Meta catalogue connected. Connect one in Commerce → Products → Meta Catalogue tab.
            </AlertDescription>
          </Alert>
        ) : (
          <Select
            value={localData.catalogId}
            onValueChange={(value) => {
              handleChange('catalogId', value);
              setActiveCatalogId(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select catalogue" />
            </SelectTrigger>
            <SelectContent>
              {catalogues.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name} {cat.product_count ? `(${cat.product_count} products)` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Single Product Selection */}
      {isSingleProduct && localData.catalogId && (
        <>
          {/* Selected Product */}
          {localData.productRetailerId && (
            <div className="space-y-2">
              <Label>Selected Product</Label>
              <div className="p-2 border rounded-md flex items-center justify-between bg-primary/5">
                <div>
                  <p className="text-sm font-medium">{localData.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    SKU: {localData.productRetailerId}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleProductSelect('', '')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Product List — auto-loaded, with inline filter */}
          <div className="space-y-2">
            <Label>{localData.productRetailerId ? 'Change Product' : 'Select a Product'}</Label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter products..."
              className="h-8 text-xs"
            />
            <div className="max-h-[240px] overflow-y-auto border rounded-md">
              {loadingProducts ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground mt-1">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No products in this catalogue
                </div>
              ) : (
                products
                  .filter((p) =>
                    !searchQuery ||
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.retailer_id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((product) => (
                    <button
                      key={product.retailer_id}
                      onClick={() => handleProductSelect(product.retailer_id, product.name)}
                      className={`w-full p-2 text-left hover:bg-muted transition-colors border-b last:border-b-0 ${
                        localData.productRetailerId === product.retailer_id
                          ? 'bg-primary/10'
                          : ''
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.currency} {product.price} | {product.availability}
                      </p>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Body Text */}
          <div className="space-y-2">
            <Label>Body Text (optional)</Label>
            <Textarea
              value={localData.bodyText}
              onChange={(e) => handleChange('bodyText', e.target.value)}
              placeholder="Add a message to show with the product..."
              rows={2}
            />
          </div>

          {/* Footer Text */}
          <div className="space-y-2">
            <Label>Footer Text (optional)</Label>
            <Input
              value={localData.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
              placeholder="Footer text..."
            />
          </div>
        </>
      )}

      {/* Multi-Product Sections */}
      {!isSingleProduct && localData.catalogId && (
        <>
          {/* Header Text */}
          <div className="space-y-2">
            <Label>Header Text</Label>
            <Input
              value={localData.headerText}
              onChange={(e) => handleChange('headerText', e.target.value)}
              placeholder="Browse our products..."
            />
          </div>

          {/* Body Text */}
          <div className="space-y-2">
            <Label>Body Text</Label>
            <Textarea
              value={localData.bodyText}
              onChange={(e) => handleChange('bodyText', e.target.value)}
              placeholder="Select from our collection..."
              rows={2}
            />
          </div>

          {/* Sections */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sections</Label>
              <Button variant="outline" size="sm" onClick={handleAddSection}>
                <Plus className="h-4 w-4 mr-1" />
                Add Section
              </Button>
            </div>

            {localData.sections.length === 0 ? (
              <div className="space-y-2 p-3 border-2 border-dashed rounded-md text-center">
                {loadingProducts ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading products...
                  </div>
                ) : products.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {products.length} product{products.length !== 1 ? 's' : ''} available
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        const allSkus = products.map((p) => p.retailer_id);
                        handleChange('sections', [{
                          title: 'Our Products',
                          productRetailerIds: allSkus,
                        }]);
                      }}
                    >
                      Add All {products.length} Products
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      or use &quot;Add Section&quot; to organize manually
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No products in this catalogue
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {localData.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={section.title}
                        onChange={(e) =>
                          handleSectionTitleChange(sectionIndex, e.target.value)
                        }
                        placeholder="Section title"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSection(sectionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Products in Section */}
                    <div className="space-y-1">
                      {section.productRetailerIds.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No products in this section</p>
                      ) : (
                        section.productRetailerIds.map((productId) => {
                          const product = products.find((p) => p.retailer_id === productId);
                          return (
                            <div
                              key={productId}
                              className="flex items-center justify-between p-1.5 bg-muted/50 rounded text-sm"
                            >
                              <span className="truncate">
                                {product?.name || productId}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  handleRemoveProductFromSection(sectionIndex, productId)
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add product to section */}
                    {loadingProducts ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground p-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading products...
                      </div>
                    ) : (
                      <Select
                        onValueChange={(value) =>
                          handleAddProductToSection(sectionIndex, value)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Add product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products
                            .filter(
                              (p) =>
                                !section.productRetailerIds.includes(p.retailer_id)
                            )
                            .map((product) => (
                              <SelectItem
                                key={product.retailer_id}
                                value={product.retailer_id}
                              >
                                {product.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Save Button */}
      {hasChanges && (
        <Button onClick={handleSave} className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      )}

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <p>
          {isSingleProduct
            ? 'The product message will display a native WhatsApp product card from your Meta Commerce catalogue.'
            : 'Multi-product messages can contain up to 30 products organized in up to 10 sections.'}
        </p>
      </div>
    </div>
  );
}
