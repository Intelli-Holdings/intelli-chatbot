'use client';

import * as React from 'react';
import { useState } from 'react';
import { Loader2, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type {
  PaymentProvider,
  PaymentConfigResponse,
  CreatePaymentConfigRequest,
} from '@/types/payments';
import { PAYMENT_PROVIDERS } from '@/types/payments';

interface PaymentConfigFormProps {
  provider: PaymentProvider;
  existingConfig?: PaymentConfigResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (config: CreatePaymentConfigRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
  saving?: boolean;
  deleting?: boolean;
}

export function PaymentConfigForm({
  provider,
  existingConfig,
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  saving = false,
  deleting = false,
}: PaymentConfigFormProps) {
  const providerInfo = PAYMENT_PROVIDERS[provider];
  const isEditing = !!existingConfig;

  // Form state
  const [isTestMode, setIsTestMode] = useState(existingConfig?.is_test_mode ?? true);
  const [showSecrets, setShowSecrets] = useState(false);

  // Paystack fields
  const [paystackPublicKey, setPaystackPublicKey] = useState(existingConfig?.public_key || '');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');

  // Flutterwave fields
  const [flutterwavePublicKey, setFlutterwavePublicKey] = useState(
    existingConfig?.public_key || ''
  );
  const [flutterwaveSecretKey, setFlutterwaveSecretKey] = useState('');
  const [flutterwaveEncryptionKey, setFlutterwaveEncryptionKey] = useState('');

  // MPESA fields
  const [mpesaConsumerKey, setMpesaConsumerKey] = useState('');
  const [mpesaConsumerSecret, setMpesaConsumerSecret] = useState('');
  const [mpesaBusinessShortcode, setMpesaBusinessShortcode] = useState(
    existingConfig?.business_shortcode || ''
  );
  const [mpesaPasskey, setMpesaPasskey] = useState('');
  const [mpesaEnvironment, setMpesaEnvironment] = useState<'sandbox' | 'production'>(
    existingConfig?.environment || 'sandbox'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let config: CreatePaymentConfigRequest;

    switch (provider) {
      case 'paystack':
        config = {
          provider: 'paystack',
          public_key: paystackPublicKey,
          secret_key: paystackSecretKey,
          is_test_mode: isTestMode,
        };
        break;
      case 'flutterwave':
        config = {
          provider: 'flutterwave',
          public_key: flutterwavePublicKey,
          secret_key: flutterwaveSecretKey,
          encryption_key: flutterwaveEncryptionKey,
          is_test_mode: isTestMode,
        };
        break;
      case 'mpesa':
        config = {
          provider: 'mpesa',
          consumer_key: mpesaConsumerKey,
          consumer_secret: mpesaConsumerSecret,
          business_shortcode: mpesaBusinessShortcode,
          passkey: mpesaPasskey,
          environment: mpesaEnvironment,
        };
        break;
      case 'momo':
        config = {
          provider: 'momo',
          flutterwave_config_id: '', // Would need to select Flutterwave config
        };
        break;
      default:
        return;
    }

    await onSubmit(config);
  };

  const renderPaystackFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="paystack-public-key">Public Key</Label>
        <Input
          id="paystack-public-key"
          placeholder={isTestMode ? 'pk_test_...' : 'pk_live_...'}
          value={paystackPublicKey}
          onChange={(e) => setPaystackPublicKey(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="paystack-secret-key">Secret Key</Label>
        <div className="relative">
          <Input
            id="paystack-secret-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : isTestMode ? 'sk_test_...' : 'sk_live_...'}
            value={paystackSecretKey}
            onChange={(e) => setPaystackSecretKey(e.target.value)}
            required={!isEditing}
          />
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            Leave blank to keep existing secret key
          </p>
        )}
      </div>
    </>
  );

  const renderFlutterwaveFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="flutterwave-public-key">Public Key</Label>
        <Input
          id="flutterwave-public-key"
          placeholder="FLWPUBK_TEST-..."
          value={flutterwavePublicKey}
          onChange={(e) => setFlutterwavePublicKey(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="flutterwave-secret-key">Secret Key</Label>
        <div className="relative">
          <Input
            id="flutterwave-secret-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : 'FLWSECK_TEST-...'}
            value={flutterwaveSecretKey}
            onChange={(e) => setFlutterwaveSecretKey(e.target.value)}
            required={!isEditing}
          />
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="flutterwave-encryption-key">Encryption Key</Label>
        <div className="relative">
          <Input
            id="flutterwave-encryption-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : 'FLWSECK_TEST...'}
            value={flutterwaveEncryptionKey}
            onChange={(e) => setFlutterwaveEncryptionKey(e.target.value)}
            required={!isEditing}
          />
        </div>
      </div>
    </>
  );

  const renderMpesaFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="mpesa-environment">Environment</Label>
        <Select value={mpesaEnvironment} onValueChange={(v) => setMpesaEnvironment(v as 'sandbox' | 'production')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
            <SelectItem value="production">Production (Live)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mpesa-shortcode">Business Shortcode</Label>
        <Input
          id="mpesa-shortcode"
          placeholder="174379"
          value={mpesaBusinessShortcode}
          onChange={(e) => setMpesaBusinessShortcode(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mpesa-consumer-key">Consumer Key</Label>
        <Input
          id="mpesa-consumer-key"
          placeholder="Consumer Key from Safaricom"
          value={mpesaConsumerKey}
          onChange={(e) => setMpesaConsumerKey(e.target.value)}
          required={!isEditing}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mpesa-consumer-secret">Consumer Secret</Label>
        <div className="relative">
          <Input
            id="mpesa-consumer-secret"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : 'Consumer Secret'}
            value={mpesaConsumerSecret}
            onChange={(e) => setMpesaConsumerSecret(e.target.value)}
            required={!isEditing}
          />
          <button
            type="button"
            onClick={() => setShowSecrets(!showSecrets)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="mpesa-passkey">Passkey</Label>
        <div className="relative">
          <Input
            id="mpesa-passkey"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : 'Lipa na M-Pesa Passkey'}
            value={mpesaPasskey}
            onChange={(e) => setMpesaPasskey(e.target.value)}
            required={!isEditing}
          />
        </div>
      </div>
    </>
  );

  const renderMomoFields = () => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        MTN Mobile Money is integrated through Flutterwave. Please configure
        Flutterwave first to enable MOMO payments.
      </AlertDescription>
    </Alert>
  );

  const renderProviderFields = () => {
    switch (provider) {
      case 'paystack':
        return renderPaystackFields();
      case 'flutterwave':
        return renderFlutterwaveFields();
      case 'mpesa':
        return renderMpesaFields();
      case 'momo':
        return renderMomoFields();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit' : 'Configure'} {providerInfo.name}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update your ${providerInfo.name} configuration`
              : `Enter your ${providerInfo.name} API credentials to enable payments`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Test mode toggle (except for MPESA which has its own env selector) */}
          {provider !== 'mpesa' && provider !== 'momo' && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Test Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Use test credentials for development
                </p>
              </div>
              <Switch checked={isTestMode} onCheckedChange={setIsTestMode} />
            </div>
          )}

          {/* Provider-specific fields */}
          {renderProviderFields()}

          {/* Webhook URL info */}
          {existingConfig?.webhook_url && (
            <div className="rounded-lg bg-muted p-3">
              <Label className="text-xs">Webhook URL</Label>
              <p className="text-xs font-mono break-all mt-1">
                {existingConfig.webhook_url}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure this URL in your {providerInfo.name} dashboard
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={deleting || saving}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || deleting}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentConfigForm;
