import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { getCanonicalUrl } from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meta's 2026 WhatsApp AI Chatbot Policy — What Businesses Need to Know | Intelli",
  description:
    "Meta's 2026 AI chatbot disclosure policy for WhatsApp Business API: what changed, how to comply, and how Intelli keeps your account safe with built-in compliance.",
  alternates: {
    canonical: getCanonicalUrl("/blog/whatsapp-ai-chatbot-policy-2026"),
  },
};

// TODO: Replace placeholder content with full blog post
export default function WhatsAppAiChatbotPolicyPage() {
  return (
    <div className="relative">
      <Navbar />
      <main className="pt-20">
        <article className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-[clamp(32px,4.5vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] mb-6">
              Meta&apos;s 2026 WhatsApp AI Chatbot Policy — What Businesses Need to Know
            </h1>
            <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] mb-8">
              This article is coming soon. In the meantime, learn about our{" "}
              <Link href="/whatsapp-assistant" className="text-[#007fff] hover:underline">
                AI WhatsApp Assistant
              </Link>{" "}
              which is fully compliant with Meta&apos;s latest policies.
            </p>
          </div>
        </article>
        <FooterComponent />
      </main>
    </div>
  );
}
