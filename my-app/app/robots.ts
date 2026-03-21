import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/dashboard/", "/onboarding/", "/pre-onboarding/", "/test-auth/"],
    },
    sitemap: "https://www.intelliconcierge.com/sitemap.xml",
  };
}
