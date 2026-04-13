'use client';

import { useState, useEffect } from 'react';
import { Check, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentNodeData } from '../nodes/PaymentNode';
import { usePaymentConfigs } from '@/hooks/use-payments';
import { PAYMENT_PROVIDERS, type PaymentProvider } from '@/types/payments';
import { toast } from 'sonner';

interface PaymentNodeEditorProps {
  data: PaymentNodeData;
  onUpdate: (data: Partial<PaymentNodeData>) => void;
}

const CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'UGX', name: 'Ugandan Shilling' },
  { code: 'TZS', name: 'Tanzanian Shilling' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'EUR', name: 'Euro' },
];

export default function PaymentNodeEditor({ data, onUpdate }: PaymentNodeEditorProps) {
  const { configs, loading: loadingConfigs } = usePaymentConfigs();

  const [localData, setLocalData] = useState({
    provider: data.provider || undefined,
    amountVariable: data.amountVariable || '',
    currencyVariable: data.currencyVariable || '',
    fixedAmount: data.fixedAmount,
    fixedCurrency: data.fixedCurrency || '',
    description: data.description || '',
    successMessage: data.successMessage || 'Payment successful! Your order has been confirmed.',
    failureMessage: data.failureMessage || 'Payment failed. Please try again or contact support.',
  });
  const [useVariable, setUseVariable] = useState(!!data.amountVariable);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalData({
      provider: data.provider || undefined,
      amountVariable: data.amountVariable || '',
      currencyVariable: data.currencyVariable || '',
      fixedAmount: data.fixedAmount,
      fixedCurrency: data.fixedCurrency || '',
      description: data.description || '',
      successMessage: data.successMessage || 'Payment successful! Your order has been confirmed.',
      failureMessage: data.failureMessage || 'Payment failed. Please try again or contact support.',
    });
    setUseVariable(!!data.amountVariable);
    setHasChanges(false);
  }, [data]);

  const handleChange = <K extends keyof typeof localData>(key: K, value: typeof localData[K]) => {
    setLocalData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Clear variable or fixed values based on selection
    const saveData = {
      ...localData,
      amountVariable: useVariable ? localData.amountVariable : undefined,
      currencyVariable: useVariable ? localData.currencyVariable : undefined,
      fixedAmount: useVariable ? undefined : localData.fixedAmount,
      fixedCurrency: useVariable ? undefined : localData.fixedCurrency,
    };
    onUpdate(saveData);
    setHasChanges(false);
    toast.success('Payment settings saved');
  };

  const handleToggleVariable = (checked: boolean) => {
    setUseVariable(checked);
    setHasChanges(true);
  };

  // Get active payment configs
  const activeConfigs = configs.filter((c) => c.is_active);

  // Get provider info
  const selectedProviderInfo = localData.provider ? PAYMENT_PROVIDERS[localData.provider] : null;

  return (
    <div className="space-y-4">
      {/* Info Header */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 text-violet-500" />
          <span className="font-medium text-sm">Payment Request</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Request payment from the customer. The flow will branch based on payment success or failure.
        </p>
      </div>

      {/* No Active Providers Warning */}
      {!loadingConfigs && activeConfigs.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No payment providers configured. Please set up a payment provider in Settings → Payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Provider Selection */}
      <div className="space-y-2">
        <Label>Payment Provider</Label>
        <Select
          value={localData.provider}
          onValueChange={(value) => handleChange('provider', value as PaymentProvider)}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingConfigs ? 'Loading...' : 'Select provider'} />
          </SelectTrigger>
          <SelectContent>
            {activeConfigs.map((config) => {
              const providerInfo = PAYMENT_PROVIDERS[config.provider];
              return (
                <SelectItem key={config.id} value={config.provider}>
                  <div className="flex items-center gap-2">
                    <span>{providerInfo?.name || config.provider}</span>
                    {config.is_test_mode && (
                      <span className="text-xs text-yellow-600">(Test)</span>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedProviderInfo && (
          <p className="text-xs text-muted-foreground">
            {selectedProviderInfo.description}
          </p>
        )}
      </div>

      {/* Amount Type Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Use Variable Amount</Label>
          <p className="text-xs text-muted-foreground">
            Get amount from a flow variable
          </p>
        </div>
        <Switch checked={useVariable} onCheckedChange={handleToggleVariable} />
      </div>

      {/* Variable Amount Fields */}
      {useVariable ? (
        <>
          <div className="space-y-2">
            <Label>Amount Variable</Label>
            <Input
              value={localData.amountVariable}
              onChange={(e) => handleChange('amountVariable', e.target.value)}
              placeholder="e.g., order_total"
            />
            <p className="text-xs text-muted-foreground">
              Variable name containing the payment amount (without {'{{}}'})
            </p>
          </div>

          <div className="space-y-2">
            <Label>Currency Variable (optional)</Label>
            <Input
              value={localData.currencyVariable}
              onChange={(e) => handleChange('currencyVariable', e.target.value)}
              placeholder="e.g., order_currency"
            />
            <p className="text-xs text-muted-foreground">
              Variable name containing the currency code, or leave empty for default
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Fixed Amount Fields */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Select
                value={localData.fixedCurrency}
                onValueChange={(value) => handleChange('fixedCurrency', value)}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={localData.fixedAmount || ''}
                onChange={(e) =>
                  handleChange('fixedAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                placeholder="0.00"
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {/* Payment Description */}
      <div className="space-y-2">
        <Label>Payment Description (optional)</Label>
        <Input
          value={localData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="e.g., Order #12345"
        />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <Label>Success Message</Label>
        <Textarea
          value={localData.successMessage}
          onChange={(e) => handleChange('successMessage', e.target.value)}
          placeholder="Message to send on successful payment..."
          rows={2}
        />
      </div>

      {/* Failure Message */}
      <div className="space-y-2">
        <Label>Failure Message</Label>
        <Textarea
          value={localData.failureMessage}
          onChange={(e) => handleChange('failureMessage', e.target.value)}
          placeholder="Message to send on payment failure..."
          rows={2}
        />
      </div>

      {/* Save Button */}
      {hasChanges && (
        <Button onClick={handleSave} className="w-full">
          <Check className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      )}

      {/* Flow Info */}
      <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Success path: Customer completed payment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Failure path: Payment declined or cancelled</span>
        </div>
      </div>
    </div>
  );
}
