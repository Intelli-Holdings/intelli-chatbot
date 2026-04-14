// app/api/medium/route.ts
import { fetchMediumPosts } from "@/lib/medium-feed"
import { fetchCmsPosts } from "@/lib/cms-feed"

export async function GET() {
  const [feedResult, cmsResult] = await Promise.all([
    fetchMediumPosts(),
    fetchCmsPosts(),
  ])

  if (!feedResult.success) {
    console.error("Error fetching Medium feed", { error: feedResult.error })
  }
  if (!cmsResult.success) {
    console.error("Error fetching CMS posts", { error: cmsResult.error })
  }

  // CMS posts first, then Medium posts
  const items = [...cmsResult.items, ...feedResult.items]
  const success = feedResult.success || cmsResult.success

  const result = {
    success,
    items,
    totalItems: items.length,
    feedInfo: feedResult.feedInfo,
    ...(!success && { error: "Failed to fetch posts from all sources" }),
  }

  return new Response(JSON.stringify(result), {
    status: success ? 200 : 500,
    headers: {
      "Content-Type": "application/json",
      // Cache for 5 minutes, serve stale content for up to 10 minutes while revalidating
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
