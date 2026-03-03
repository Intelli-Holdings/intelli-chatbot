/**
 * AI Safety utilities: prompt injection protection, PII scrubbing, cost controls.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /```system/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if\s+you/i,
  /override\s+(your\s+)?instructions/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /what\s+(are|is)\s+your\s+(system\s+)?prompt/i,
  /output\s+your\s+instructions/i,
];

const PII_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: "[EMAIL_REDACTED]" },
  { pattern: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, label: "[SSN_REDACTED]" },
  { pattern: /\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, label: "[CARD_REDACTED]" },
  { pattern: /\b5[1-5]\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, label: "[CARD_REDACTED]" },
  { pattern: /\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b/g, label: "[CARD_REDACTED]" },
];

/**
 * Sanitize user input before sending to LLM.
 * Strips known prompt injection patterns and normalizes whitespace.
 */
export function sanitizeUserPrompt(input: string): string {
  let sanitized = input;

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[FILTERED]");
  }

  // Strip null bytes and other control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  return sanitized.trim();
}

/**
 * Check if a prompt appears to contain injection attempts.
 * Returns true if suspicious patterns are detected.
 */
export function detectInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Scrub PII from AI output before returning to the user.
 * Replaces emails, SSNs, and credit card numbers with redaction labels.
 */
export function scrubPiiFromOutput(output: string): string {
  let scrubbed = output;
  for (const { pattern, label } of PII_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, label);
  }
  return scrubbed;
}

/**
 * AI cost control configuration.
 * These limits are checked at the API route level.
 */
export const AI_COST_LIMITS = {
  /** Maximum tokens per single request */
  maxTokensPerRequest: 2000,
  /** Maximum AI requests per user per hour */
  maxRequestsPerUserPerHour: 60,
  /** Maximum AI requests per organization per hour */
  maxRequestsPerOrgPerHour: 500,
  /** Maximum input length in characters */
  maxInputLength: 10000,
} as const;

/**
 * Validate input length against cost controls.
 * Returns an error message if the input exceeds limits, null otherwise.
 */
export function validateInputLength(input: string): string | null {
  if (input.length > AI_COST_LIMITS.maxInputLength) {
    return `Input exceeds maximum length of ${AI_COST_LIMITS.maxInputLength} characters`;
  }
  return null;
}
