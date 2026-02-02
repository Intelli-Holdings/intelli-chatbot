'use client';

import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Search, X, Loader2, Package, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import type { MetaProduct } from '@/types/ecommerce';

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
}: ProductGridProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

      {/* Products grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.retailer_id}
              product={product}
              selectable={selectable}
              selected={isProductSelected(product)}
              onSelect={handleProductSelect}
              onSendProduct={onSendProduct}
              showSendButton={showSendButton}
            />
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
