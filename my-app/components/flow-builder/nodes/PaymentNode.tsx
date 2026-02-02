'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import NodeValidationIndicator, { useNodeValidationClass } from './NodeValidationIndicator';
import type { PaymentProvider } from '@/types/payments';

export interface PaymentNodeData {
  type: 'payment';
  label: string;
  provider?: PaymentProvider;
  amountVariable?: string; // Variable containing amount
  currencyVariable?: string; // Variable containing currency
  fixedAmount?: number; // Or fixed amount
  fixedCurrency?: string;
  description?: string;
  // Output handles for success/failure
  successMessage?: string;
  failureMessage?: string;
}

interface PaymentNodeProps extends NodeProps<PaymentNodeData> {}

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  paystack: 'Paystack',
  flutterwave: 'Flutterwave',
  mpesa: 'M-PESA',
  momo: 'MTN MoMo',
};

function PaymentNode({ id, data, selected }: PaymentNodeProps) {
  const { provider, fixedAmount, fixedCurrency, amountVariable, description } = data;
  const validationClass = useNodeValidationClass(id);

  const getAmountPreview = () => {
    if (fixedAmount && fixedCurrency) {
      return `${fixedCurrency} ${fixedAmount.toFixed(2)}`;
    }
    if (amountVariable) {
      return `{{${amountVariable}}}`;
    }
    return 'No amount set';
  };

  const getProviderLabel = () => {
    if (provider) {
      return PROVIDER_LABELS[provider];
    }
    return 'No provider selected';
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
        style={{ borderColor: '#8b5cf6' }}
      />

      {/* Header */}
      <div className="flex items-center justify-center gap-2 rounded-t-lg px-3 py-2 text-white bg-violet-500">
        <CreditCard className="h-4 w-4" />
        <span className="text-sm font-medium">Payment</span>
      </div>

      {/* Content */}
      <div className="p-3 min-w-0 space-y-1">
        <p className="text-xs font-medium">{getProviderLabel()}</p>
        <p className="text-xs text-muted-foreground">{getAmountPreview()}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground/70 truncate" title={description}>
            {description}
          </p>
        )}
      </div>

      {/* Output Handles for Success/Failure */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-6">
        {/* Success Handle */}
        <div className="relative">
          <Handle
            type="source"
            id="success"
            position={Position.Right}
            className="!h-3 !w-3 !border-2 !bg-white"
            style={{ borderColor: '#22c55e', top: '-12px' }}
          />
          <span className="absolute right-4 top-[-14px] text-[10px] text-green-600 whitespace-nowrap">
            Success
          </span>
        </div>

        {/* Failure Handle */}
        <div className="relative">
          <Handle
            type="source"
            id="failure"
            position={Position.Right}
            className="!h-3 !w-3 !border-2 !bg-white"
            style={{ borderColor: '#ef4444', top: '12px' }}
          />
          <span className="absolute right-4 top-[10px] text-[10px] text-red-600 whitespace-nowrap">
            Failed
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(PaymentNode);
