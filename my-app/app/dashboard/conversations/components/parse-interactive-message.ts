export interface ParsedInteractiveMessage {
  body: string;
  options: string[];
}

export interface ParsedCtaButton {
  label: string;
  url: string;
}

export interface ParsedCtaMessage {
  body: string;
  buttons: ParsedCtaButton[];
}

/**
 * Detects and parses the [Options: ...] pattern from flow messages.
 * Backend format: "{body_text}\n[Options: {opt1}, {opt2}, ...]"
 *
 * @returns ParsedInteractiveMessage if pattern matches, null otherwise
 */
export function parseInteractiveMessage(text: string): ParsedInteractiveMessage | null {
  const match = text.match(/^([\s\S]+?)\n\[Options:\s*(.+)\]$/);
  if (!match) return null;

  const body = match[1].trim();
  const optionsStr = match[2].trim();
  const options = optionsStr.split(',').map(opt => opt.trim()).filter(Boolean);

  if (options.length === 0) return null;

  return { body, options };
}

/**
 * Detects and parses CTA button patterns from template messages.
 * Backend format: "{body_text}\n[CTA Button: {label} → {url}]"
 * Can have multiple CTA buttons.
 *
 * @returns ParsedCtaMessage if pattern matches, null otherwise
 */
export function parseCtaMessage(text: string): ParsedCtaMessage | null {
  // Match [CTA Button: label → url] with any arrow variant (→, ->, ➝, ⟶, ►)
  const ctaPattern = /\[CTA Button:\s*(.+?)\s*(?:→|->|➝|⟶|►)\s*(https?:\/\/[^\]\s]+)\]/g;
  const buttons: ParsedCtaButton[] = [];
  let match;

  while ((match = ctaPattern.exec(text)) !== null) {
    buttons.push({ label: match[1].trim(), url: match[2].trim() });
  }

  if (buttons.length === 0) return null;

  // Body is everything before the first [CTA Button: ...] block
  const firstCtaIndex = text.indexOf('[CTA Button:');
  const body = text.substring(0, firstCtaIndex).trim();

  return { body, buttons };
}

/**
 * Detects the [Template: template_name] pattern from flow template messages.
 * Backend format: "[Template: {template_name}]"
 *
 * @returns formatted template name if pattern matches, null otherwise
 */
export function parseTemplateMessage(text: string): string | null {
  const match = text.trim().match(/^\[Template:\s*(.+)\]$/);
  if (!match) return null;
  // Convert snake_case to Title Case: "hello_world" → "Hello World"
  return match[1].trim().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
