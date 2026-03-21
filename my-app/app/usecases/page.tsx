import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import UseCaseSection from "@/components/home/useCaseSection";
import { FAQPageJsonLd } from "@/components/seo/JsonLd";
import { AeoFaqSection } from "@/components/seo/AeoFaqSection";
import Banner from "@/components/signup-banner";
import Link from "next/link";

/**
 * AEO Use Cases / Industry Page
 *
 * Question-style headings target queries like:
 * - "How does Intelli help governments?"
 * - "What industries use AI customer support?"
 * - "Can NGOs use WhatsApp automation?"
 *
 * FAQPage JSON-LD covers industry-specific Q&A for answer engine citation.
 */

export const metadata: Metadata = {
  title:
    "Intelli Use Cases – AI Customer Support for Governments, NGOs, Universities & Enterprises",
  description:
    "Discover how Intelli's AI platform serves governments, NGOs, universities, travel & hospitality, and enterprises. Automate citizen services, program outreach, student enrollment, and customer engagement with WhatsApp and AI.",
  keywords: [
    "AI customer support use cases",
    "government WhatsApp automation",
    "NGO outreach automation",
    "university enrollment chatbot",
    "enterprise customer engagement",
    "Intelli use cases",
  ],
  openGraph: {
    title: "Intelli Use Cases – AI for Governments, NGOs, Universities & Enterprises",
    description:
      "See how organizations across industries use Intelli to automate customer engagement with AI and WhatsApp.",
    url: "https://intelliconcierge.com/usecases",
  },
};

const useCaseFaqs = [
  {
    question: "How do governments use Intelli for citizen services?",
    answer:
      "Governments use Intelli to automate citizen inquiries via WhatsApp and website chat. AI assistants handle questions about public programs, permit applications, and service availability — reducing call center volume and wait times while delivering 24/7 support in multiple languages.",
  },
  {
    question: "How do NGOs use Intelli for program outreach?",
    answer:
      "NGOs use Intelli to promote programs, recruit participants, and guide applicants through enrollment processes via WhatsApp. Broadcast messaging reaches thousands instantly while AI assistants handle individual follow-ups, improving application completion rates by up to 40%.",
  },
  {
    question: "How do universities use Intelli for student enrollment?",
    answer:
      "Universities deploy Intelli to automate admissions inquiries, provide instant answers about programs and requirements, guide prospective students through application steps, and send reminders about deadlines — all via WhatsApp and website chat, 24/7.",
  },
  {
    question: "How does Intelli help travel and hospitality businesses?",
    answer:
      "Travel and hospitality companies use Intelli to capture booking inquiries, provide instant trip information, send follow-up offers, and recover abandoned bookings through WhatsApp automation. AI assistants handle FAQs while human agents focus on complex reservations.",
  },
  {
    question: "Can enterprises use Intelli across multiple departments?",
    answer:
      "Yes. Enterprises deploy Intelli across sales, support, and marketing teams with role-based access, separate AI assistants per department, and unified analytics. The multi-tenant architecture supports multiple WhatsApp numbers and website widgets under one organization.",
  },
];

export default function UsecasesPage() {
  return (
    <div className="relative">
      <Navbar />

      {/* AEO: FAQPage JSON-LD for industry use case questions */}
      <FAQPageJsonLd faqs={useCaseFaqs} />

      <main className="pt-20">
        {/* ============================================================ */}
        {/* HERO                                                          */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                Use cases
              </span>
            </div>
            <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] mb-4">
              How Organizations Use Intelli
            </h1>
            <p className="mt-6 text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-3xl mx-auto">
              Intelli serves governments, NGOs,
              universities, travel & hospitality, and enterprises with
              AI-powered customer engagement across WhatsApp and website chat.
              See how each industry benefits from AI automation.
            </p>
          </header>

          {/* ============================================================ */}
          {/* AEO: Industry summary cards with question headings            */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <article className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                How Do Governments Use AI Customer Support?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Governments use Intelli to automate citizen services on WhatsApp.
                AI assistants handle inquiries about programs, permits, and
                services 24/7 in multiple languages, reducing call center volume
                and improving citizen satisfaction.
              </p>
              <Link
                href="/blog/ai-features-organizations"
                className="text-blue-600 underline hover:text-blue-800 text-sm mt-3 inline-block"
              >
                Read: 7 Essential AI Features for Organizations →
              </Link>
            </article>

            <article className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                How Do NGOs Scale Outreach with AI?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                NGOs use Intelli to broadcast program announcements, guide
                applicants through enrollment, and send automated follow-ups via
                WhatsApp. This increases participation rates while keeping
                communication costs low.
              </p>
              <Link
                href="/blog/overcome-customer-service-delays"
                className="text-blue-600 underline hover:text-blue-800 text-sm mt-3 inline-block"
              >
                Read: How to Overcome Service Delays →
              </Link>
            </article>

            <article className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                How Do Universities Automate Student Enrollment?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Universities deploy Intelli AI assistants to answer admission
                questions, guide prospective students through applications, and
                send deadline reminders via WhatsApp and website chat — converting
                more inquiries into enrollments.
              </p>
              <Link
                href="/features"
                className="text-blue-600 underline hover:text-blue-800 text-sm mt-3 inline-block"
              >
                See all platform features →
              </Link>
            </article>

            <article className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                How Do Enterprises Reduce Support Costs with AI?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Enterprises use Intelli to automate tier-1 support, qualify leads
                via conversational AI, and manage multi-channel customer engagement
                from a unified dashboard — cutting support costs while improving
                response times.
              </p>
              <Link
                href="/blog/ai-support-vs-traditional-helpdesks"
                className="text-blue-600 underline hover:text-blue-800 text-sm mt-3 inline-block"
              >
                Compare: AI Support vs Traditional Help Desks →
              </Link>
            </article>
          </div>
        </section>

        {/* ============================================================ */}
        {/* DETAILED USE CASES — existing component with rich content     */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 lg:w-2/3">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              Industries
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] text-center mb-8">
            Detailed Industry Use Cases
          </h2>
          <UseCaseSection />
        </section>

        {/* ============================================================ */}
        {/* USE CASES FAQ                                                 */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              FAQ
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] text-center mb-10">
            Frequently Asked Questions About Intelli Use Cases
          </h2>
          <AeoFaqSection faqs={useCaseFaqs} />
        </section>

        {/* ============================================================ */}
        {/* CTA                                                           */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <Banner
            title="See Intelli in Action for Your Industry"
            subtitle="Start a 7-day free trial or book a discovery call with our team to discuss your specific use case."
            primaryButton={{ text: "Start Free Trial", href: "/auth/sign-up" }}
            secondaryButton={{ text: "Book a Demo", href: "https://cal.com/intelli-demo/30min?user=intelli-demo", external: true }}
          />
        </section>

        <FooterComponent />
      </main>
    </div>
  );
}
