/**
 * Creates a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug string
 */
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim() // Remove leading/trailing whitespace
}

/**
 * Formats a date string into a readable format
 * @param dateString - The date string to format
 * @param format - The format type ('short' | 'long')
 * @returns A formatted date string
 */
export function formatDate(dateString?: string, format: 'short' | 'long' = 'short'): string {
  if (!dateString) return ""
  
  try {
    const date = new Date(dateString)
    
    if (format === 'long') {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
    })
  } catch {
    return ""
  }
}

/**
 * Calculates estimated reading time for content
 * @param content - The HTML content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Formatted reading time string
 */
export function calculateReadTime(content: string, wordsPerMinute: number = 200): string {
  // Remove HTML tags and calculate word count
  const textContent = content.replace(/<[^>]*>/g, '')
  const wordCount = textContent.split(/\s+/).length
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  return `${readTime} min read`
}

/**
 * Creates a content snippet from HTML content
 * @param content - The HTML content to create a snippet from
 * @param maxLength - Maximum length of the snippet (default: 200)
 * @returns A plain text snippet
 */
export function createContentSnippet(content: string, maxLength: number = 200): string {
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, '')
  
  if (textContent.length <= maxLength) {
    return textContent
  }
  
  return textContent.substring(0, maxLength).trim() + '...'
}

/**
 * Extracts the first image URL from HTML content
 * @param content - The HTML content to search
 * @returns The first image URL found, or undefined
 */
export function extractImageFromContent(content: string): string | undefined {
  const imgMatch = content.match(/<img[^>]+src="([^"]+)"/)
  return imgMatch ? imgMatch[1] : undefined
}
