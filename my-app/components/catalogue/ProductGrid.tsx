'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Search, X, Loader2, Package, RefreshCw, LayoutGrid, List, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import type { MetaProduct, ProductAvailability } from '@/types/ecommerce';
import { formatCurrency, type SupportedCurrency } from '@/types/ecommerce';

interface ProductGridProps {
  products: MetaProduct[];
  loading?: boolean;
  error?: string | null;
  onSearch?: (query: string) => Promise<void>;
  searchQuery?: string;
  onClearSearch?: () => void;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  selectable?: boolean;
  selectedProducts?: MetaProduct[];
  onProductSelect?: (product: MetaProduct, selected: boolean) => void;
  onSendProduct?: (product: MetaProduct) => void;
  showSendButton?: boolean;
  onRefresh?: () => Promise<void>;
  maxSelections?: number;
  emptyMessage?: string;
  className?: string;
  onEditAvailability?: (product: MetaProduct, availability: ProductAvailability) => void;
  onEditProduct?: (product: MetaProduct) => void;
}

export function ProductGrid({
  products,
  loading = false,
  error = null,
  onSearch,
  searchQuery = '',
  onClearSearch,
  onLoadMore,
  hasMore = false,
  selectable = false,
  selectedProducts = [],
  onProductSelect,
  onSendProduct,
  showSendButton = false,
  onRefresh,
  maxSelections = 30,
  emptyMessage = 'No products found',
  className,
  onEditAvailability,
  onEditProduct,
}: ProductGridProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | ProductAvailability>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Sync local search query with prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Debounced search handler
  useEffect(() => {
    if (!onSearch) return;

    const timeoutId = setTimeout(async () => {
      if (localSearchQuery !== searchQuery) {
        setIsSearching(true);
        try {
          await onSearch(localSearchQuery);
        } finally {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, onSearch]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    onClearSearch?.();
  }, [onClearSearch]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !onLoadMore) return;
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, onLoadMore]);

  const isProductSelected = useCallback(
    (product: MetaProduct) => {
      return selectedProducts.some((p) => p.retailer_id === product.retailer_id);
    },
    [selectedProducts]
  );

  const handleProductSelect = useCallback(
    (product: MetaProduct, selected: boolean) => {
      if (selected && selectedProducts.length >= maxSelections) {
        return; // Don't allow more selections if max reached
      }
      onProductSelect?.(product, selected);
    },
    [selectedProducts.length, maxSelections, onProductSelect]
  );

  // Extract unique categories from products
  const uniqueCategories = React.useMemo(() => {
    const categories = new Set<string>();
    products.forEach((p) => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }, [products]);

  // Filter products based on availability and category
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      if (availabilityFilter !== 'all' && p.availability !== availabilityFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, availabilityFilter, categoryFilter]);

  const getAvailabilityBadge = (availability: ProductAvailability) => {
    switch (availability) {
      case 'in stock':
        return <Badge variant="default" className="bg-green-500 text-xs whitespace-nowrap">In Stock</Badge>;
      case 'out of stock':
        return <Badge variant="destructive" className="text-xs whitespace-nowrap">Out of Stock</Badge>;
      case 'available for order':
        return <Badge variant="secondary" className="text-xs whitespace-nowrap">Available for Order</Badge>;
      default:
        return null;
    }
  };

  // Loading skeleton
  if (loading && products.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {onSearch && (
          <div className="relative">
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and actions bar */}
      <div className="flex items-center gap-2">
        {onSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {localSearchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isSearching && (
              <Loader2 className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View mode toggle */}
        <div className="flex items-center rounded-md border">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Availability filter */}
        <Select
          value={availabilityFilter}
          onValueChange={(value) => setAvailabilityFilter(value as 'all' | ProductAvailability)}
        >
          <SelectTrigger className="h-8 w-[170px] text-xs">
            <Filter className="mr-1 h-3 w-3" />
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Availability</SelectItem>
            <SelectItem value="in stock">In Stock</SelectItem>
            <SelectItem value="out of stock">Out of Stock</SelectItem>
            <SelectItem value="available for order">Available for Order</SelectItem>
          </SelectContent>
        </Select>

        {/* Category filter */}
        {uniqueCategories.length > 0 && (
          <Select
            value={categoryFilter || 'all'}
            onValueChange={(value) => setCategoryFilter(value === 'all' ? '' : value)}
          >
            <SelectTrigger className="h-8 w-[170px] text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Product count */}
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredProducts.length === products.length
            ? `${products.length} product${products.length !== 1 ? 's' : ''}`
            : `${filteredProducts.length} of ${products.length} product${products.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Selection info */}
      {selectable && selectedProducts.length > 0 && (
        <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
          <span>
            {selectedProducts.length} of {maxSelections} products selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              selectedProducts.forEach((p) => onProductSelect?.(p, false));
            }}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
          {searchQuery && (
            <Button variant="link" onClick={handleClearSearch} className="mt-2">
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Filtered empty state */}
      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products match the selected filters</p>
          <Button
            variant="link"
            onClick={() => {
              setAvailabilityFilter('all');
              setCategoryFilter('');
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Products grid view */}
      {filteredProducts.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.retailer_id}
              product={product}
              selectable={selectable}
              selected={isProductSelected(product)}
              onSelect={handleProductSelect}
              onSendProduct={onSendProduct}
              onEditProduct={onEditProduct}
              showSendButton={showSendButton}
            />
          ))}
        </div>
      )}

      {/* Products list view */}
      {filteredProducts.length > 0 && viewMode === 'list' && (
        <div className="rounded-md border overflow-x-auto">
          {/* List header */}
          <div className="grid grid-cols-[48px_1fr_100px_100px_140px_120px] gap-3 items-center px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
            <span></span>
            <span>Product</span>
            <span>SKU</span>
            <span>Price</span>
            <span>Availability</span>
            <span>Category</span>
          </div>
          {filteredProducts.map((product) => (
            <div
              key={product.retailer_id}
              className="grid grid-cols-[48px_1fr_100px_100px_140px_120px] gap-3 items-center px-3 py-2 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              {/* Thumbnail */}
              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Name */}
              <span className="text-sm font-medium truncate">{product.name}</span>

              {/* SKU */}
              <span className="text-xs text-muted-foreground truncate">{product.retailer_id}</span>

              {/* Price */}
              <span className="text-sm font-medium">
                {formatCurrency(product.price, product.currency as SupportedCurrency)}
              </span>

              {/* Availability */}
              <div>
                {onEditAvailability ? (
                  <Select
                    value={product.availability}
                    onValueChange={(value) =>
                      onEditAvailability(product, value as ProductAvailability)
                    }
                  >
                    <SelectTrigger className="h-7 w-[130px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in stock">In Stock</SelectItem>
                      <SelectItem value="out of stock">Out of Stock</SelectItem>
                      <SelectItem value="available for order">Available for Order</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getAvailabilityBadge(product.availability)
                )}
              </div>

              {/* Category */}
              <div>
                {product.category ? (
                  <Badge variant="outline" className="text-xs truncate max-w-[110px]">
                    {product.category}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground/60 italic">No category</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more products'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;
