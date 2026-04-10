'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Store,
  Globe,
  Palette,
  MessageCircle,
  Save,
  Eye,
  Loader2,
  Check,
  Link2,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStorefront } from '@/hooks/use-storefront';
import { API_BASE } from '@/lib/commerce-api';
import { toast } from 'sonner';

export default function StorefrontSettingsPage() {
  const { storefront, loading, saving, updateStorefront } = useStorefront();

  // Local form state
  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    logo_url: '',
    banner_url: '',
    whatsapp_number: '',
    primary_color: '#007fff',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    tiktok_url: '',
    website_url: '',
    is_active: false,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Sync from storefront data
  useEffect(() => {
    if (storefront) {
      setForm({
        name: storefront.name || '',
        slug: storefront.slug || '',
        tagline: storefront.tagline || '',
        description: storefront.description || '',
        logo_url: storefront.logo_url || '',
        banner_url: storefront.banner_url || '',
        whatsapp_number: storefront.whatsapp_number || '',
        primary_color: storefront.primary_color || '#007fff',
        facebook_url: storefront.facebook_url || '',
        instagram_url: storefront.instagram_url || '',
        twitter_url: storefront.twitter_url || '',
        tiktok_url: storefront.tiktok_url || '',
        website_url: storefront.website_url || '',
        is_active: storefront.is_active || false,
      });
      setIsDirty(false);
    }
  }, [storefront]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateStorefront(form);
      setIsDirty(false);
      setShowSaved(true);
      toast.success('Storefront settings saved');
      setTimeout(() => setShowSaved(false), 2000);
    } catch {
      toast.error('Failed to save settings');
    }
  };

  const storefrontUrl = storefront?.slug
    ? `${API_BASE}/commerce/store/${storefront.slug}/`
    : null;

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-golden-heading font-semibold tracking-tight">
            Storefront
          </h2>
          <p className="mt-golden-3xs text-golden-body-sm text-muted-foreground">
            Customize your public store appearance and branding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {storefrontUrl && form.is_active && (
            <Button variant="outline" asChild>
              <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </a>
            </Button>
          )}
          <Button onClick={handleSave} disabled={!isDirty || saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : showSaved ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {showSaved ? 'Saved' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Publish toggle */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-golden-lg">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Publish Storefront</Label>
            <p className="text-xs text-muted-foreground">
              Make your store visible to the public.
            </p>
          </div>
          <Switch
            checked={form.is_active}
            onCheckedChange={(checked) => handleChange('is_active', checked)}
          />
        </CardContent>
      </Card>

      {/* Store Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-muted-foreground" />
            Store Identity
          </CardTitle>
          <CardDescription>
            Basic information that appears on your public store.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="My Store"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="relative">
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    handleChange(
                      'slug',
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    )
                  }
                  placeholder="my-store"
                  className="pr-8"
                />
                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {form.slug && (
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-muted-foreground truncate">
                    {API_BASE}/commerce/store/{form.slug}/
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      copyUrl(`${API_BASE}/commerce/store/${form.slug}/`)
                    }
                    className="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={form.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="A short tagline for your store"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Tell customers about your store..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <div className="relative">
              <Input
                id="whatsapp_number"
                value={form.whatsapp_number}
                onChange={(e) =>
                  handleChange('whatsapp_number', e.target.value)
                }
                placeholder="+254700000000"
              />
              <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Customers can chat and order via WhatsApp.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-muted-foreground" />
            Branding
          </CardTitle>
          <CardDescription>
            Visual identity of your storefront — colors, logo, and banner.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="primary_color">Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primary_color"
                value={form.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="h-10 w-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={form.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                placeholder="#007fff"
                className="w-32"
                maxLength={7}
              />
              <div
                className="flex-1 h-10 rounded-lg"
                style={{ backgroundColor: form.primary_color }}
              />
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={form.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {form.logo_url && (
              <div className="mt-2 h-20 w-20 rounded-xl border border-border overflow-hidden bg-muted">
                <Image
                  src={form.logo_url}
                  alt="Logo preview"
                  className="h-full w-full object-cover"
                  width={80}
                  height={80}
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Banner URL */}
          <div className="space-y-2">
            <Label htmlFor="banner_url">Banner Image URL</Label>
            <Input
              id="banner_url"
              value={form.banner_url}
              onChange={(e) => handleChange('banner_url', e.target.value)}
              placeholder="https://example.com/banner.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x400px or wider. Displayed as the hero banner.
            </p>
            {form.banner_url && (
              <div className="mt-2 h-32 w-full rounded-xl border border-border overflow-hidden bg-muted">
                <Image
                  src={form.banner_url}
                  alt="Banner preview"
                  className="h-full w-full object-cover"
                  width={1200}
                  height={400}
                  unoptimized
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Social Links
          </CardTitle>
          <CardDescription>
            Add your social media links. They&apos;ll appear on your storefront.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: 'website_url',
              label: 'Website',
              placeholder: 'https://yourwebsite.com',
            },
            {
              key: 'facebook_url',
              label: 'Facebook',
              placeholder: 'https://facebook.com/yourpage',
            },
            {
              key: 'instagram_url',
              label: 'Instagram',
              placeholder: 'https://instagram.com/yourhandle',
            },
            {
              key: 'twitter_url',
              label: 'X (Twitter)',
              placeholder: 'https://x.com/yourhandle',
            },
            {
              key: 'tiktok_url',
              label: 'TikTok',
              placeholder: 'https://tiktok.com/@yourhandle',
            },
          ].map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
              </Label>
              <Input
                id={field.key}
                value={form[field.key as keyof typeof form] as string}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="shadow-lg">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
