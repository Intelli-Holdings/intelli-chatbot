import { z } from "zod";

/** Schema for sign-in form */
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type SignInFormData = z.infer<typeof signInSchema>;

/** Schema for forgot-password form */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/** Schema for add-contact dialog */
export const addContactSchema = z.object({
  fullname: z.string().optional(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number (e.g. +234XXXXXXXXXX)"),
  email: z.string().email("Invalid email address").or(z.literal("")),
  information_source: z.string().default("manual"),
});
export type AddContactFormData = z.infer<typeof addContactSchema>;

/** Schema for create-assistant dialog */
export const createAssistantSchema = z.object({
  name: z.string().min(1, "Assistant name is required").max(100, "Name must be under 100 characters"),
  prompt: z
    .string()
    .min(10, "Instructions must be at least 10 characters")
    .max(50000, "Instructions are too long"),
  organization_id: z.string().min(1, "Please select an organization"),
});
export type CreateAssistantFormData = z.infer<typeof createAssistantSchema>;

/** Schema for create-chatbot form */
export const createChatbotSchema = z.object({
  name: z.string().min(1, "Chatbot name is required").max(100, "Name must be under 100 characters"),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
  websiteUrl: z.string().url("Enter a valid URL").or(z.literal("")),
  customText: z.string().max(100000, "Text exceeds 100K character limit").optional(),
});
export type CreateChatbotFormData = z.infer<typeof createChatbotSchema>;
