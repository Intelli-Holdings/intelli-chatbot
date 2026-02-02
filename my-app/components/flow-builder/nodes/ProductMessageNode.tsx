'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ShoppingBag, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';

export type ProductMessageType = 'single' | 'multi';

export interface ProductMessageNodeData {
  type: 'product_message';
  label: string;
  messageType: ProductMessageType;
  catalogId?: string;
  // Single product
  productRetailerId?: string;
  productName?: string;
  bodyText?: string;
  footerText?: string;
  // Multi product
  headerText?: string;
  sections?: Array<{
    title: string;
    productRetailerIds: string[];
  }>;
}

interface ProductMessageNodeProps extends NodeProps<ProductMessageNodeData> {}

const PRODUCT_MESSAGE_CONFIG: Record<
  ProductMessageType,
  { icon: typeof ShoppingBag; title: string; color: string; borderColor: string }
> = {
  single: {
    icon: Package,
    title: 'Single Product',
    color: 'bg-emerald-500',
    borderColor: '#10b981',
  },
  multi: {
    icon: ShoppingBag,
    title: 'Product List',
    color: 'bg-teal-500',
    borderColor: '#14b8a6',
  },
};

function ProductMessageNode({ id, data, selected }: ProductMessageNodeProps) {
  const { messageType, productName, headerText, sections, bodyText } = data;
  const config = PRODUCT_MESSAGE_CONFIG[messageType];
  const Icon = config.icon;
  const validationClass = useNodeValidationClass(id);

  const getPreviewText = () => {
    if (messageType === 'single') {
      return productName || bodyText || 'No product selected';
    } else {
      if (sections && sections.length > 0) {
        const totalProducts = sections.reduce(
          (sum, s) => sum + (s.productRetailerIds?.length || 0),
          0
        );
        return `${sections.length} section${sections.length !== 1 ? 's' : ''}, ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`;
      }
      return headerText || 'No products selected';
    }
  };

  return (
    <div
      className={cn(
        'min-w-[180px] max-w-[220px] rounded-lg border bg-card shadow-sm transition-all relative',
        selected && 'ring-2 ring-primary ring-offset-2',
        !selected && validationClass
      )}
    >
      <NodeValidationIndicator nodeId={id} />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: config.borderColor }}
      />

      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-t-lg px-3 py-2 text-white',
          config.color
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.title}</span>
      </div>

      {/* Content */}
      <div className="p-3 min-w-0">
        <p
          className="text-xs text-muted-foreground truncate max-w-full"
          title={getPreviewText()}
        >
          {getPreviewText()}
        </p>
        {messageType === 'single' && data.catalogId && (
          <p className="text-[10px] text-muted-foreground/70 mt-1 truncate">
            Catalog: {data.catalogId.slice(0, 10)}...
          </p>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !bg-white"
        style={{ borderColor: config.borderColor }}
      />
    </div>
  );
}

export default memo(ProductMessageNode);
