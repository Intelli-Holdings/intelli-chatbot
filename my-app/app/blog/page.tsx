import type { Metadata } from "next";
import MediumBlogComponent from "./medium-blog-component";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { fetchMediumPosts } from "@/lib/medium-feed";
import { fetchCmsPosts } from "@/lib/cms-feed";

export const revalidate = 60; // revalidate every minute (ISR)

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
  openGraph: {
    title: "Intelli Blog – AI & WhatsApp Automation Insights",
    description:
      "Guides, comparisons, and best practices for AI customer support and WhatsApp automation. By Intelli Holdings Inc.",
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
