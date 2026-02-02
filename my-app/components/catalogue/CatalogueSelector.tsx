'use client';

import * as React from 'react';
import { Package, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { MetaCatalogue } from '@/types/ecommerce';

interface CatalogueSelectorProps {
  catalogues: MetaCatalogue[];
  selectedCatalogue: MetaCatalogue | null;
  onSelect: (catalogue: MetaCatalogue | null) => void;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CatalogueSelector({
  catalogues,
  selectedCatalogue,
  onSelect,
  loading = false,
  error = null,
  disabled = false,
  placeholder = 'Select a catalogue',
  className,
}: CatalogueSelectorProps) {
  const handleValueChange = (value: string) => {
    if (value === 'none') {
      onSelect(null);
      return;
    }
    const catalogue = catalogues.find((c) => c.id === value);
    if (catalogue) {
      onSelect(catalogue);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground',
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading catalogues...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive',
          className
        )}
      >
        <AlertCircle className="h-4 w-4" />
        <span className="truncate">{error}</span>
      </div>
    );
  }

  if (catalogues.length === 0) {
    return (
      <div
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground',
          className
        )}
      >
        <Package className="h-4 w-4" />
        <span>No catalogues available</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedCatalogue?.id || 'none'}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder}>
          {selectedCatalogue ? (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="truncate">{selectedCatalogue.name}</span>
              {selectedCatalogue.product_count !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ({selectedCatalogue.product_count} products)
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {catalogues.map((catalogue) => (
          <SelectItem key={catalogue.id} value={catalogue.id}>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{catalogue.name}</span>
              {catalogue.product_count !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ({catalogue.product_count})
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CatalogueSelector;
