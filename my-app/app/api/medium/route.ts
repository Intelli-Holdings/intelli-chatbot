// app/api/medium/route.ts
import { logger } from "@/lib/logger"
import { fetchMediumPosts } from "@/lib/medium-feed"

export async function GET() {
  const result = await fetchMediumPosts()

  if (!result.success) {
    logger.error("Error fetching Medium feed", { error: result.error })
  }

  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 500,
    headers: {
      "Content-Type": "application/json",
      // Cache for 5 minutes, serve stale content for up to 10 minutes while revalidating
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
