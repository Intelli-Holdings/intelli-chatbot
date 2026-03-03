import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { FAQPageJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/JsonLd";
import { AeoFaqSection } from "@/components/seo/AeoFaqSection";
import Banner from "@/components/signup-banner";
import Link from "next/link";
import {
  MessageSquare,
  Bot,
  BarChart3,
  Send,
  Users,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

/**
 * AEO Features Page
 *
 * Structured with question-style H2 headings that match common AI query intents:
 * - "What are the features of Intelli?"
 * - "Does Intelli support WhatsApp?"
 * - "Can Intelli automate customer support?"
 *
 * Each question heading is followed by a direct 40-80 word answer paragraph,
 * then an expanded explanation. FAQPage JSON-LD covers the top Q&A pairs.
 */

export const metadata: Metadata = {
  title: "Intelli Features – AI Customer Support, WhatsApp Automation & More",
  description:
    "Explore Intelli's features: AI-powered chatbots, WhatsApp Business API integration, live chat, broadcast messaging, conversation analytics, and multi-channel support. Built by Intelli Holdings Inc.",
  keywords: [
    "Intelli features",
    "AI chatbot features",
    "WhatsApp Business API",
    "customer support automation",
    "live chat software",
    "broadcast messaging",
    "conversation analytics",
  ],
  openGraph: {
    title: "Intelli Features – AI Customer Support & WhatsApp Automation",
    description:
      "AI assistants, WhatsApp automation, live chat, broadcast messaging, analytics, and more. See what Intelli can do for your organization.",
    url: "https://intelliconcierge.com/features",
  },
};

/* ------------------------------------------------------------------ */
/* AEO FAQ data for the features page — feeds both UI and JSON-LD      */
/* ------------------------------------------------------------------ */
const featureFaqs = [
  {
    question: "What are the main features of Intelli?",
    answer:
      "Intelli offers AI-powered chatbots, WhatsApp Business API integration, website chat widgets, live chat with a team inbox, broadcast messaging, conversation analytics, contact management, flow builder automation, and multi-language support. All features are accessible from a single unified dashboard.",
  },
  {
    question: "Does Intelli integrate with WhatsApp Business API?",
    answer:
      "Yes. Intelli provides full WhatsApp Business API integration including automated AI responses, template message management, broadcast campaigns to unlimited contacts, conversation analytics, and a shared team inbox for human agent handoff.",
  },
  {
    question: "Can Intelli's AI assistant be trained on my organization's data?",
    answer:
      "Yes. You can upload documents, FAQs, product catalogs, and knowledge base articles. Intelli trains a custom AI assistant on your data so it gives accurate, brand-specific answers rather than generic responses.",
  },
  {
    question: "Does Intelli offer analytics and reporting?",
    answer:
      "Yes. Intelli provides conversation analytics including message volume, response times, resolution rates, customer satisfaction scores, and campaign performance. All data is available in real-time dashboards with export options.",
  },
  {
    question: "Is Intelli suitable for enterprise and government organizations?",
    answer:
      "Yes. Intelli is purpose-built for governments, NGOs, universities, and enterprises. It supports multi-tenant organizations, role-based access, data encryption, GDPR compliance, and custom API integrations for enterprise systems.",
  },
];

const features = [
  {
    icon: Bot,
    title: "AI-Powered Chatbots",
    question: "How Do Intelli's AI assistants Work?",
    answer:
      "Intelli's AI assistants are trained on your organization's documents, FAQs, and knowledge base. They understand natural language, answer customer questions accurately, and handle complex multi-turn conversations without human intervention. When a query requires human attention, the AI seamlessly escalates to a live agent.",
    detail:
      "Unlike rule-based chatbots that follow rigid scripts, Intelli's AI assistants use large language models to understand context and intent. This means they can handle unexpected questions, provide nuanced answers, and learn from new documents you upload.",
    link: "/blog/ai-features-organizations",
    linkText: "Read: 7 Essential AI Features Every Organization Should Adopt",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Business API",
    question: "What Can You Do with Intelli's WhatsApp Integration?",
    answer:
      "Intelli provides complete WhatsApp Business API integration. Send and receive messages, automate responses with AI, manage message templates, run broadcast campaigns to thousands of contacts, and track delivery and engagement analytics — all from one dashboard.",
    detail:
      "WhatsApp has over 2 billion users globally. Intelli helps organizations meet customers where they already are. The integration includes template management for Meta-approved messages, campaign analytics with read receipts, and automated follow-up sequences.",
    link: "/usecases",
    linkText: "See WhatsApp use cases by industry",
  },
  {
    icon: Zap,
    title: "Flow Builder Automation",
    question: "How Does Intelli's No-Code Flow Builder Work?",
    answer:
      "Intelli's visual flow builder lets you create automated conversation paths without writing code. Drag and drop nodes to build customer journeys — qualify leads, collect information, route conversations, and trigger actions based on customer responses.",
    detail:
      "The flow builder supports start triggers, text messages, interactive questions with buttons, conditional branching, media attachments, user input collection, and action nodes for AI handoff or conversation ending. Flows work across WhatsApp and website chat.",
    link: "/blog/overcome-customer-service-delays",
    linkText: "Read: How to Overcome Customer Service Delays",
  },
  {
    icon: Send,
    title: "Broadcast Messaging",
    question: "Can Intelli Send Bulk WhatsApp Messages?",
    answer:
      "Yes. Intelli's broadcast feature lets you send bulk WhatsApp messages to segmented contact lists using Meta-approved templates. Track delivery rates, read receipts, and engagement metrics for every campaign. Ideal for announcements, promotions, and program updates.",
    detail:
      "Broadcasts support dynamic personalization with contact variables, scheduling for optimal send times, and audience segmentation with tags. Organizations use broadcasts for marketing campaigns, service alerts, event reminders, and program recruitment.",
    link: "/pricing",
    linkText: "See broadcast pricing and plans",
  },
  {
    icon: Users,
    title: "Team Inbox & Live Chat",
    question: "Does Intelli Support Live Chat with Human Agents?",
    answer:
      "Yes. Intelli includes a unified team inbox where human agents can take over conversations from the AI assistant. Agents see the full conversation history, customer context, and AI suggestions. The inbox supports multiple agents, assignments, and internal notes.",
    detail:
      "The team inbox works across all channels — WhatsApp, website chat, and email. Agents can handle multiple conversations simultaneously, use canned responses for common replies, and escalate to specialists when needed.",
    link: "/blog/ai-support-vs-traditional-helpdesks",
    linkText: "Compare: AI Support vs Traditional Help Desks",
  },
  {
    icon: BarChart3,
    title: "Conversation Analytics",
    question: "What Analytics Does Intelli Provide?",
    answer:
      "Intelli provides real-time dashboards showing message volume, response times, resolution rates, customer satisfaction, agent performance, and campaign metrics. Export data for reporting or integrate with your existing BI tools via API.",
    detail:
      "Analytics cover both AI and human agent performance. Track how many conversations the AI resolves without human help, identify peak contact hours, measure campaign ROI, and monitor quality scores across your team.",
    link: "/features",
    linkText: "Explore all analytics features",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    question: "Does Intelli Support Multiple Languages?",
    answer:
      "Yes. Intelli's AI assistants can communicate in multiple languages automatically. The platform detects the customer's language and responds accordingly. WhatsApp templates support language variants, and the dashboard interface is available in English.",
    detail:
      "Multi-language support is critical for governments, NGOs, and enterprises serving diverse populations. Intelli handles language detection, translation, and response generation without requiring separate AI models for each language.",
    link: "/usecases",
    linkText: "See multi-language use cases",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    question: "How Does Intelli Protect Customer Data?",
    answer:
      "Intelli uses industry-standard encryption for data in transit and at rest. The platform is GDPR compliant, supports role-based access control, and provides audit logs for compliance. Enterprise plans include dedicated infrastructure and custom security configurations.",
    detail:
      "Security features include TLS 1.3 encryption, secure API authentication, organization-level data isolation for multi-tenant deployments, and automated data retention policies. Intelli does not use customer conversation data to train its base models.",
    link: "/pricing",
    linkText: "See enterprise security plans",
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative">
      <Navbar />

      {/* AEO: FAQPage JSON-LD for answer engine extraction */}
      <FAQPageJsonLd faqs={featureFaqs} />
      {/* AEO: SoftwareApplication JSON-LD for product rich snippets */}
      <SoftwareApplicationJsonLd />

      <main className="pt-20">
        {/* ============================================================ */}
        {/* HERO                                                          */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <header className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                Features
              </span>
            </div>
            <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] mb-4">
              Intelli Platform Features
            </h1>
            <p className="mt-6 text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-3xl mx-auto">
              Intelli provides AI-powered customer
              engagement tools including chatbots, WhatsApp automation, live
              chat, broadcast messaging, analytics, and a no-code flow builder —
              all in one platform designed for governments, NGOs, universities,
              and enterprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center text-base font-bold py-3 px-8 bg-gradient-to-r from-teal-400 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center text-base font-bold py-3 px-8 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          </header>

          {/* ============================================================ */}
          {/* FEATURE CARDS — each with question heading + direct answer    */}
          {/* ============================================================ */}
          <div className="space-y-16">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                    {feature.title}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {feature.question}
                </h2>

                {/* AEO: Direct answer — 40-80 words, front-loaded for extraction */}
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {feature.answer}
                </p>

                {/* Secondary detail paragraph */}
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  {feature.detail}
                </p>

                {/* AEO: Internal link to strengthen topical authority */}
                <Link
                  href={feature.link}
                  className="text-blue-600 underline hover:text-blue-800 text-sm font-medium"
                >
                  {feature.linkText} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURES FAQ — renders featureFaqs with semantic <dl> markup  */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              FAQ
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] text-center mb-10">
            Frequently Asked Questions About Intelli Features
          </h2>
          <AeoFaqSection faqs={featureFaqs} />
          <div className="text-center mt-10">
            <Link
              href="/support"
              className="text-blue-600 underline hover:text-blue-800 text-lg"
            >
              View all FAQs and support resources →
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA                                                           */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <Banner
            title="Ready to Automate Customer Engagement?"
            subtitle="Start your 7-day free trial. No credit card required. Set up your first AI assistant in under 15 minutes."
            primaryButton={{ text: "Get Started Free", href: "/auth/sign-up" }}
          />
        </section>

        <FooterComponent />
      </main>
    </div>
  );
}
