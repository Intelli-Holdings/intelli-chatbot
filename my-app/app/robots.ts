import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for all crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard/", "/onboarding/", "/pre-onboarding/", "/test-auth/"],
      },
      // Explicitly invite AI answer-engine crawlers
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/", "/llms.txt", "/feed.xml"],
        disallow: ["/api/", "/auth/", "/dashboard/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/blog/", "/llms.txt", "/feed.xml"],
        disallow: ["/api/", "/auth/", "/dashboard/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog/", "/llms.txt", "/feed.xml"],
        disallow: ["/api/", "/auth/", "/dashboard/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/blog/", "/llms.txt", "/feed.xml"],
        disallow: ["/api/", "/auth/", "/dashboard/"],
      },
      {
        userAgent: "Amazonbot",
        allow: ["/", "/blog/", "/llms.txt", "/feed.xml"],
        disallow: ["/api/", "/auth/", "/dashboard/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/blog/", "/llms.txt", "/feed.xml"],
        disallow: ["/api/", "/auth/", "/dashboard/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/blog/", "/llms.txt", "/feed.xml"],
        disallow: ["/api/", "/auth/", "/dashboard/"],
      },
    ],
    sitemap: "https://www.intelliconcierge.com/sitemap.xml",
  };
}
