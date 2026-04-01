import type { Metadata } from "next";
import MediumBlogComponent from "./medium-blog-component";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { fetchMediumPosts } from "@/lib/medium-feed";
import { fetchCmsPosts } from "@/lib/cms-feed";

export const revalidate = 60; // revalidate every minute (ISR)

export const metadata: Metadata = {
  title: "Intelli Blog – AI native multi-channel and CX Insights",
  description:
    "Read the latest from Intelli Holdings Inc.: guides on AI customer support/customer engagement and customer experience, WhatsApp Business automation, AI Agent and AI assistant best practices, and industry insights for governments, NGOs, universities, and enterprises.",
  keywords: [
    "Intelli blog",
    "AI customer support blog",
    "AI customer engagement software",
    "AI customer experience platform",
    "B2C Customer Engagement Multichannel platform",
    "WhatsApp automation guides",
    "AI assistant best practices",
    "AI Agent best practices and guides for your business",
    "customer engagement insights",
    "Africa's best AI customer engagement platform",
  ],
  openGraph: {
    title: "Intelli Blog – AI native multi-channel and CX Insights",
    description:
      "Guides, comparisons, and best practices for AI customer support/customer engagement and multi-channel platforms.",
    url: "https://intelliconcierge.com/blog",
  },
};

export default async function BlogPage() {
  const [feedResult, cmsResult] = await Promise.all([
    fetchMediumPosts(),
    fetchCmsPosts(),
  ]);

  // CMS posts first (newest), then Medium posts
  const allPosts = [...cmsResult.items, ...feedResult.items];

  return (
    <div className="relative">
      <Navbar />

      <main className="pt-20">

        <MediumBlogComponent initialPosts={allPosts} />

        <FooterComponent />
      </main>
    </div>
  );
}
