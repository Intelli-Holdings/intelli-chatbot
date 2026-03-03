import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { FAQPageJsonLd, HowToJsonLd } from "@/components/seo/JsonLd";
import { AeoFaqSection } from "@/components/seo/AeoFaqSection";
import Banner from "@/components/signup-banner";
import Link from "next/link";
import { Mail, MessageSquare, BookOpen, Clock } from "lucide-react";

/**
 * AEO Support / FAQ Page
 *
 * Comprehensive FAQ page targeting queries like:
 * - "How to contact Intelli support?"
 * - "Intelli help center"
 * - "How to set up WhatsApp with Intelli?"
 * - "Intelli troubleshooting"
 *
 * Contains:
 * - FAQPage JSON-LD (all FAQ items)
 * - HowTo JSON-LD (setup guide)
 * - Semantic <dl> markup for machine extraction
 * - Question-style headings for each FAQ category
 */

export const metadata: Metadata = {
  title: "Intelli Support & FAQ – Help Center, Setup Guides & Contact",
  description:
    "Get help with Intelli: FAQs about setup, billing, WhatsApp integration, AI assistants, and troubleshooting. Contact support via email or live chat. By Intelli Holdings Inc.",
  keywords: [
    "Intelli support",
    "Intelli FAQ",
    "Intelli help center",
    "WhatsApp setup help",
    "AI chatbot support",
    "Intelli contact",
  ],
  openGraph: {
    title: "Intelli Support & FAQ – Help Center",
    description:
      "FAQs, setup guides, and contact information for Intelli's AI customer engagement platform.",
    url: "https://intelliconcierge.com/support",
  },
};

/* ------------------------------------------------------------------ */
/* All FAQ data — organized by category, used for both UI and JSON-LD  */
/* ------------------------------------------------------------------ */
const gettingStartedFaqs = [
  {
    question: "How do I create an Intelli account?",
    answer:
      "Go to intelliconcierge.com and click 'Start Free Trial' or 'Sign Up'. Enter your email and create a password. Your 7-day free trial begins immediately with no credit card required. You can then create an AI assistant, connect a channel, and start engaging customers.",
  },
  {
    question: "How do I set up a WhatsApp Business API number with Intelli?",
    answer:
      "After creating your account, go to Dashboard > Channels > WhatsApp. Follow the guided setup to connect your WhatsApp Business API number. You will need a Facebook Business account and a phone number that is not already registered with WhatsApp. The process takes about 10 minutes.",
  },
  {
    question: "How do I create and train an AI assistant?",
    answer:
      "Go to Dashboard > Assistants and click 'Create Assistant'. Name your assistant, then upload documents, FAQs, or paste text content. Intelli trains the AI on your data within minutes. You can test it in the playground before deploying to WhatsApp or your website.",
  },
  {
    question: "How do I add the website chat widget to my site?",
    answer:
      "Go to Dashboard > Channels > Website Widget. Customize the widget's appearance (colors, welcome message, position). Copy the embed code snippet and paste it before the closing </body> tag on your website. The widget will appear immediately.",
  },
];

const billingFaqs = [
  {
    question: "What payment methods does Intelli accept?",
    answer:
      "Intelli accepts all major credit and debit cards. For annual plans, bank transfers are also available. Contact support@intelliconcierge.com for bank transfer details. Mobile Money payments are supported in select regions.",
  },
  {
    question: "Can I switch between Intelli plans?",
    answer:
      "Yes. You can upgrade or downgrade your plan at any time from Dashboard > Billing. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of your next billing cycle. There are no penalties for switching.",
  },
  {
    question: "What happens when my free trial ends?",
    answer:
      "After your 7-day free trial, you can choose a paid plan to continue. If you do not select a plan, your account is paused but your data is preserved. You can reactivate at any time by subscribing to a plan.",
  },
  {
    question: "What are AI message credits?",
    answer:
      "AI credits are consumed when the AI processes and responds to customer messages. Each plan includes 1,000 credits per month (equivalent to approximately 1 million tokens). Simple automated replies like welcome messages do not consume credits. Credits reset at the start of each billing cycle.",
  },
];

const technicalFaqs = [
  {
    question: "Can I integrate Intelli with my existing CRM?",
    answer:
      "Yes. Intelli offers API integration for connecting with popular CRM systems. Enterprise plans include custom API integration setup with your CRM, ERP, or internal tools. Contact our team for specific CRM integration support.",
  },
  {
    question: "Is my data secure with Intelli?",
    answer:
      "Yes. Intelli uses industry-standard TLS 1.3 encryption for data in transit and AES-256 encryption for data at rest. The platform is GDPR compliant, supports role-based access control, and provides audit logs. Intelli does not use customer conversation data to train AI models.",
  },
  {
    question: "What is a WhatsApp customer service window?",
    answer:
      "A WhatsApp customer service window opens when a customer sends your business a message and lasts 24 hours from the most recent message. During this window, you can send any type of message. Outside the window, you must use pre-approved template messages.",
  },
  {
    question: "Does Intelli support multiple team members?",
    answer:
      "Yes. Each plan includes at least 1 team member seat. Additional seats cost $5 per month per member. Team members can view and respond to conversations, access analytics, and manage contacts. Enterprise plans include custom team member allocations.",
  },
  {
    question: "What is Intelli's Flow Builder?",
    answer:
      "The Flow Builder is a visual, no-code tool for creating automated conversation paths. You can drag and drop nodes to build customer journeys that qualify leads, collect information, route conversations, and trigger actions. Flows work across WhatsApp and website chat channels.",
  },
];

