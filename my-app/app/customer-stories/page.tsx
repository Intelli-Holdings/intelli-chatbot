import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import React from "react";
import TestimonialSection from "@/components/testimonial-section";

export const metadata: Metadata = {
  title: "Customer Stories – How Businesses Use Intelli for AI Support",
  description:
    "Read real success stories from businesses using Intelli's AI-powered customer engagement platform to automate WhatsApp support, reduce response times, and scale customer service.",
  alternates: { canonical: "https://www.intelliconcierge.com/customer-stories" },
  openGraph: {
    title: "Customer Stories – Intelli AI Platform",
    description: "See how organizations use Intelli to transform customer engagement with AI across WhatsApp, web chat, and email.",
    url: "https://www.intelliconcierge.com/customer-stories",
  },
};

export default function CustomerStoriesPage() {
  return (
    <div className="relative">
      <main className="pt-16">
        <Navbar />
        <section className="container mx-auto mt-8 px-4 lg:2/4 xl:w-2/3 ml-22.5 sm:w-3/4">
          <TestimonialSection />
        </section>
      </main>
    </div>
  );
}
