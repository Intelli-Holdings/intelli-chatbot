/**
 * Product Service
 * Handles Intelli-native product CRUD operations
 */

import { commerceFetch, COMMERCE_URL } from '@/lib/commerce-api';

export interface ProductData {
  id: string;
  organization_id: string;
  catalogue_id: string | null;
  name: string;
  description: string;
  sku: string;
  price: number;
  sale_price: number | null;
  currency: string;
  category: string;
  brand: string;
  availability: 'in_stock' | 'out_of_stock' | 'available_for_order';
  condition: 'new' | 'refurbished' | 'used';
  track_inventory: boolean;
  quantity: number;
  low_stock_threshold: number;
  url: string;
  meta_product_id: string;
  meta_synced_at: string | null;
  is_active: boolean;
  is_featured: boolean;
  slug: string;
  metadata: Record<string, unknown> | null;
  images: ProductImageData[];
  primary_image: string | null;
  is_on_sale: boolean;
  display_price: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImageData {
  id: string;
  image: string | null;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  currency?: string;
  category?: string;
  brand?: string;
  availability?: string;
  condition?: string;
  track_inventory?: boolean;
  quantity?: number;
  catalogue_id?: string | null;
  is_featured?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  sale_price?: number | null;
  currency?: string;
  category?: string;
  brand?: string;
  availability?: string;
  condition?: string;
  track_inventory?: boolean;
  quantity?: number;
  is_active?: boolean;
  is_featured?: boolean;
  catalogue_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ProductQueryFilters {
  is_active?: boolean;
  category?: string;
  availability?: string;
  catalogue_id?: string;
  search?: string;
  is_featured?: boolean;
  limit?: number;
  offset?: number;
}

export class ProductService {
  static async getProducts(
    organizationId: string,
    filters: ProductQueryFilters = {},
    token?: string | null
  ): Promise<{ products: ProductData[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.is_active !== undefined) params.set('is_active', String(filters.is_active));
    if (filters.category) params.set('category', filters.category);
    if (filters.availability) params.set('availability', filters.availability);
    if (filters.catalogue_id) params.set('catalogue_id', filters.catalogue_id);
    if (filters.search) params.set('search', filters.search);
    if (filters.is_featured !== undefined) params.set('is_featured', String(filters.is_featured));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.offset) params.set('offset', String(filters.offset));

    const url = `${COMMERCE_URL(organizationId)}/products/?${params.toString()}`;
    const response = await commerceFetch(url, {}, token);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return response.json();
  }

  static async getProduct(
    organizationId: string,
    productId: string,
    token?: string | null
  ): Promise<ProductData> {
    const response = await commerceFetch(
      `${COMMERCE_URL(organizationId)}/products/${productId}/`,
      {},
      token
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    return response.json();
  }

  static async createProduct(
    organizationId: string,
    data: CreateProductRequest,
    token?: string | null
  ): Promise<ProductData> {
    const response = await commerceFetch(
      `${COMMERCE_URL(organizationId)}/products/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create product');
    }
    return response.json();
  }

  static async updateProduct(
    organizationId: string,
    productId: string,
    data: UpdateProductRequest,
    token?: string | null
  ): Promise<ProductData> {
    const response = await commerceFetch(
      `${COMMERCE_URL(organizationId)}/products/${productId}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      token
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update product');
    }
    return response.json();
  }

  static async deleteProduct(
    organizationId: string,
    productId: string,
    token?: string | null
  ): Promise<void> {
    const response = await commerceFetch(
      `${COMMERCE_URL(organizationId)}/products/${productId}/`,
      { method: 'DELETE' },
      token
    );
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }

  // Image management
  static async uploadImage(
    organizationId: string,
    productId: string,
    file: File,
    isPrimary: boolean = false,
    altText: string = '',
    token?: string | null
  ): Promise<ProductImageData> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('is_primary', String(isPrimary));
    if (altText) formData.append('alt_text', altText);

    const response = await commerceFetch(
      `${COMMERCE_URL(organizationId)}/products/${productId}/images/`,
      {
        method: 'POST',
        body: formData,
      },
      token
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to upload image');
    }
    return response.json();
  }

  static async deleteImage(
    organizationId: string,
    productId: string,
    imageId: string,
    token?: string | null
  ): Promise<void> {
    const response = await commerceFetch(
      `${COMMERCE_URL(organizationId)}/products/${productId}/images/${imageId}/`,
      { method: 'DELETE' },
      token
    );
    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
  }
}