const allFaqs = [...gettingStartedFaqs, ...billingFaqs, ...technicalFaqs];

const setupSteps = [
  {
    name: "Sign up for a free Intelli account",
    text: "Visit intelliconcierge.com and click Start Free Trial. Enter your email and create a password. No credit card is required.",
  },
  {
    name: "Create an AI assistant",
    text: "In the dashboard, go to Assistants and create a new assistant. Upload your organization's FAQs, documents, or knowledge base content to train the AI.",
  },
  {
    name: "Connect a communication channel",
    text: "Go to Channels and connect your WhatsApp Business API number or configure the website chat widget. Follow the guided setup for your chosen channel.",
  },
  {
    name: "Test your AI assistant",
    text: "Use the Playground to test your assistant's responses. Ask sample questions to verify accuracy. Adjust the training data if needed.",
  },
  {
    name: "Go live",
    text: "Deploy your assistant to your connected channels. Customers can now interact with your AI assistant. Monitor conversations from the unified inbox.",
  },
];

export default function SupportPage() {
  return (
    <div className="relative">
      <Navbar />

      {/* AEO: FAQPage JSON-LD for answer engine extraction */}
      <FAQPageJsonLd faqs={allFaqs} />
      {/* AEO: HowTo JSON-LD for setup guide */}
      <HowToJsonLd
        name="How to Set Up Intelli AI Customer Support"
        description="Complete guide to setting up Intelli's AI customer engagement platform, from account creation to going live."
        steps={setupSteps}
      />

      <main className="pt-20">
        {/* ============================================================ */}
        {/* HERO                                                          */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <header className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                Support
              </span>
            </div>
            <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] mb-4">
              Intelli Help Center & FAQ
            </h1>
            <p className="mt-6 text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-3xl mx-auto">
              Find answers to common questions about Intelli&apos;s AI customer
              engagement platform. Get help with setup, billing, WhatsApp
              integration, and more. Can&apos;t find what you need? Contact our
              support team directly.
            </p>
          </header>

          {/* ============================================================ */}
          {/* CONTACT OPTIONS                                               */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
              <p className="text-sm text-gray-600 mb-2">Available 24/7</p>
              <a
                href="mailto:support@intelliconcierge.com"
                className="text-blue-600 underline text-sm"
              >
                support@intelliconcierge.com
              </a>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <MessageSquare className="w-8 h-8 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600">
                Use the chat widget on any page to talk to our support team in
                real time.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Documentation</h3>
              <p className="text-sm text-gray-600 mb-2">Guides & tutorials</p>
              <Link
                href="/docs"
                className="text-blue-600 underline text-sm"
              >
                Visit docs →
              </Link>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
              <p className="text-sm text-gray-600">
                Email: under 24 hours. Enterprise plans include priority
                support with faster response times.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SETUP GUIDE — AEO: HowTo with step-by-step                   */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              Setup guide
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] text-center mb-4">
            How Do You Set Up Intelli?
          </h2>
          <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] text-center max-w-2xl mx-auto mb-10">
            Follow these five steps to go from sign-up to live AI customer
            support. Most organizations complete setup in under 15 minutes.
          </p>
          <ol className="space-y-6">
            {setupSteps.map((step, index) => (
              <li
                key={step.name}
                className="flex gap-4 items-start border border-gray-200 rounded-xl p-6"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {step.name}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ============================================================ */}
        {/* GETTING STARTED FAQ                                           */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              Getting started
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] text-center mb-10">
            Getting Started with Intelli
          </h2>
          <AeoFaqSection faqs={gettingStartedFaqs} />
        </section>

        {/* ============================================================ */}
        {/* BILLING FAQ                                                   */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              Billing
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] text-center mb-10">
            Billing & Pricing Questions
          </h2>
          <AeoFaqSection faqs={billingFaqs} />
          <p className="text-center mt-6 text-gray-600">
            For detailed plan comparisons, visit our{" "}
            <Link
              href="/pricing"
              className="text-blue-600 underline hover:text-blue-800"
            >
              pricing page
            </Link>
            .
          </p>
        </section>

        {/* ============================================================ */}
        {/* TECHNICAL FAQ                                                 */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              Technical
            </span>
          </div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold text-[#1a1a1a] leading-[1.1] text-center mb-10">
            Technical & Integration Questions
          </h2>
          <AeoFaqSection faqs={technicalFaqs} />
          <p className="text-center mt-6 text-gray-600">
            Explore our{" "}
            <Link
              href="/features"
              className="text-blue-600 underline hover:text-blue-800"
            >
              full feature list
            </Link>{" "}
            or read our{" "}
            <Link
              href="/blog/ai-features-organizations"
              className="text-blue-600 underline hover:text-blue-800"
            >
              guide to essential AI features
            </Link>
            .
          </p>
        </section>

        {/* ============================================================ */}
        {/* CTA                                                           */}
        {/* ============================================================ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <Banner
            title="Still Have Questions?"
            subtitle="Our support team is ready to help. Email us at support@intelliconcierge.com or use the live chat widget."
            primaryButton={{ text: "Contact Support", href: "mailto:support@intelliconcierge.com", external: true }}
            secondaryButton={{ text: "Start Free Trial", href: "/auth/sign-up" }}
          />
        </section>

        <FooterComponent />
      </main>
    </div>
  );
}
