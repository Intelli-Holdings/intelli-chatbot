import type { Metadata } from "next";
import MediumBlogComponent from "./medium-blog-component";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { fetchAllPosts } from "@/lib/medium-feed";
import { createSlug } from "@/lib/blog-utils";
import { getCanonicalUrl } from "@/lib/metadata";

export const revalidate = 300; // revalidate every 5 minutes (ISR)

export const metadata: Metadata = {
  title: "Intelli Blog – AI Customer Support, WhatsApp Automation & Industry Insights",
  description:
    "Read the latest from Intelli Holdings Inc.: guides on AI customer support, WhatsApp Business automation, chatbot best practices, and industry insights for governments, NGOs, universities, and enterprises.",
  keywords: [
    "Intelli blog",
    "AI customer support blog",
    "WhatsApp automation guides",
    "chatbot best practices",
    "customer engagement insights",
  ],
  alternates: {
    canonical: getCanonicalUrl("/blog"),
    types: {
      "application/rss+xml": "https://www.intelliconcierge.com/feed.xml",
    },
  },
  openGraph: {
    title: "Intelli Blog – AI & WhatsApp Automation Insights",
    description:
      "Guides, comparisons, and best practices for AI customer support and WhatsApp automation. By Intelli Holdings Inc.",
    url: "https://www.intelliconcierge.com/blog",
  },
};

export default async function BlogPage() {
  const feedResult = await fetchAllPosts();

  // CollectionPage JSON-LD for answer engine entity mapping
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Intelli Blog",
    description:
      "Guides, comparisons, and best practices for AI customer support, WhatsApp Business automation, and chatbot solutions by Intelli Holdings Inc.",
    url: "https://www.intelliconcierge.com/blog",
    publisher: {
      "@type": "Organization",
      name: "Intelli Holdings Inc.",
      logo: {
        "@type": "ImageObject",
        url: "https://www.intelliconcierge.com/Intelli.svg",
      },
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: feedResult.items.length,
      itemListElement: feedResult.items.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.intelliconcierge.com/blog/${createSlug(post.title)}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <Navbar />

      <main className="pt-20">

        <MediumBlogComponent initialPosts={feedResult.items} />

        <FooterComponent />
      </main>
    </div>
  );
}
