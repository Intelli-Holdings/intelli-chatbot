import { useState, useEffect, useCallback } from 'react';
import { CatalogueService } from '@/services/catalogue';
import type { AppService } from '@/services/whatsapp';
import type {
  MetaCatalogue,
  MetaProduct,
  CommerceSettings,
  ProductQueryOptions,
} from '@/types/ecommerce';
import useActiveOrganizationId from './use-organization-id';

// =============================================================================
// CATALOGUES HOOK
// =============================================================================

export interface UseCataloguesReturn {
  catalogues: MetaCatalogue[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectedCatalogue: MetaCatalogue | null;
  setSelectedCatalogue: (catalogue: MetaCatalogue | null) => void;
}

/**
 * Hook to manage WhatsApp Commerce catalogues
 */
export const useCatalogues = (appService: AppService | null): UseCataloguesReturn => {
  const [catalogues, setCatalogues] = useState<MetaCatalogue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatalogue, setSelectedCatalogue] = useState<MetaCatalogue | null>(null);

  const fetchCatalogues = useCallback(async () => {
    if (!appService) {
      setError('No app service selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await CatalogueService.getCatalogues(appService);
      setCatalogues(data);

      // Auto-select first catalogue if available and none selected
      if (data.length > 0 && !selectedCatalogue) {
        setSelectedCatalogue(data[0]);
      } else if (data.length === 0) {
        setError('No catalogues found. Please connect a catalogue in Meta Commerce Manager.');
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch catalogues';

      if (err instanceof Error) {
        if (err.message.includes('Access token')) {
          errorMessage = 'Invalid access token. Please reconnect your WhatsApp account.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error('Error fetching catalogues:', err);
    } finally {
      setLoading(false);
    }
  }, [appService, selectedCatalogue]);

  useEffect(() => {
    if (appService) {
      fetchCatalogues();
    }
  }, [appService?.id]);

  return {
    catalogues,
    loading,
    error,
    refetch: fetchCatalogues,
    selectedCatalogue,
    setSelectedCatalogue,
  };
};

// =============================================================================
// PRODUCTS HOOK
// =============================================================================

export interface UseProductsReturn {
  products: MetaProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  search: (query: string) => Promise<void>;
  searchQuery: string;
  clearSearch: () => void;
}

/**
 * Hook to manage products from a catalogue
 */
export const useProducts = (
  appService: AppService | null,
  catalogId: string | null,
  options: ProductQueryOptions = {}
): UseProductsReturn => {
  const [products, setProducts] = useState<MetaProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = useCallback(
    async (append: boolean = false) => {
      if (!appService || !catalogId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await CatalogueService.getProducts(appService, catalogId, {
          ...options,
          after: append ? cursor : undefined,
        });

        if (append) {
          setProducts((prev) => [...prev, ...result.products]);
        } else {
          setProducts(result.products);
        }

        setCursor(result.paging?.after);
        setHasMore(!!result.paging?.after);
      } catch (err) {
        let errorMessage = 'Failed to fetch products';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    },
    [appService, catalogId, cursor, options]
  );

  const search = useCallback(
    async (query: string) => {
      if (!appService || !catalogId) {
        return;
      }

      setSearchQuery(query);

      if (!query.trim()) {
        // Clear search and reload all products
        fetchProducts(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await CatalogueService.searchProducts(appService, catalogId, query);
        setProducts(results);
        setHasMore(false);
        setCursor(undefined);
      } catch (err) {
        let errorMessage = 'Failed to search products';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Error searching products:', err);
      } finally {
        setLoading(false);
      }
    },
    [appService, catalogId, fetchProducts]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    fetchProducts(false);
  }, [fetchProducts]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading && !searchQuery) {
      await fetchProducts(true);
    }
  }, [hasMore, loading, searchQuery, fetchProducts]);

  useEffect(() => {
    if (appService && catalogId) {
      setProducts([]);
      setCursor(undefined);
      setSearchQuery('');
      fetchProducts(false);
    }
  }, [appService?.id, catalogId]);

  return {
    products,
    loading,
    error,
    refetch: () => fetchProducts(false),
    loadMore,
    hasMore,
    search,
    searchQuery,
    clearSearch,
  };
};

// =============================================================================
// COMMERCE SETTINGS HOOK
// =============================================================================

export interface UseCommerceSettingsReturn {
  settings: CommerceSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSettings: (settings: Partial<CommerceSettings>) => Promise<void>;
  updating: boolean;
}

/**
 * Hook to manage WhatsApp Commerce settings
 */
export const useCommerceSettings = (
  appService: AppService | null
): UseCommerceSettingsReturn => {
  const [settings, setSettings] = useState<CommerceSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!appService) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await CatalogueService.getCommerceSettings(appService);
      setSettings(data);
    } catch (err) {
      let errorMessage = 'Failed to fetch commerce settings';

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Error fetching commerce settings:', err);
    } finally {
      setLoading(false);
    }
  }, [appService]);

  const updateSettings = useCallback(
    async (newSettings: Partial<CommerceSettings>) => {
      if (!appService) {
        return;
      }

      setUpdating(true);
      setError(null);

      try {
        await CatalogueService.updateCommerceSettings(appService, newSettings);
        // Refetch to get updated settings
        await fetchSettings();
      } catch (err) {
        let errorMessage = 'Failed to update commerce settings';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Error updating commerce settings:', err);
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [appService, fetchSettings]
  );

  useEffect(() => {
    if (appService) {
      fetchSettings();
    }
  }, [appService?.id]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
    updating,
  };
};

// =============================================================================
// CATALOGUE CONNECTION HOOK
// =============================================================================

export interface UseCatalogueConnectionReturn {
  connect: (catalogId: string) => Promise<void>;
  disconnect: (catalogId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage catalogue connections
 */
export const useCatalogueConnection = (
  appService: AppService | null,
  onSuccess?: () => void
): UseCatalogueConnectionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(
    async (catalogId: string) => {
      if (!appService) {
        setError('No app service selected');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await CatalogueService.connectCatalogue(appService, catalogId);
        onSuccess?.();
      } catch (err) {
        let errorMessage = 'Failed to connect catalogue';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Error connecting catalogue:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [appService, onSuccess]
  );

  const disconnect = useCallback(
    async (catalogId: string) => {
      if (!appService) {
        setError('No app service selected');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await CatalogueService.disconnectCatalogue(appService, catalogId);
        onSuccess?.();
      } catch (err) {
        let errorMessage = 'Failed to disconnect catalogue';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Error disconnecting catalogue:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [appService, onSuccess]
  );

  return {
    connect,
    disconnect,
    loading,
    error,
  };
};

// =============================================================================
// PRODUCT MESSAGES HOOK
// =============================================================================

export interface UseProductMessagesReturn {
  sendSingleProduct: (
    to: string,
    catalogId: string,
    productRetailerId: string,
    bodyText?: string,
    footerText?: string
  ) => Promise<void>;
  sendMultipleProducts: (
    to: string,
    catalogId: string,
    headerText: string,
    bodyText: string,
    sections: Array<{ title: string; product_items: Array<{ product_retailer_id: string }> }>,
    footerText?: string
  ) => Promise<void>;
  sending: boolean;
  error: string | null;
  lastMessageId: string | null;
}

/**
 * Hook to send product messages
 */
export const useProductMessages = (appService: AppService | null): UseProductMessagesReturn => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  const sendSingleProduct = useCallback(
    async (
      to: string,
      catalogId: string,
      productRetailerId: string,
      bodyText?: string,
      footerText?: string
    ) => {
      if (!appService) {
        setError('No app service selected');
        return;
      }

      setSending(true);
      setError(null);

      try {
        const response = await CatalogueService.sendSingleProductMessage(appService, to, {
          catalog_id: catalogId,
          product_retailer_id: productRetailerId,
          body_text: bodyText,
          footer_text: footerText,
        });

        setLastMessageId(response.messages?.[0]?.id || null);
      } catch (err) {
        let errorMessage = 'Failed to send product message';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Error sending single product message:', err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [appService]
  );

  const sendMultipleProducts = useCallback(
    async (
      to: string,
      catalogId: string,
      headerText: string,
      bodyText: string,
      sections: Array<{ title: string; product_items: Array<{ product_retailer_id: string }> }>,
      footerText?: string
    ) => {
      if (!appService) {
        setError('No app service selected');
        return;
      }

      setSending(true);
      setError(null);

      try {
        const response = await CatalogueService.sendMultiProductMessage(appService, to, {
          catalog_id: catalogId,
          header_text: headerText,
          body_text: bodyText,
          sections,
          footer_text: footerText,
        });

        setLastMessageId(response.messages?.[0]?.id || null);
      } catch (err) {
        let errorMessage = 'Failed to send multi-product message';

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        console.error('Error sending multi-product message:', err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [appService]
  );

  return {
    sendSingleProduct,
    sendMultipleProducts,
    sending,
    error,
    lastMessageId,
  };
};

export default useCatalogues;
