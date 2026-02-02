'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SettingsSearch } from '@/components/settings-search';
import { useAppServices } from '@/hooks/use-app-services';
import {
  useCatalogues,
  useCommerceSettings,
  useProducts,
} from '@/hooks/use-catalogue';
import { CatalogueSelector, ProductGrid } from '@/components/catalogue';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  Eye,
  Loader2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const settingsNavigation = [
  {
    title: 'General',
    href: '/dashboard/settings',
  },
  {
    title: 'Automation',
    href: '/dashboard/settings/automation',
  },
  {
    title: 'Custom Fields',
    href: '/dashboard/settings/custom-fields',
  },
  {
    title: 'Escalation Events',
    href: '/dashboard/settings/escalation-events',
  },
  {
    title: 'Catalogue',
    href: '/dashboard/settings/catalogue',
  },
  {
    title: 'Payments',
    href: '/dashboard/settings/payments',
  },
];

export default function CatalogueSettingsPage() {
  const pathname = usePathname();
  const {
    appServices,
    loading: loadingAppServices,
    selectedAppService,
    setSelectedAppService,
  } = useAppServices();

  // Catalogue hooks
  const {
    catalogues,
    loading: loadingCatalogues,
    error: cataloguesError,
    refetch: refetchCatalogues,
    selectedCatalogue,
    setSelectedCatalogue,
  } = useCatalogues(selectedAppService);

  const {
    settings: commerceSettings,
    loading: loadingSettings,
    error: settingsError,
    updateSettings,
    updating: updatingSettings,
  } = useCommerceSettings(selectedAppService);

  const {
    products,
    loading: loadingProducts,
    error: productsError,
    refetch: refetchProducts,
    loadMore,
    hasMore,
    search: searchProducts,
    searchQuery,
    clearSearch,
  } = useProducts(selectedAppService, selectedCatalogue?.id || null, {
    limit: 12,
  });

  // Handle toggle settings
  const handleToggleCatalogVisible = async (checked: boolean) => {
    try {
      await updateSettings({ is_catalog_visible: checked });
      toast.success(
        checked
          ? 'Catalogue is now visible to customers'
          : 'Catalogue is now hidden from customers'
      );
    } catch {
      toast.error('Failed to update catalogue visibility');
    }
  };

  const handleToggleCartEnabled = async (checked: boolean) => {
    try {
      await updateSettings({ is_cart_enabled: checked });
      toast.success(
        checked ? 'Shopping cart enabled' : 'Shopping cart disabled'
      );
    } catch {
      toast.error('Failed to update cart settings');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="sticky top-0 flex h-screen flex-col">
          {/* Header */}
          <div className="border-b border-border p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Link
              href="/dashboard"
              className="mt-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <span>&larr; Go to Dashboard</span>
            </Link>
          </div>

          {/* Search */}
          <div className="border-b border-border p-4">
            <SettingsSearch />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {settingsNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8" />
              <div>
                <h2 className="text-3xl font-bold">Catalogue</h2>
                <p className="mt-1 text-muted-foreground">
                  Manage your WhatsApp Commerce catalogue and product settings
                </p>
              </div>
            </div>
          </div>

          {/* App Service Selector */}
          <div className="mb-6">
            <Label className="mb-2 block text-sm font-medium">
              WhatsApp Number
            </Label>
            {loadingAppServices ? (
              <Skeleton className="h-10 w-full" />
            ) : appServices.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No WhatsApp services configured. Please set up a WhatsApp
                  Business account first.
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedAppService?.id?.toString() || ''}
                onValueChange={(value) => {
                  const service = appServices.find(
                    (s) => s.id.toString() === value
                  );
                  setSelectedAppService(service || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a WhatsApp number" />
                </SelectTrigger>
                <SelectContent>
                  {appServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.phone_number}
                      {service.name && ` - ${service.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedAppService && (
            <div className="space-y-6">
              {/* Commerce Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Commerce Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how your catalogue appears to customers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingSettings ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : settingsError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{settingsError}</AlertDescription>
                    </Alert>
                  ) : commerceSettings ? (
                    <>
                      {/* Catalogue Visibility */}
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <Eye className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <Label className="text-base font-medium">
                              Catalogue Visible
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Allow customers to view your product catalogue
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={commerceSettings.is_catalog_visible}
                          onCheckedChange={handleToggleCatalogVisible}
                          disabled={updatingSettings}
                        />
                      </div>

                      {/* Cart Enabled */}
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <Label className="text-base font-medium">
                              Shopping Cart
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Enable customers to add items to cart and checkout
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={commerceSettings.is_cart_enabled}
                          onCheckedChange={handleToggleCartEnabled}
                          disabled={updatingSettings}
                        />
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              {/* Connected Catalogue Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Connected Catalogue
                      </CardTitle>
                      <CardDescription>
                        Select and manage your product catalogue
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchCatalogues()}
                      disabled={loadingCatalogues}
                    >
                      <RefreshCw
                        className={cn(
                          'h-4 w-4 mr-2',
                          loadingCatalogues && 'animate-spin'
                        )}
                      />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cataloguesError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{cataloguesError}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <CatalogueSelector
                        catalogues={catalogues}
                        selectedCatalogue={selectedCatalogue}
                        onSelect={setSelectedCatalogue}
                        loading={loadingCatalogues}
                      />

                      {selectedCatalogue && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                          <div>
                            <p className="font-medium">{selectedCatalogue.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedCatalogue.product_count ?? 0} products
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`https://business.facebook.com/commerce/catalogs/${selectedCatalogue.id}/products`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Manage in Meta
                            </a>
                          </Button>
                        </div>
                      )}

                      {!loadingCatalogues && catalogues.length === 0 && (
                        <Alert>
                          <AlertDescription>
                            No catalogues found. Create a catalogue in{' '}
                            <a
                              href="https://business.facebook.com/commerce"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium underline"
                            >
                              Meta Commerce Manager
                            </a>{' '}
                            and connect it to your WhatsApp Business Account.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Products Preview Card */}
              {selectedCatalogue && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>
                          Preview products from your catalogue
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {selectedCatalogue.product_count ?? 0} total
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProductGrid
                      products={products}
                      loading={loadingProducts}
                      error={productsError}
                      onSearch={searchProducts}
                      searchQuery={searchQuery}
                      onClearSearch={clearSearch}
                      onLoadMore={loadMore}
                      hasMore={hasMore}
                      onRefresh={refetchProducts}
                      emptyMessage="No products in this catalogue"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
