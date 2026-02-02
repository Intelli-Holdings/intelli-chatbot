'use client';

import { useState, useEffect } from 'react';
import { Check, Package, ShoppingBag, Plus, Trash2, Search, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';

interface ProductMessageNodeEditorProps {
  data: ProductMessageNodeData;
  onUpdate: (data: Partial<ProductMessageNodeData>) => void;
}

export default function ProductMessageNodeEditor({ data, onUpdate }: ProductMessageNodeEditorProps) {
  const { selectedAppService } = useAppServices();
  const { catalogues, loading: loadingCatalogues } = useCatalogues(selectedAppService);
  const { products, loading: loadingProducts, search } = useProducts(
    selectedAppService,
    data.catalogId || null
  );

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
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedAppService || !localData.catalogId) return;

    setIsSearching(true);
    try {
      await search(searchQuery);
    } finally {
      setIsSearching(false);
    }
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
            ? 'Send a single product with details from your catalogue'
            : 'Send a list of products organized in sections (max 30 items)'}
        </p>
      </div>

      {/* Catalogue Selection */}
      <div className="space-y-2">
        <Label>Catalogue</Label>
        <Select
          value={localData.catalogId}
          onValueChange={(value) => handleChange('catalogId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingCatalogues ? 'Loading...' : 'Select catalogue'} />
          </SelectTrigger>
          <SelectContent>
            {catalogues.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Search */}
      {localData.catalogId && (
        <div className="space-y-2">
          <Label>Search Products</Label>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or SKU..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Single Product Selection */}
      {isSingleProduct && localData.catalogId && (
        <>
          <div className="space-y-2">
            <Label>Selected Product</Label>
            {localData.productRetailerId ? (
              <div className="p-2 border rounded-md flex items-center justify-between">
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
            ) : (
              <p className="text-sm text-muted-foreground">No product selected</p>
            )}
          </div>

          {/* Product List */}
          {products.length > 0 && (
            <div className="space-y-2">
              <Label>Available Products</Label>
              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                {loadingProducts ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : (
                  products.map((product) => (
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
          )}

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
              <p className="text-sm text-muted-foreground p-2">
                No sections yet. Add a section to organize products.
              </p>
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
                    {products.length > 0 && (
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
            ? 'The product message will display the product image, name, price, and description from your WhatsApp Commerce catalogue.'
            : 'Multi-product messages can contain up to 30 products organized in up to 10 sections.'}
        </p>
      </div>
    </div>
  );
}
