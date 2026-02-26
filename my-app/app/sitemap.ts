import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.intelliconcierge.com"
  const currentDate = new Date()

  // Core pages (highest priority)
  const corePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: currentDate, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/whatsapp-api`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/whatsapp-assistant`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/whatsapp-broadcast`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/auth/sign-up`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
  ]

  // Marketing & information pages
  const marketingPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/features`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/products`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/company`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/support`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/demo`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/usecases`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/resources`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/join-waitlist`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.6 },
  ]

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog/ai-features-organizations`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog/overcome-customer-service-delays`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog/ai-support-vs-traditional-helpdesks`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/medium-blog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/blog/whatsapp-cloud-api-pricing`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog/whatsapp-business-api-multiple-numbers`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog/whatsapp-api-provider-africa`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog/whatsapp-ai-chatbot-policy-2026`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
  ]

  // Comparison pages
  const comparePages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/compare/intelli-vs-wati`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/compare/intelli-vs-respond-io`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.7 },
  ]

  // Documentation pages
  const docsPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/docs`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/docs/api-reference`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/docs/get-started/connect-whatsapp`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/docs/get-started/assistant`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/docs/get-started/analytics`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/docs/get-started/conversations`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/docs/get-started/website-widget`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/docs/get-started/notifications`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/docs/get-started/organization`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/docs/components`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/docs/onboarding-flow`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.5 },
  ]

  // Legal & changelog
  const otherPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/terms-of-service`, lastModified: currentDate, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/changelog`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/changelog/release-notes`, lastModified: currentDate, changeFrequency: "weekly", priority: 0.5 },
  ]

  return [
    ...corePages,
    ...marketingPages,
    ...blogPages,
    ...comparePages,
    ...docsPages,
    ...otherPages,
  ]
}
