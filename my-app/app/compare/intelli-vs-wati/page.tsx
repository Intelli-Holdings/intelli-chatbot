import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { getCanonicalUrl } from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Intelli vs WATI — WhatsApp Business API Provider Comparison | Intelli",
  description:
    "Compare Intelli and WATI for WhatsApp Business API: pricing, features, AI chatbot, multi-channel support, and which platform is best for your business.",
  alternates: {
    canonical: getCanonicalUrl("/compare/intelli-vs-wati"),
  },
};

// TODO: Replace placeholder content with full comparison page
export default function IntelliVsWatiPage() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        <article className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-[clamp(32px,4.5vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] mb-6">
              Intelli vs WATI — WhatsApp Business API Provider Comparison
            </h1>
            <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] mb-8">
              This comparison is coming soon. In the meantime, check out our{" "}
              <Link href="/whatsapp-api" className="text-[#007fff] hover:underline">
                WhatsApp Business API page
              </Link>{" "}
              to see what Intelli offers.
            </p>
          </div>
        </article>
        <FooterComponent />
      </main>
    </div>
  );
}
