'use client';

import * as React from 'react';
import { Check, X, Settings, TestTube, Loader2, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type {
  PaymentProvider,
  PaymentConfigResponse,
  PaymentProviderInfo,
} from '@/types/payments';
import { PAYMENT_PROVIDERS } from '@/types/payments';

interface PaymentProviderCardProps {
  provider: PaymentProvider;
  config?: PaymentConfigResponse | null;
  onConfigure: (provider: PaymentProvider) => void;
  onToggle?: (configId: string, active: boolean) => Promise<void>;
  onTest?: (configId: string) => Promise<void>;
  testing?: boolean;
  toggling?: boolean;
  className?: string;
}

export function PaymentProviderCard({
  provider,
  config,
  onConfigure,
  onToggle,
  onTest,
  testing = false,
  toggling = false,
  className,
}: PaymentProviderCardProps) {
  const providerInfo: PaymentProviderInfo = PAYMENT_PROVIDERS[provider];
  const isConfigured = !!config;
  const isActive = config?.is_active ?? false;

  const handleToggle = async (checked: boolean) => {
    if (config && onToggle) {
      await onToggle(config.id, checked);
    }
  };

  const handleTest = async () => {
    if (config && onTest) {
      await onTest(config.id);
    }
  };

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg font-bold text-primary">
                {providerInfo.name.charAt(0)}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{providerInfo.name}</CardTitle>
              <CardDescription className="text-xs">
                {providerInfo.description}
              </CardDescription>
            </div>
          </div>

          {isConfigured && (
            <div className="flex items-center gap-2">
              {config.is_test_mode && (
                <Badge variant="outline" className="text-xs">
                  Test Mode
                </Badge>
              )}
              <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={toggling}
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Supported currencies */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Supported currencies</p>
          <div className="flex flex-wrap gap-1">
            {providerInfo.supported_currencies.slice(0, 5).map((currency) => (
              <Badge key={currency} variant="secondary" className="text-xs">
                {currency}
              </Badge>
            ))}
            {providerInfo.supported_currencies.length > 5 && (
              <Badge variant="secondary" className="text-xs">
                +{providerInfo.supported_currencies.length - 5}
              </Badge>
            )}
          </div>
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Payment methods</p>
          <div className="flex flex-wrap gap-1">
            {providerInfo.payment_methods.map((method) => (
              <Badge key={method} variant="outline" className="text-xs">
                {method}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status and actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Configured</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Not configured</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isConfigured && onTest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
            )}

            <Button
              variant={isConfigured ? 'ghost' : 'default'}
              size="sm"
              onClick={() => onConfigure(provider)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {isConfigured ? 'Edit' : 'Configure'}
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <a
                href={providerInfo.docs_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentProviderCard;
