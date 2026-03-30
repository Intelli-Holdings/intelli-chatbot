import type { MediumPost, MediumFeedResult } from "@/lib/medium-feed"

const CMS_API_URL = process.env.CMS_API_URL || "https://cms.intelliconcierge.com"

interface CMSPostItem {
  title: string
  link: string
  slug: string
  contentSnippet: string
  content: string
  thumbnail?: string
  pubDate?: string
  categories?: string[]
  author?: string
  readTime?: string
  guid?: string
  metaDescription?: string
}

interface CMSApiResponse {
  success: boolean
  items: CMSPostItem[]
  totalItems: number
  error?: string
}

/**
 * Fetches published blog posts from the Intelli CMS.
 * Uses the public JSON API at /api/blog/posts (no auth required).
 */
export async function fetchCMSPosts(): Promise<MediumFeedResult> {
  try {
    const response = await fetch(`${CMS_API_URL}/api/blog/posts`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`CMS API responded with ${response.status}`)
    }

    const data: CMSApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || "CMS returned unsuccessful response")
    }

    const items: MediumPost[] = data.items.map((item) => ({
      title: item.title,
      link: `${CMS_API_URL}/blog/${item.slug}`,
      contentSnippet: item.contentSnippet,
      content: item.content,
      thumbnail: item.thumbnail,
      pubDate: item.pubDate,
      categories: item.categories || [],
      author: item.author || "Intelli",
      readTime: item.readTime,
      guid: item.guid,
    }))

    return {
      success: true,
      items,
      totalItems: items.length,
    }
  } catch (error) {
    return {
      success: false,
      items: [],
      totalItems: 0,
      error: error instanceof Error ? error.message : "Failed to fetch CMS posts",
    }
  }
}
