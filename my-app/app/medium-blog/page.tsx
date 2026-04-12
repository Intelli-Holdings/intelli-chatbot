import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import React from "react";
import MediumBlogComponent from "./medium-blog-component";

export const metadata: Metadata = {
  title: "Intelli on Medium – AI & WhatsApp Automation Articles",
  description:
    "Read Intelli's Medium publication: articles on AI customer support, WhatsApp Business API, chatbot automation, and industry insights for modern businesses.",
  alternates: { canonical: "https://www.intelliconcierge.com/blog" },
  openGraph: {
    title: "Intelli on Medium – AI & Automation Articles",
    description: "AI customer support and WhatsApp automation insights from the Intelli team on Medium.",
    url: "https://www.intelliconcierge.com/medium-blog",
  },
};

export default function mediumBlogPage() {
  return (
    <div>
      <Navbar />
      <MediumBlogComponent />
    </div>
  );
}
