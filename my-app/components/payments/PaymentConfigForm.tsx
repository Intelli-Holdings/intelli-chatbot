'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [showSecrets, setShowSecrets] = useState(false);

  // Paystack fields
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');

  // Flutterwave fields
  const [flutterwavePublicKey, setFlutterwavePublicKey] = useState('');
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

  // MoMo fields
  const [momoSubscriptionKey, setMomoSubscriptionKey] = useState('');
  const [momoApiUserId, setMomoApiUserId] = useState('');
  const [momoApiKey, setMomoApiKey] = useState('');
  const [momoEnvironment, setMomoEnvironment] = useState<'sandbox' | 'production'>(
    existingConfig?.environment || 'sandbox'
  );

  // Pesapal fields
  const [pesapalConsumerKey, setPesapalConsumerKey] = useState('');
  const [pesapalConsumerSecret, setPesapalConsumerSecret] = useState('');
  const [pesapalEnvironment, setPesapalEnvironment] = useState<'sandbox' | 'production'>(
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
        };
        break;
      case 'flutterwave':
        config = {
          provider: 'flutterwave',
          public_key: flutterwavePublicKey,
          secret_key: flutterwaveSecretKey,
          encryption_key: flutterwaveEncryptionKey,
        };
        break;
      case 'mpesa':
        config = {
          provider: 'mpesa',
          consumer_key: mpesaConsumerKey,
          consumer_secret: mpesaConsumerSecret,
          environment: mpesaEnvironment,
          ...(mpesaEnvironment === 'production' ? {
            business_shortcode: mpesaBusinessShortcode,
            passkey: mpesaPasskey,
          } : {}),
        };
        break;
      case 'momo':
        config = {
          provider: 'momo',
          subscription_key: momoSubscriptionKey,
          api_user_id: momoApiUserId,
          api_key: momoApiKey,
          environment: momoEnvironment,
        };
        break;
      case 'pesapal':
        config = {
          provider: 'pesapal',
          consumer_key: pesapalConsumerKey,
          consumer_secret: pesapalConsumerSecret,
          environment: pesapalEnvironment,
        };
        break;
      case 'pay_on_delivery':
        config = {
          provider: 'pay_on_delivery',
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
          placeholder={isEditing && existingConfig?.public_key_hint
            ? `Current: ${existingConfig.public_key_hint}`
            : 'pk_test_... or pk_live_...'}
          value={paystackPublicKey}
          onChange={(e) => setPaystackPublicKey(e.target.value)}
          required={!isEditing}
        />
        {isEditing && existingConfig?.public_key_hint && (
          <p className="text-xs text-muted-foreground">
            Current key: {existingConfig.public_key_hint} — leave blank to keep
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="paystack-secret-key">Secret Key</Label>
        <div className="relative">
          <Input
            id="paystack-secret-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing && existingConfig?.secret_key_hint
              ? `Current: ${existingConfig.secret_key_hint}`
              : 'sk_test_... or sk_live_...'}
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
            {existingConfig?.has_secret_key
              ? `Current key: ${existingConfig.secret_key_hint} — leave blank to keep`
              : 'No secret key configured'}
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
          placeholder={isEditing && existingConfig?.public_key_hint
            ? `Current: ${existingConfig.public_key_hint}`
            : 'FLWPUBK_TEST-...'}
          value={flutterwavePublicKey}
          onChange={(e) => setFlutterwavePublicKey(e.target.value)}
          required={!isEditing}
        />
        {isEditing && existingConfig?.public_key_hint && (
          <p className="text-xs text-muted-foreground">
            Current key: {existingConfig.public_key_hint} — leave blank to keep
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="flutterwave-secret-key">Secret Key</Label>
        <div className="relative">
          <Input
            id="flutterwave-secret-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing && existingConfig?.secret_key_hint
              ? `Current: ${existingConfig.secret_key_hint}`
              : 'FLWSECK_TEST-...'}
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
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {existingConfig?.has_secret_key
              ? `Current key: ${existingConfig.secret_key_hint} — leave blank to keep`
              : 'No secret key configured'}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="flutterwave-encryption-key">Encryption Key</Label>
        <div className="relative">
          <Input
            id="flutterwave-encryption-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing && existingConfig?.encryption_key_hint
              ? `Current: ${existingConfig.encryption_key_hint}`
              : 'FLWSECK_TEST...'}
            value={flutterwaveEncryptionKey}
            onChange={(e) => setFlutterwaveEncryptionKey(e.target.value)}
            required={!isEditing}
          />
        </div>
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {existingConfig?.has_encryption_key
              ? `Current key: ${existingConfig.encryption_key_hint} — leave blank to keep`
              : 'No encryption key configured'}
          </p>
        )}
      </div>
    </>
  );

  const isMpesaProduction = mpesaEnvironment === 'production';

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
        {!isMpesaProduction && (
          <p className="text-xs text-muted-foreground">
            Sandbox uses default shortcode (174379) and passkey automatically
          </p>
        )}
      </div>
      {isMpesaProduction && (
        <div className="space-y-2">
          <Label htmlFor="mpesa-shortcode">Business Shortcode</Label>
          <Input
            id="mpesa-shortcode"
            placeholder="Your Lipa Na M-Pesa shortcode"
            value={mpesaBusinessShortcode}
            onChange={(e) => setMpesaBusinessShortcode(e.target.value)}
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="mpesa-consumer-key">Consumer Key</Label>
        <Input
          id="mpesa-consumer-key"
          placeholder="Consumer Key from Safaricom"
          value={mpesaConsumerKey}
          onChange={(e) => setMpesaConsumerKey(e.target.value)}
          required={!isEditing}
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {existingConfig?.has_consumer_key
              ? 'Key configured — leave blank to keep'
              : 'No consumer key configured'}
          </p>
        )}
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
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {existingConfig?.has_consumer_secret
              ? 'Secret configured — leave blank to keep'
              : 'No consumer secret configured'}
          </p>
        )}
      </div>
      {isMpesaProduction && (
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
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              {existingConfig?.has_passkey
                ? 'Passkey configured — leave blank to keep'
                : 'No passkey configured'}
            </p>
          )}
        </div>
      )}
    </>
  );

  const renderMomoFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="momo-environment">Environment</Label>
        <Select value={momoEnvironment} onValueChange={(v) => setMomoEnvironment(v as 'sandbox' | 'production')}>
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
        <Label htmlFor="momo-subscription-key">Subscription Key (Ocp-Apim-Subscription-Key)</Label>
        <div className="relative">
          <Input
            id="momo-subscription-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : 'Primary or Secondary key from MoMo portal'}
            value={momoSubscriptionKey}
            onChange={(e) => setMomoSubscriptionKey(e.target.value)}
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
            {existingConfig?.has_subscription_key
              ? 'Key configured — leave blank to keep'
              : 'No subscription key configured'}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="momo-api-user-id">API User ID</Label>
        <Input
          id="momo-api-user-id"
          placeholder={isEditing ? '••••••••••••' : 'UUID from MoMo developer portal'}
          value={momoApiUserId}
          onChange={(e) => setMomoApiUserId(e.target.value)}
          required={!isEditing}
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {existingConfig?.has_api_user_id
              ? 'User ID configured — leave blank to keep'
              : 'No API user ID configured'}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="momo-api-key">API Key</Label>
        <div className="relative">
          <Input
            id="momo-api-key"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : 'API key from MoMo developer portal'}
            value={momoApiKey}
            onChange={(e) => setMomoApiKey(e.target.value)}
            required={!isEditing}
          />
        </div>
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {existingConfig?.has_api_key
              ? 'Key configured — leave blank to keep'
              : 'No API key configured'}
          </p>
        )}
      </div>
    </>
  );

  const renderPesapalFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="pesapal-environment">Environment</Label>
        <Select value={pesapalEnvironment} onValueChange={(v) => setPesapalEnvironment(v as 'sandbox' | 'production')}>
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
        <Label htmlFor="pesapal-consumer-key">Consumer Key</Label>
        <Input
          id="pesapal-consumer-key"
          placeholder="Consumer Key from Pesapal dashboard"
          value={pesapalConsumerKey}
          onChange={(e) => setPesapalConsumerKey(e.target.value)}
          required={!isEditing}
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {existingConfig?.has_consumer_key
              ? 'Key configured — leave blank to keep'
              : 'No consumer key configured'}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="pesapal-consumer-secret">Consumer Secret</Label>
        <div className="relative">
          <Input
            id="pesapal-consumer-secret"
            type={showSecrets ? 'text' : 'password'}
            placeholder={isEditing ? '••••••••••••' : 'Consumer Secret from Pesapal dashboard'}
            value={pesapalConsumerSecret}
            onChange={(e) => setPesapalConsumerSecret(e.target.value)}
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
            {existingConfig?.has_consumer_secret
              ? 'Secret configured — leave blank to keep'
              : 'No consumer secret configured'}
          </p>
        )}
      </div>
    </>
  );

  const renderPayOnDeliveryFields = () => (
    <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground mb-1">No API keys required</p>
      <p>
        Enabling this option lets customers choose to pay with cash or mobile money
        when their order is delivered. This option will appear alongside your other
        payment methods in both the storefront checkout and WhatsApp order messages.
      </p>
    </div>
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
      case 'pesapal':
        return renderPesapalFields();
      case 'pay_on_delivery':
        return renderPayOnDeliveryFields();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {providerInfo.logo && (
              <Image
                src={providerInfo.logo}
                alt={providerInfo.name}
                width={24}
                height={24}
                className="object-contain"
              />
            )}
            {isEditing ? 'Edit' : 'Configure'} {providerInfo.name}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update your ${providerInfo.name} configuration`
              : `Enter your ${providerInfo.name} API credentials to enable payments`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
