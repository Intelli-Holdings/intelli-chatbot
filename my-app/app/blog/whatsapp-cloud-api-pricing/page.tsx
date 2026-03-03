import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { getCanonicalUrl } from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = {
  title: "WhatsApp Cloud API Pricing 2026 — Complete Cost Breakdown | Intelli",
  description:
    "Understand WhatsApp Cloud API pricing: per-message fees by country, message categories (marketing, utility, authentication), and BSP costs. See how Intelli's plans compare.",
  alternates: {
    canonical: getCanonicalUrl("/blog/whatsapp-cloud-api-pricing"),
  },
};

// TODO: Replace placeholder content with full blog post
export default function WhatsAppCloudApiPricingPage() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        <article className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-[clamp(32px,4.5vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] mb-6">
              WhatsApp Cloud API Pricing 2026 — Complete Cost Breakdown
            </h1>
            <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] mb-8">
              This article is coming soon. In the meantime, check out our{" "}
              <Link href="/whatsapp-api" className="text-[#007fff] hover:underline">
                WhatsApp Business API guide
              </Link>{" "}
              for current pricing details.
            </p>
          </div>
        </article>
        <FooterComponent />
      </main>
    </div>
  );
}
