import { z } from "zod";

/** Schema for POST /api/whatsapp/messages */
export const whatsappMessageSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format"),
  template: z.object({
    name: z.string().min(1, "Template name is required"),
    language: z.object({
      code: z.string().min(1),
    }),
    components: z.array(z.record(z.unknown())).optional(),
  }),
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  accessToken: z.string().min(1, "Access token is required"),
});

/** Schema for POST /api/channels/create */
export const channelCreateSchema = z.object({
  choice: z.string().min(1, "Channel type is required"),
  data: z.record(z.unknown()),
  organization_id: z.string().min(1, "Organization ID is required"),
});

/** Schema for POST /api/chat */
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(10000, "Message too long"),
  conversationId: z.string().optional(),
  organizationId: z.string().optional(),
});

/** Schema for POST /api/contacts/import */
export const contactImportSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  contacts: z.array(
    z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      tags: z.array(z.string()).optional(),
    })
  ).min(1, "At least one contact is required"),
  mappingId: z.string().optional(),
});

/** Schema for POST /api/campaigns */
export const campaignCreateSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200),
  organizationId: z.string().min(1, "Organization ID is required"),
  templateName: z.string().optional(),
  recipients: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

/**
 * Helper to validate a request body against a Zod schema.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown):
  | { success: true; data: T }
  | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const messages = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  return { success: false, error: messages.join(", ") };
}
