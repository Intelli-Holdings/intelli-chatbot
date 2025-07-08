import { NextResponse } from "next/server"

interface MediumPost {
  title: string
  link: string
  contentSnippet: string
  content?: string
  thumbnail?: string
  pubDate?: string
  categories?: string[]
  author?: string
  readTime?: string
}

// Function to parse RSS XML to JSON
async function parseRSSFeed(rssUrl: string): Promise<MediumPost[]> {
  try {
    const response = await fetch(rssUrl)
    const xmlText = await response.text()

    // Simple XML parsing for RSS (you might want to use a proper XML parser in production)
    const items: MediumPost[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1]

      const title =
        itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
        itemXml.match(/<title>(.*?)<\/title>/)?.[1] ||
        "Untitled"

      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ""

      const description =
        itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
        itemXml.match(/<description>(.*?)<\/description>/)?.[1] ||
        ""

      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""

      // Extract author from the XML
      const author = itemXml.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/)?.[1] || 
                    itemXml.match(/<dc:creator>(.*?)<\/dc:creator>/)?.[1] || 
                    "Intelli Team"

      // Extract thumbnail from content
      const thumbnailMatch = description.match(/<img[^>]+src="([^">]+)"/i)
      const thumbnail = thumbnailMatch?.[1] || ""

      // Process content for better display
      let processedContent = description
      
      // Remove specific Medium tracking elements and clean up
      processedContent = processedContent
        .replace(/<div class="medium-feed-.*?<\/div>/gi, '')
        .replace(/<figure.*?<\/figure>/gi, (match) => {
          // Keep images but clean up figure tags
          const imgMatch = match.match(/<img[^>]*>/i)
          return imgMatch ? imgMatch[0] : ''
        })
        .replace(/&nbsp;/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')

      // Clean description for snippet (plain text)
      const contentSnippet = description
        .replace(/<[^>]*>/g, "")
        .replace(/&[^;]+;/g, "")
        .substring(0, 200)
        .trim()

      // Estimate read time based on content length
      const wordCount = processedContent.replace(/<[^>]*>/g, '').split(/\s+/).length
      const readTime = Math.max(1, Math.ceil(wordCount / 200)) // Average reading speed: 200 words/minute

      items.push({
        title: title.replace(/&[^;]+;/g, ""),
        link,
        contentSnippet,
        content: processedContent,
        thumbnail,
        pubDate,
        categories: ["Medium"],
        author: author.replace(/&[^;]+;/g, ""),
        readTime: `${readTime} min read`
      })
    }

    return items.slice(0, 9) // Limit to 9 posts
  } catch (error) {
    console.error("Error parsing RSS feed:", error)
    return []
  }
}

export async function GET() {
  try {
    const MEDIUM_RSS_URL = "https://medium.com/feed/@intelli"

    // Try to fetch from Medium RSS
    let posts: MediumPost[] = []

    try {
      posts = await parseRSSFeed(MEDIUM_RSS_URL)
    } catch (rssError) {
      console.log("RSS fetch failed, using fallback data")
    }
    

    return NextResponse.json({
      items: posts,
      success: true,
      message: posts.length > 0 ? "Posts loaded successfully" : "No posts available",
    })
  } catch (error) {
    console.error("API Error:", error)

    return NextResponse.json(
      {
        items: [],
        success: false,
        error: "Failed to fetch blog posts",
      },
      { status: 500 },
    )
  }
}
