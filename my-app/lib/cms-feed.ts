import type { MediumPost, MediumFeedResult } from "@/lib/medium-feed"

const CMS_API_URL = process.env.CMS_API_URL ?? ""

/**
 * Fetches published blog posts from the Intelli CMS API.
 * Returns data in the same MediumPost shape so the blog UI works unchanged.
 */
export async function fetchCmsPosts(): Promise<MediumFeedResult> {
  if (!CMS_API_URL) {
    return { success: false, items: [], totalItems: 0, error: "CMS_API_URL not configured" }
  }

  try {
    const res = await fetch(`${CMS_API_URL}/api/blog/posts`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`CMS API responded with ${res.status}`)
    }

    const data = await res.json()

    if (!data.success) {
      throw new Error(data.error || "CMS API error")
    }

    // Map CMS response to MediumPost interface — the CMS API already returns
    // this shape, but we ensure the link field points to our blog page
    const items: MediumPost[] = (data.items ?? []).map((item: any) => ({
      title: item.title,
      link: "#", // no external link for CMS posts
      slug: item.slug, // CMS posts carry their own slug
      contentSnippet: item.contentSnippet,
      content: item.content,
      thumbnail: item.thumbnail,
      pubDate: item.pubDate,
      categories: item.categories ?? [],
      author: item.author ?? "Intelli",
      readTime: item.readTime,
      guid: item.guid,
      source: "cms" as const,
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
