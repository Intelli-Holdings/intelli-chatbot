'use client';

import * as React from 'react';
import Image from 'next/image';
import { Package, Check, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { MetaProduct } from '@/types/ecommerce';
import { formatCurrency, type SupportedCurrency } from '@/types/ecommerce';

interface ProductCardProps {
  product: MetaProduct;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (product: MetaProduct, selected: boolean) => void;
  onSendProduct?: (product: MetaProduct) => void;
  showSendButton?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  selectable = false,
  selected = false,
  onSelect,
  onSendProduct,
  showSendButton = false,
  className,
}: ProductCardProps) {
  const handleSelect = () => {
    if (selectable && onSelect) {
      onSelect(product, !selected);
    }
  };

  const getAvailabilityBadge = () => {
    switch (product.availability) {
      case 'in stock':
        return <Badge variant="default" className="bg-green-500">In Stock</Badge>;
      case 'out of stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'available for order':
        return <Badge variant="secondary">Available for Order</Badge>;
      default:
        return null;
    }
  };

  const formattedPrice = formatCurrency(
    product.price,
    product.currency as SupportedCurrency
  );

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        selectable && 'cursor-pointer hover:shadow-md',
        selected && 'ring-2 ring-primary',
        className
      )}
      onClick={selectable ? handleSelect : undefined}
    >
      {selectable && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect?.(product, !!checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {selected && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      )}

      <div className="aspect-square relative bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm line-clamp-2" title={product.name}>
              {product.name}
            </h3>
          </div>

          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{formattedPrice}</span>
            {getAvailabilityBadge()}
          </div>

          <div className="text-xs text-muted-foreground">
            SKU: {product.retailer_id}
          </div>

          {showSendButton && onSendProduct && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onSendProduct(product);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Send Product
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
