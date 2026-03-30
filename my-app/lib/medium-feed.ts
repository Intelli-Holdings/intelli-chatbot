import Parser from "rss-parser"
import { extractImageFromContent, calculateReadTime, createContentSnippet } from "@/lib/blog-utils"
import { fetchCMSPosts } from "@/lib/cms-feed"

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
  source?: "medium" | "cms"
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
        source: "medium" as const,
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

/**
 * Fetches posts from both Medium RSS and the Intelli CMS,
 * merges them, deduplicates by title, and sorts by date descending.
 */
export async function fetchAllPosts(): Promise<MediumFeedResult> {
  const [mediumResult, cmsResult] = await Promise.allSettled([
    fetchMediumPosts(),
    fetchCMSPosts(),
  ])

  const mediumItems = mediumResult.status === "fulfilled" && mediumResult.value.success
    ? mediumResult.value.items
    : []

  const cmsItems = cmsResult.status === "fulfilled" && cmsResult.value.success
    ? cmsResult.value.items
    : []

  // Deduplicate within each source only (not across sources)
  const dedup = (items: MediumPost[]): MediumPost[] => {
    const seen = new Set<string>()
    return items.filter((item) => {
      const key = item.title.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const dedupedCms = dedup(cmsItems)
  const dedupedMedium = dedup(mediumItems)
  const merged = [...dedupedCms, ...dedupedMedium]

  // Sort by pubDate descending (newest first)
  merged.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return dateB - dateA
  })

  const feedInfo = mediumResult.status === "fulfilled" ? mediumResult.value.feedInfo : undefined

  return {
    success: mediumItems.length > 0 || cmsItems.length > 0,
    items: merged,
    totalItems: merged.length,
    feedInfo,
  }
}
