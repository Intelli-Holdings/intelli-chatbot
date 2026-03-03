/**
 * Meta Graph API Service
 * Handles all interactions with Facebook/Meta Graph API for WhatsApp Business
 */

import { logger } from "@/lib/logger";

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = 'https://graph.facebook.com';

export interface PhoneNumberDetails {
  // Core identity fields
  id: string;
  display_phone_number?: string;
  phone_number?: string;
  
  // Name fields
  verified_name?: string;
  display_name?: string;
  name?: string;
  
  // Quality fields
  quality_rating?: string;
  quality_score?: string;
  
  // Tier and limit fields
  messaging_limit_tier?: string;
  tier?: string;
  current_limit?: number;
  max_daily_conversation_per_phone?: number;
  
  // Status fields
  code_verification_status?: string;
  verification_status?: string;
  name_status?: string;
  new_name_status?: string;
  certificate?: string;
  
  // Account fields
  account_mode?: string;
  is_official_business_account?: boolean;
  
  // Additional fields that might be present
  [key: string]: any;
}

export interface PhoneNumbersListResponse {
  data: PhoneNumberDetails[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
  };
}

/**
 * Comprehensive list of fields to request from Meta Graph API
 * These are known fields that may be available
 */
const COMPREHENSIVE_FIELDS = [
  // Identity
  'id',
  'display_phone_number',
  'phone_number',
  
  // Names
  'verified_name',
  'display_name',
  'name',
  
  // Quality
  'quality_rating',
  'quality_score',
  
  // Tier and Limits
  'messaging_limit_tier',
  'tier',
  'current_limit',
  'max_daily_conversation_per_phone',
  
  // Status
  'code_verification_status',
  'verification_status',
  'name_status',
  'new_name_status',
  'certificate',
  
  // Account
  'account_mode',
  'is_official_business_account',
  
  // Additional potentially useful fields
  'certificate_status',
  'display_name_status',
  'search_visibility',
  'eligibility_for_api_business_global_search'
].join(',');

/**
 * Fetch all phone numbers associated with a WhatsApp Business Account
 */
export async function fetchPhoneNumbers(
  wabaId: string, 
  accessToken: string
): Promise<PhoneNumberDetails[]> {
  try {
    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${wabaId}/phone_numbers?fields=${COMPREHENSIVE_FIELDS}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      throw new Error(`Failed to fetch phone numbers: ${errorMessage}`);
    }

    const data: PhoneNumbersListResponse = await response.json();
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Phone Numbers List Response', { data });
      if (data.data && data.data.length > 0) {
        logger.debug('Available fields in first phone number', { fields: Object.keys(data.data[0]) });
      }
    }
    
    return data.data || [];
  } catch (error) {
    logger.error('Error fetching phone numbers', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Fetch detailed information for a specific phone number
 * Implements fallback to fields=* if specific fields fail
 */
export async function fetchPhoneNumberDetails(
  phoneNumberId: string, 
  accessToken: string
): Promise<PhoneNumberDetails | null> {
  try {
    // First attempt: Try with comprehensive field list
    let url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${phoneNumberId}?fields=${COMPREHENSIVE_FIELDS}`;
    
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Fallback: If specific fields fail (400 error), use fields=* to get everything
    if (!response.ok && response.status === 400) {
      logger.warn('Specific fields request failed, falling back to fields=*');
      url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${phoneNumberId}?fields=*`;
      
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      
      // Provide more helpful error messages
      if (response.status === 401) {
        throw new Error('Invalid or expired access token');
      } else if (response.status === 403) {
        throw new Error('Insufficient permissions to access this phone number');
      } else if (response.status === 404) {
        throw new Error('Phone number not found');
      }
      
      throw new Error(`Failed to fetch phone number details: ${errorMessage}`);
    }

    const data: PhoneNumberDetails = await response.json();
    
    // Log available fields in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Phone Number Details Response', { data });
      logger.debug('Available fields', { fields: Object.keys(data) });
      logger.debug('Retrieved values', {
        id: data.id,
        display_name: data.display_name,
        verified_name: data.verified_name,
        quality_rating: data.quality_rating,
        messaging_limit_tier: data.messaging_limit_tier,
        code_verification_status: data.code_verification_status,
      });
    }
    
    return data;
  } catch (error) {
    logger.error('Error fetching phone number details', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Fetch WhatsApp Business Account details
 */
export async function fetchWABADetails(
  wabaId: string,
  accessToken: string
): Promise<any> {
  try {
    const fields = [
      'id',
      'name',
      'timezone_id',
      'message_template_namespace',
      'account_review_status',
      'business_verification_status',
      'currency',
      'on_behalf_of_business_info'
    ].join(',');

    const url = `${GRAPH_API_BASE}/${GRAPH_API_VERSION}/${wabaId}?fields=${fields}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to fetch WABA details');
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching WABA details', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Utility function to extract messaging limit from various possible formats
 */
export function extractMessagingLimit(data: PhoneNumberDetails): number {
  // Try different possible fields and formats
  if (typeof data.current_limit === 'number') {
    return data.current_limit;
  }
  
  if (typeof data.max_daily_conversation_per_phone === 'number') {
    return data.max_daily_conversation_per_phone;
  }
  
  // Default based on tier if available
  if (data.messaging_limit_tier) {
    const tierLimits: Record<string, number> = {
      'TIER_1K': 1000,
      'TIER_10K': 10000,
      'TIER_100K': 100000,
      'TIER_UNLIMITED': 1000000,
      'STANDARD': 250,
    };
    return tierLimits[data.messaging_limit_tier] || 250;
  }
  
  return 250; // Default limit
}

/**
 * Utility function to format quality rating for display
 */
export function formatQualityRating(rating?: string): string {
  if (!rating) return 'Unknown';
  
  const ratings: Record<string, string> = {
    'GREEN': '🟢 High',
    'YELLOW': '🟡 Medium',
    'RED': '🔴 Low',
    'UNKNOWN': '⚪ Unknown',
  };
  
  return ratings[rating.toUpperCase()] || rating;
}

/**
 * Utility function to format tier for display
 */
export function formatMessagingTier(tier?: string): string {
  if (!tier) return 'Standard';
  
  const tiers: Record<string, string> = {
    'TIER_1K': '1,000 / day',
    'TIER_10K': '10,000 / day',
    'TIER_100K': '100,000 / day',
    'TIER_UNLIMITED': 'Unlimited',
    'STANDARD': '250 / day',
  };
  
  return tiers[tier] || tier;
}