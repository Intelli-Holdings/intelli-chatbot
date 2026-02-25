import sanitize from "sanitize-html";

const richHtmlOptions: sanitize.IOptions = {
  allowedTags: sanitize.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "span",
    "figure",
    "figcaption",
    "video",
    "audio",
    "source",
    "details",
    "summary",
  ]),
  allowedAttributes: {
    ...sanitize.defaults.allowedAttributes,
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
    a: ["href", "name", "target", "rel"],
    span: ["style", "class"],
    div: ["style", "class"],
    p: ["style", "class"],
    video: ["src", "controls", "width", "height"],
    audio: ["src", "controls"],
    source: ["src", "type"],
  },
};

/**
 * Sanitize HTML to prevent XSS attacks.
 * Use this for any user-generated HTML or markdown-rendered content
 * before passing to dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, richHtmlOptions);
}

/**
 * Strip all HTML tags from a string, returning plain text.
 * Use this for form inputs where HTML is never expected.
 */
export function stripHtml(input: string): string {
  return sanitize(input, { allowedTags: [], allowedAttributes: {} });
}

/**
 * Sanitize all string values in a form data object.
 * Strips HTML tags from every string field recursively.
 * Call this before submitting form data to API routes.
 */
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = stripHtml(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? stripHtml(item)
          : typeof item === "object" && item !== null
            ? sanitizeFormData(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeFormData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
