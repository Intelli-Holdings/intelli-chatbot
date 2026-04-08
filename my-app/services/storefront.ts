import { commerceFetch, API_BASE, COMMERCE_URL } from '@/lib/commerce-api';

export interface StorefrontData {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
  banner_url: string;
  whatsapp_number: string;
  primary_color: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  tiktok_url: string;
  website_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateStorefrontRequest {
  slug?: string;
  name?: string;
  tagline?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  whatsapp_number?: string;
  primary_color?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  website_url?: string;
  is_active?: boolean;
}

export class StorefrontService {
  static async getStorefront(orgId: string): Promise<StorefrontData> {
    const resp = await commerceFetch(`${COMMERCE_URL(orgId)}/storefront/`);
    if (!resp.ok) throw new Error('Failed to fetch storefront');
    return resp.json();
  }

  static async updateStorefront(orgId: string, data: UpdateStorefrontRequest): Promise<StorefrontData> {
    const resp = await commerceFetch(`${COMMERCE_URL(orgId)}/storefront/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error('Failed to update storefront');
    return resp.json();
  }

  // Public storefront (no auth needed)
  static async getPublicStore(slug: string): Promise<{ store: StorefrontData; products: unknown[]; total: number }> {
    const resp = await commerceFetch(`${API_BASE}/commerce/store/${slug}/`);
    if (!resp.ok) throw new Error('Store not found');
    return resp.json();
  }

  static async getPublicProduct(slug: string, productSlug: string): Promise<{ store: StorefrontData; product: unknown }> {
    const resp = await commerceFetch(`${API_BASE}/commerce/store/${slug}/product/${productSlug}/`);
    if (!resp.ok) throw new Error('Product not found');
    return resp.json();
  }
}
