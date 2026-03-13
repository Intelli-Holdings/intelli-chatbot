import Parser from "rss-parser"
import { extractImageFromContent, calculateReadTime, createContentSnippet } from "@/lib/blog-utils"

export interface MediumPost {
  title: string
  link: string
  contentSnippet: string
  content: string
  thumbnail?: string
  pubDate?: string
  categories?: string[]
  author?: string
  readTime?: string
  guid?: string
}

export interface MediumFeedResult {
  success: boolean
  items: MediumPost[]
  totalItems: number
  feedInfo?: {
    title?: string
    description?: string
    link?: string
    image?: { url?: string; title?: string; link?: string }
    lastBuildDate?: string
  }
  error?: string
}

/**
 * Fetches and processes Medium RSS feed posts server-side.
 * Use this from server components and API routes.
 */
export async function fetchMediumPosts(): Promise<MediumFeedResult> {
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ["content:encoded", "contentEncoded"],
          ["dc:creator", "creator"],
        ],
      },
    })

    const feed = await parser.parseURL("https://medium.com/feed/@intelli") as any

    const processedItems: MediumPost[] = feed.items.map((item: any) => {
      const fullContent = item.contentEncoded || item.content || ""
      const thumbnail = extractImageFromContent(fullContent)
      const contentSnippet = item.contentSnippet || createContentSnippet(fullContent)

      return {
        title: item.title || "",
        link: item.link || "",
        contentSnippet,
        content: fullContent,
        thumbnail,
        pubDate: item.pubDate || item.isoDate,
        categories: item.categories || [],
        author: item.creator || item["dc:creator"] || "Intelli",
        readTime: calculateReadTime(fullContent),
        guid: item.guid,
      }
    })

    return {
      success: true,
      items: processedItems,
      totalItems: processedItems.length,
      feedInfo: {
        title: feed.title,
        description: feed.description,
        link: feed.link,
        image: feed.image,
        lastBuildDate: feed.lastBuildDate,
      },
    }
  } catch (error) {
    return {
      success: false,
      items: [],
      totalItems: 0,
      error: error instanceof Error ? error.message : "Failed to fetch Medium feed",
    }
  }
}
