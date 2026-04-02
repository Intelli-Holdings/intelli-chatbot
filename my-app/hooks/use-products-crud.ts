import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ProductService } from '@/services/product';
import type { ProductData, CreateProductRequest, UpdateProductRequest, ProductQueryFilters, ProductImageData } from '@/services/product';
import useActiveOrganizationId from './use-organization-id';

// Products list hook
export interface UseProductsReturn {
  products: ProductData[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filters: ProductQueryFilters;
  setFilters: (filters: ProductQueryFilters) => void;
  createProduct: (data: CreateProductRequest) => Promise<ProductData>;
  updateProduct: (productId: string, data: UpdateProductRequest) => Promise<ProductData>;
  deleteProduct: (productId: string) => Promise<void>;
  saving: boolean;
}

export const useProductsCrud = (initialFilters: ProductQueryFilters = {}): UseProductsReturn => {
  const organizationId = useActiveOrganizationId();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductQueryFilters>(initialFilters);

  const fetchProducts = useCallback(async () => {
    if (!organizationId || !isLoaded || !isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await ProductService.getProducts(organizationId, filters, token);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters, getToken, isLoaded, isSignedIn]);

  const createProduct = useCallback(async (data: CreateProductRequest): Promise<ProductData> => {
    if (!organizationId) throw new Error('Organization ID not available');
    setSaving(true);
    try {
      const token = await getToken();
      const product = await ProductService.createProduct(organizationId, data, token);
      setProducts((prev) => [product, ...prev]);
      setTotal((prev) => prev + 1);
      return product;
    } finally {
      setSaving(false);
    }
  }, [organizationId, getToken]);

  const updateProduct = useCallback(async (productId: string, data: UpdateProductRequest): Promise<ProductData> => {
    if (!organizationId) throw new Error('Organization ID not available');
    setSaving(true);
    try {
      const token = await getToken();
      const updated = await ProductService.updateProduct(organizationId, productId, data, token);
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      return updated;
    } finally {
      setSaving(false);
    }
  }, [organizationId, getToken]);

  const deleteProduct = useCallback(async (productId: string): Promise<void> => {
    if (!organizationId) throw new Error('Organization ID not available');
    setSaving(true);
    try {
      const token = await getToken();
      await ProductService.deleteProduct(organizationId, productId, token);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setTotal((prev) => prev - 1);
    } finally {
      setSaving(false);
    }
  }, [organizationId, getToken]);

  useEffect(() => {
    if (organizationId && isLoaded && isSignedIn) fetchProducts();
  }, [organizationId, isLoaded, isSignedIn, fetchProducts]);

  return {
    products, total, loading, error, refetch: fetchProducts,
    filters, setFilters, createProduct, updateProduct, deleteProduct, saving,
  };
};

// Single product hook
export interface UseProductReturn {
  product: ProductData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProduct: (data: UpdateProductRequest) => Promise<ProductData>;
  uploadImage: (file: File, isPrimary?: boolean, altText?: string) => Promise<ProductImageData>;
  deleteImage: (imageId: string) => Promise<void>;
  saving: boolean;
}

export const useProduct = (productId: string | null): UseProductReturn => {
  const organizationId = useActiveOrganizationId();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!organizationId || !productId || !isLoaded || !isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await ProductService.getProduct(organizationId, productId, token);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [organizationId, productId, getToken, isLoaded, isSignedIn]);

  const updateProduct = useCallback(async (data: UpdateProductRequest): Promise<ProductData> => {
    if (!organizationId || !productId) throw new Error('Not available');
    setSaving(true);
    try {
      const token = await getToken();
      const updated = await ProductService.updateProduct(organizationId, productId, data, token);
      setProduct(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, [organizationId, productId, getToken]);

  const uploadImage = useCallback(async (file: File, isPrimary = false, altText = ''): Promise<ProductImageData> => {
    if (!organizationId || !productId) throw new Error('Not available');
    setSaving(true);
    try {
      const token = await getToken();
      const image = await ProductService.uploadImage(organizationId, productId, file, isPrimary, altText, token);
      setProduct((prev) => prev ? { ...prev, images: [...prev.images, image] } : prev);
      return image;
    } finally {
      setSaving(false);
    }
  }, [organizationId, productId, getToken]);

  const deleteImage = useCallback(async (imageId: string): Promise<void> => {
    if (!organizationId || !productId) throw new Error('Not available');
    setSaving(true);
    try {
      const token = await getToken();
      await ProductService.deleteImage(organizationId, productId, imageId, token);
      setProduct((prev) => prev ? { ...prev, images: prev.images.filter((i) => i.id !== imageId) } : prev);
    } finally {
      setSaving(false);
    }
  }, [organizationId, productId, getToken]);

  useEffect(() => {
    if (organizationId && productId && isLoaded && isSignedIn) fetchProduct();
  }, [organizationId, productId, isLoaded, isSignedIn, fetchProduct]);

  return {
    product, loading, error, refetch: fetchProduct,
    updateProduct, uploadImage, deleteImage, saving,
  };
};
