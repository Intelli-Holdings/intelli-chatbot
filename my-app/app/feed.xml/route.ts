import { fetchMediumPosts } from "@/lib/medium-feed"
import { fetchCmsPosts } from "@/lib/cms-feed"
import { createSlug } from "@/lib/blog-utils"
import { stripHtml } from "@/lib/sanitize"

const BASE_URL = "https://www.intelliconcierge.com"

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const [feedResult, cmsResult] = await Promise.allSettled([
    fetchMediumPosts(),
    fetchCmsPosts(),
  ])

  const mediumItems = feedResult.status === "fulfilled" && feedResult.value.success ? feedResult.value.items : []
  const cmsItems = cmsResult.status === "fulfilled" && cmsResult.value.success ? cmsResult.value.items : []
  const items = [...cmsItems, ...mediumItems]

  const rssItems = items
    .map((post) => {
      const slug = post.slug || createSlug(post.title)
      const link = `${BASE_URL}/blog/${slug}`
      const pubDate = post.pubDate ? new Date(post.pubDate).toUTCString() : new Date().toUTCString()
      const description = escapeXml(stripHtml(post.contentSnippet || ""))
      const categories = (post.categories || [])
        .map((cat) => `      <category>${escapeXml(cat)}</category>`)
        .join("\n")

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>${escapeXml(post.author || "Intelli")}</author>
${categories}
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Intelli Blog – AI Customer Support &amp; WhatsApp Automation</title>
    <link>${BASE_URL}/blog</link>
    <description>Guides, insights, and best practices for AI customer support, WhatsApp Business automation, and chatbot solutions by Intelli Holdings Inc.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/Intelli.svg</url>
      <title>Intelli Blog</title>
      <link>${BASE_URL}/blog</link>
    </image>
${rssItems}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  })
}
