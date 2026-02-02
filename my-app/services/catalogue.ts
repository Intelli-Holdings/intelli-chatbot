/**
 * Catalogue Service
 * Handles Meta Graph API integration for WhatsApp Commerce catalogue operations
 * Follows the static class-based pattern from WhatsAppService
 */

import type { AppService } from './whatsapp';
import type {
  MetaCatalogue,
  MetaProduct,
  CommerceSettings,
  ProductQueryOptions,
  SingleProductMessage,
  MultiProductMessage,
  ProductMessageResponse,
  CataloguesResponse,
  ProductsResponse,
  COMMERCE_LIMITS,
} from '@/types/ecommerce';

const META_API_VERSION = process.env.NEXT_PUBLIC_META_API_VERSION || 'v23.0';

/**
 * Error response from Meta Graph API
 */
interface MetaApiError {
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    error_user_title?: string;
    error_user_msg?: string;
    fbtrace_id?: string;
  };
}

export class CatalogueService {
  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  /**
   * Extract detailed error message from Meta API response
   */
  static extractErrorMessage(error: MetaApiError | Error | unknown): string {
    if (!error) {
      return 'Unknown error occurred';
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && 'error' in error) {
      const apiError = error as MetaApiError;
      return (
        apiError.error?.error_user_msg ||
        apiError.error?.error_user_title ||
        apiError.error?.message ||
        'An API error occurred'
      );
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  }

  // ==========================================================================
  // CATALOGUE OPERATIONS
  // ==========================================================================

  /**
   * Get all catalogues connected to the WhatsApp Business Account
   */
  static async getCatalogues(appService: AppService): Promise<MetaCatalogue[]> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.whatsapp_business_account_id) {
        throw new Error('WhatsApp Business Account ID is required');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/product_catalogs?fields=id,name,product_count,vertical`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      const data: CataloguesResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching catalogues:', error);
      throw error;
    }
  }

  /**
   * Connect a catalogue to the WhatsApp Business Account
   */
  static async connectCatalogue(appService: AppService, catalogId: string): Promise<void> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.whatsapp_business_account_id) {
        throw new Error('WhatsApp Business Account ID is required');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/product_catalogs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ catalog_id: catalogId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }
    } catch (error) {
      console.error('Error connecting catalogue:', error);
      throw error;
    }
  }

  /**
   * Disconnect a catalogue from the WhatsApp Business Account
   */
  static async disconnectCatalogue(appService: AppService, catalogId: string): Promise<void> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.whatsapp_business_account_id) {
        throw new Error('WhatsApp Business Account ID is required');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.whatsapp_business_account_id}/product_catalogs?catalog_id=${catalogId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }
    } catch (error) {
      console.error('Error disconnecting catalogue:', error);
      throw error;
    }
  }

  // ==========================================================================
  // COMMERCE SETTINGS
  // ==========================================================================

  /**
   * Get commerce settings for a phone number
   */
  static async getCommerceSettings(appService: AppService): Promise<CommerceSettings> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.phone_number_id) {
        throw new Error('Phone number ID is required');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.phone_number_id}/whatsapp_commerce_settings`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      const data = await response.json();
      return {
        is_catalog_visible: data.is_catalog_visible ?? false,
        is_cart_enabled: data.is_cart_enabled ?? false,
        catalog_id: data.catalog_id,
      };
    } catch (error) {
      console.error('Error fetching commerce settings:', error);
      throw error;
    }
  }

  /**
   * Update commerce settings for a phone number
   */
  static async updateCommerceSettings(
    appService: AppService,
    settings: Partial<CommerceSettings>
  ): Promise<void> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.phone_number_id) {
        throw new Error('Phone number ID is required');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.phone_number_id}/whatsapp_commerce_settings`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }
    } catch (error) {
      console.error('Error updating commerce settings:', error);
      throw error;
    }
  }

  // ==========================================================================
  // PRODUCT OPERATIONS
  // ==========================================================================

  /**
   * Get products from a catalogue
   */
  static async getProducts(
    appService: AppService,
    catalogId: string,
    options: ProductQueryOptions = {}
  ): Promise<{ products: MetaProduct[]; paging?: { after?: string } }> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const fields =
        options.fields?.join(',') ||
        'id,retailer_id,name,description,price,currency,availability,image_url,url,brand,category';

      const params = new URLSearchParams({
        fields,
        limit: String(options.limit || 25),
      });

      if (options.after) {
        params.set('after', options.after);
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${catalogId}/products?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      const data: ProductsResponse = await response.json();
      return {
        products: data.data || [],
        paging: data.paging?.cursors ? { after: data.paging.cursors.after } : undefined,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Search products in a catalogue
   */
  static async searchProducts(
    appService: AppService,
    catalogId: string,
    query: string,
    limit: number = 25
  ): Promise<MetaProduct[]> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const params = new URLSearchParams({
        fields: 'id,retailer_id,name,description,price,currency,availability,image_url',
        filter: JSON.stringify({ name: { contains: query } }),
        limit: String(limit),
      });

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${catalogId}/products?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      const data: ProductsResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by retailer ID (SKU)
   */
  static async getProductByRetailerId(
    appService: AppService,
    catalogId: string,
    retailerId: string
  ): Promise<MetaProduct | null> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const params = new URLSearchParams({
        fields: 'id,retailer_id,name,description,price,currency,availability,image_url,url,brand,category',
        filter: JSON.stringify({ retailer_id: { eq: retailerId } }),
        limit: '1',
      });

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${catalogId}/products?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      const data: ProductsResponse = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching product by retailer ID:', error);
      throw error;
    }
  }

  // ==========================================================================
  // PRODUCT MESSAGES
  // ==========================================================================

  /**
   * Send a single product message
   */
  static async sendSingleProductMessage(
    appService: AppService,
    to: string,
    data: SingleProductMessage
  ): Promise<ProductMessageResponse> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.phone_number_id) {
        throw new Error('Phone number ID is required');
      }

      const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'product',
          body: data.body_text ? { text: data.body_text } : undefined,
          footer: data.footer_text ? { text: data.footer_text } : undefined,
          action: {
            catalog_id: data.catalog_id,
            product_retailer_id: data.product_retailer_id,
          },
        },
      };

      // Clean up undefined fields
      if (!messagePayload.interactive.body) {
        delete (messagePayload.interactive as Record<string, unknown>).body;
      }
      if (!messagePayload.interactive.footer) {
        delete (messagePayload.interactive as Record<string, unknown>).footer;
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending single product message:', error);
      throw error;
    }
  }

  /**
   * Send a multi-product message (max 30 products)
   */
  static async sendMultiProductMessage(
    appService: AppService,
    to: string,
    data: MultiProductMessage
  ): Promise<ProductMessageResponse> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      if (!appService.phone_number_id) {
        throw new Error('Phone number ID is required');
      }

      // Validate sections
      const totalProducts = data.sections.reduce(
        (sum, section) => sum + section.product_items.length,
        0
      );

      if (totalProducts > 30) {
        throw new Error('Multi-product messages can have a maximum of 30 products');
      }

      if (data.sections.length > 10) {
        throw new Error('Multi-product messages can have a maximum of 10 sections');
      }

      const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'product_list',
          header: {
            type: 'text',
            text: data.header_text,
          },
          body: {
            text: data.body_text,
          },
          footer: data.footer_text ? { text: data.footer_text } : undefined,
          action: {
            catalog_id: data.catalog_id,
            sections: data.sections,
          },
        },
      };

      // Clean up undefined fields
      if (!messagePayload.interactive.footer) {
        delete (messagePayload.interactive as Record<string, unknown>).footer;
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${appService.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messagePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending multi-product message:', error);
      throw error;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Check if a catalogue is connected to the WABA
   */
  static async isCatalogueConnected(
    appService: AppService,
    catalogId: string
  ): Promise<boolean> {
    try {
      const catalogues = await this.getCatalogues(appService);
      return catalogues.some((cat) => cat.id === catalogId);
    } catch (error) {
      console.error('Error checking catalogue connection:', error);
      return false;
    }
  }

  /**
   * Get catalogue details by ID
   */
  static async getCatalogueById(
    appService: AppService,
    catalogId: string
  ): Promise<MetaCatalogue | null> {
    try {
      if (!appService.access_token) {
        throw new Error('Access token is required for Meta Graph API calls');
      }

      const response = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${catalogId}?fields=id,name,product_count,vertical`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${appService.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Return null for 404, throw for other errors
        if (response.status === 404) {
          return null;
        }
        throw new Error(this.extractErrorMessage(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching catalogue by ID:', error);
      throw error;
    }
  }

  /**
   * Get product count for a catalogue
   */
  static async getProductCount(appService: AppService, catalogId: string): Promise<number> {
    try {
      const catalogue = await this.getCatalogueById(appService, catalogId);
      return catalogue?.product_count || 0;
    } catch (error) {
      console.error('Error fetching product count:', error);
      return 0;
    }
  }
}

export default CatalogueService;
