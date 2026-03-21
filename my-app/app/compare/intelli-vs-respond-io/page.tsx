import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { getCanonicalUrl } from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Intelli vs Respond.io — WhatsApp & Multi-Channel Platform Comparison | Intelli",
  description:
    "Compare Intelli and Respond.io: WhatsApp Business API, multi-channel inbox, AI chatbot, pricing, and which platform is the best fit for your team.",
  alternates: {
    canonical: getCanonicalUrl("/compare/intelli-vs-respond-io"),
  },
};

// TODO: Replace placeholder content with full comparison page
export default function IntelliVsRespondIoPage() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        <article className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-[clamp(32px,4.5vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] mb-6">
              Intelli vs Respond.io — WhatsApp &amp; Multi-Channel Platform Comparison
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
