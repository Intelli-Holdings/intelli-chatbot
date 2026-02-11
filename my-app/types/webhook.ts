// ========================================
// Webhook Types for IntelliHoldings Backend
// ========================================

// HTTP methods for webhook destinations
export type WebhookMethod = 'POST' | 'GET' | 'PUT' | 'PATCH';

// Action types for inbound webhooks
export type InboundWebhookActionType = 'start_flow' | 'send_template';

// Log status for inbound webhook logs
export type InboundWebhookLogStatus =
  | 'success'
  | 'failed'
  | 'validation_error'
  | 'contact_not_found';

// ========================================
// Outbound Webhook (Webhook Destination)
// ========================================

export interface WebhookDestination {
  id: string;
  organization: string;
  organization_name?: string;
  name: string;
  url: string;
  method: WebhookMethod;
  headers: Record<string, string>;
  signing_secret: string;
  is_active: boolean;
  last_used_at: string | null;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDestinationListItem {
  id: string;
  name: string;
  url: string;
  method: WebhookMethod;
  is_active: boolean;
  last_used_at: string | null;
  success_count: number;
  failure_count: number;
}

export interface CreateWebhookDestinationRequest {
  organization: string;
  name: string;
  url: string;
  method?: WebhookMethod;
  headers?: Record<string, string>;
  signing_secret?: string;
  is_active?: boolean;
}

export interface UpdateWebhookDestinationRequest {
  name?: string;
  url?: string;
  method?: WebhookMethod;
  headers?: Record<string, string>;
  signing_secret?: string;
  is_active?: boolean;
}

export interface WebhookTestResult {
  success: boolean;
  status_code?: number;
  response_time_ms?: number;
  response_body?: string;
  error?: string;
  attempt?: number;
}

// ========================================
// Inbound Webhook
// ========================================

export interface InboundWebhook {
  id: string;
  organization: string;
  organization_name?: string;
  name: string;
  slug: string;
  webhook_url: string;
  action_type: InboundWebhookActionType;

  // Flow configuration (for start_flow action)
  flow: string | null;
  flow_name?: string | null;
  flow_variable_mapping: Record<string, string>;

  // Template configuration (for send_template action)
  template_id: string;
  template_name: string;
  template_variable_mapping: Record<string, string>;

  // WhatsApp configuration
  app_service: number | null;
  app_service_phone?: string | null;

  // Contact matching
  contact_match_field: string;
  create_contact_if_missing: boolean;

  // Security
  api_key: string;
  require_auth: boolean;

  // Status & stats
  is_active: boolean;
  trigger_count: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InboundWebhookListItem {
  id: string;
  name: string;
  slug: string;
  webhook_url: string;
  action_type: InboundWebhookActionType;
  flow: string | null;
  flow_name?: string | null;
  template_name: string;
  is_active: boolean;
  trigger_count: number;
  last_triggered_at: string | null;
}

export interface CreateInboundWebhookRequest {
  organization: string;
  name: string;
  action_type: InboundWebhookActionType;

  // Flow config (required for start_flow)
  flow?: string;
  flow_variable_mapping?: Record<string, string>;

  // Template config (required for send_template)
  template_id?: string;
  template_name?: string;
  template_variable_mapping?: Record<string, string>;

  // WhatsApp config
  app_service?: number;

  // Contact matching
  contact_match_field?: string;
  create_contact_if_missing?: boolean;

  // Security
  require_auth?: boolean;
  is_active?: boolean;
}

export interface UpdateInboundWebhookRequest {
  name?: string;
  action_type?: InboundWebhookActionType;
  flow?: string | null;
  flow_variable_mapping?: Record<string, string>;
  template_id?: string;
  template_name?: string;
  template_variable_mapping?: Record<string, string>;
  app_service?: number | null;
  contact_match_field?: string;
  create_contact_if_missing?: boolean;
  require_auth?: boolean;
  is_active?: boolean;
}

// ========================================
// Inbound Webhook Log
// ========================================

export interface InboundWebhookLog {
  id: string;
  webhook: string;
  received_at: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  ip_address: string;
  status: InboundWebhookLogStatus;
  error_message: string;
  processing_time_ms: number;
  flow_execution: string | null;
  execution_status?: string | null;
  contact: string | null;
  contact_phone?: string | null;
  contact_name?: string | null;
}

export interface InboundWebhookLogListItem {
  id: string;
  received_at: string;
  status: InboundWebhookLogStatus;
  error_message: string;
  processing_time_ms: number;
  ip_address: string;
}

// ========================================
// Webhook Test Requests
// ========================================

export interface TestWebhookDestinationRequest {
  test_payload?: Record<string, unknown>;
}

export interface TestInboundWebhookRequest {
  payload: Record<string, unknown>;
}

export interface TestInboundWebhookResult {
  success: boolean;
  status?: string;
  message?: string;
  error?: string;
  contact?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  contact_id?: string;
  processing_time_ms?: number;
  flow_id?: string;
  initial_variables?: Record<string, unknown>;
  template_id?: string;
  template_variables?: string[];
}

// ========================================
// Webhook Node Configuration (Flow Builder)
// ========================================

export interface WebhookNodePayloadConfig {
  // Contact fields to include
  contact_fields?: string[];

  // Whether to include tags
  include_tags?: boolean;

  // Custom fields to include
  custom_fields?: string[];

  // Flow variables to include
  flow_variables?: string[];

  // Include metadata (flow_id, execution_id, etc.)
  include_metadata?: boolean;
}

export interface WebhookNodeData {
  type: 'webhook';
  label: string;
  destinationId: string | null;
  eventType: string;
  payloadConfig: WebhookNodePayloadConfig;
}

// ========================================
// API Response Types
// ========================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ========================================
// Constants
// ========================================

export const WEBHOOK_METHODS: { value: WebhookMethod; label: string }[] = [
  { value: 'POST', label: 'POST' },
  { value: 'GET', label: 'GET' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
];

export const INBOUND_WEBHOOK_ACTION_TYPES: { value: InboundWebhookActionType; label: string; description: string }[] = [
  {
    value: 'start_flow',
    label: 'Start Chatbot Flow',
    description: 'Trigger a chatbot flow for the contact'
  },
  {
    value: 'send_template',
    label: 'Send Template Message',
    description: 'Send a WhatsApp template message to the contact'
  },
];

export const CONTACT_MATCH_FIELDS: { value: string; label: string }[] = [
  { value: 'phone_number', label: 'Phone Number' },
  { value: 'email', label: 'Email Address' },
  { value: 'customer.phone', label: 'Customer Phone (nested)' },
  { value: 'contact.phone', label: 'Contact Phone (nested)' },
];

export const WEBHOOK_LOG_STATUS_LABELS: Record<InboundWebhookLogStatus, string> = {
  success: 'Success',
  failed: 'Failed',
  validation_error: 'Validation Error',
  contact_not_found: 'Contact Not Found',
};

export const WEBHOOK_LOG_STATUS_COLORS: Record<InboundWebhookLogStatus, string> = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  validation_error: 'bg-yellow-100 text-yellow-800',
  contact_not_found: 'bg-orange-100 text-orange-800',
};
