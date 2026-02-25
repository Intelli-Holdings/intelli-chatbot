import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import Banner from "@/components/signup-banner";
import { Check, AlertTriangle, Smartphone, Server, Zap, Users, BarChart3, MessageSquare, Bot, Shield, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCanonicalUrl } from "@/lib/metadata";
import { FAQPageJsonLd } from "@/components/seo/JsonLd";
import { WhatsAppApiFaq } from "./faq-section";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title:
    "WhatsApp Business API & Cloud API Provider — Setup, Pricing & Integration | Intelli",
  description:
    "Get started with the WhatsApp Cloud API through Intelli. Connect multiple numbers, automate conversations with AI, send campaigns, and manage customer support — all from one platform. See pricing, setup guides, and how Intelli compares.",
  alternates: {
    canonical: getCanonicalUrl("/whatsapp-api"),
  },
  openGraph: {
    title:
      "WhatsApp Business API & Cloud API Provider — Setup, Pricing & Integration | Intelli",
    description:
      "Get started with the WhatsApp Cloud API through Intelli. Connect multiple numbers, automate conversations with AI, send campaigns, and manage customer support — all from one platform.",
    url: getCanonicalUrl("/whatsapp-api"),
    type: "website",
    images: [
      {
        url: "https://www.intelliconcierge.com/api/og",
        width: 1200,
        height: 630,
        alt: "Intelli WhatsApp Business API Provider",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp Business API & Cloud API Provider — Setup, Pricing & Integration | Intelli",
    description:
      "Get started with the WhatsApp Cloud API through Intelli. Connect multiple numbers, automate conversations with AI, send campaigns, and manage customer support.",
  },
};

/* ------------------------------------------------------------------ */
/* FAQ Data (shared between accordion + JSON-LD)                       */
/* ------------------------------------------------------------------ */
const faqItems = [
  {
    question: "Is the WhatsApp Cloud API free?",
    answer:
      "Access to the WhatsApp Cloud API itself is free. However, Meta charges per-message fees for business-initiated template messages across marketing, utility, and authentication categories. Customer-initiated service conversations within the 24-hour window are free. You will also pay a monthly subscription to your Business Solution Provider (like Intelli) for the platform, team inbox, AI features, and support tools.",
  },
  {
    question: "How do I get WhatsApp Business API access?",
    answer:
      "You need a Meta Business account and a phone number that is not already registered on WhatsApp. Then, sign up with a WhatsApp Business Solution Provider like Intelli. We handle the technical integration, number verification, and Meta approval process — most businesses are live within 24 hours.",
  },
  {
    question: "Can I use multiple phone numbers with WhatsApp API?",
    answer:
      "Yes. Unlike the WhatsApp Business App which is limited to a single device, the WhatsApp Cloud API supports multiple phone numbers under one WhatsApp Business Account. With Intelli, plans like Elite, Scale, and Legacy include 2, 5, and 8 numbers respectively, and you can add more as needed.",
  },
  {
    question:
      "What's the difference between WhatsApp Cloud API and On-Premise API?",
    answer:
      "The Cloud API is hosted by Meta and is the recommended solution going forward — it requires no server infrastructure and is free to access. The On-Premise API required businesses to host their own servers and was deprecated by Meta in October 2025. All businesses should now migrate to the Cloud API.",
  },
  {
    question: "Do I need a BSP to use WhatsApp Cloud API?",
    answer:
      "Technically no — you can integrate directly via Meta's API. However, a Business Solution Provider like Intelli gives you a ready-made dashboard, team inbox, AI chatbot builder, broadcast tools, analytics, and customer support — all without writing code. Most businesses choose a BSP because building these tools from scratch is expensive and time-consuming.",
  },
  {
    question: "Can I integrate an AI chatbot with WhatsApp Business API?",
    answer:
      "Absolutely. Intelli includes a built-in AI assistant builder that lets you create intelligent chatbots for WhatsApp without any coding. Your AI assistant can handle FAQs, qualify leads, book appointments, and hand off to human agents when needed. Learn more on our AI WhatsApp Assistant page.",
  },
  {
    question: "Does Intelli provide API access for developers?",
    answer:
      "Yes. Intelli provides full REST API access, webhooks for real-time events, and an Embedded Signup SDK that lets your users connect their WhatsApp Business Account inside your application. You get API endpoints for sending messages, managing templates, handling contacts, and retrieving analytics. Check our documentation at /docs/api-reference for full details.",
  },
  {
    question: "What message types does the WhatsApp API support?",
    answer:
      "The WhatsApp Cloud API supports four message categories: Marketing messages (promotions, offers, abandoned cart reminders), Utility messages (order confirmations, delivery updates, payment receipts), Authentication messages (OTPs and verification codes), and Service messages (customer-initiated support conversations). Marketing, Utility, and Authentication messages require pre-approved templates.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function WhatsAppAPIPage() {
  return (
    <div className="relative">
      <Navbar />

      {/* FAQ JSON-LD Structured Data */}
      <FAQPageJsonLd faqs={faqItems} />

      <main className="pt-20">
        <article className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* HERO                                                       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24 text-center">
              <div className="flex justify-center mb-8">
                <Image
                  src="/meta_techprovider_badge.webp"
                  alt="Meta Business Tech Provider Badge — Intelli is an official Meta WhatsApp Cloud API partner"
                  width={200}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  WhatsApp Cloud API Provider
                </span>
              </div>

              <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[780px] mx-auto mb-6">
                WhatsApp Business API &amp; Cloud API — Connect, Automate &amp; Scale
              </h1>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mx-auto mb-10">
                Intelli is an official Meta Tech Provider that gives developer teams and businesses full access
                to the WhatsApp Cloud API. Use our Embedded Signup flow, REST APIs, webhooks, and documentation
                to integrate WhatsApp messaging into your product — or use our ready-made dashboard for
                non-technical teams. Looking for a no-code solution?{" "}
                <Link href="/whatsapp-assistant" className="text-[#007fff] hover:underline">
                  Try the AI WhatsApp Assistant
                </Link> instead.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/auth/sign-up"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                >
                  Get Started Free
                </Link>
                <a
                  href="https://cal.com/intelli-demo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  Book a Demo <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* WHAT IS THE WHATSAPP CLOUD API?                            */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Overview
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-8">
                What is the WhatsApp Cloud API?
              </h2>

              <div className="max-w-[680px] space-y-5">
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  The <strong>WhatsApp Cloud API</strong> is Meta&apos;s official interface that lets businesses send and receive
                  messages on WhatsApp at scale. Unlike the free WhatsApp Business App (designed for one person on one phone),
                  the Cloud API is built for teams — it supports multiple agents, automated workflows, rich media messages,
                  and integrations with CRMs, helpdesks, and e-commerce platforms.
                </p>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  Meta deprecated the older On-Premise API in October 2025, making the <strong>WhatsApp Cloud API</strong> the
                  only supported path forward. The Cloud API is hosted entirely by Meta, so there are no servers to manage — you
                  just need a <strong>WhatsApp Business Solution Provider</strong> (BSP) like Intelli to give you a dashboard,
                  inbox, and tools on top of it.
                </p>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  With over 2 billion users on WhatsApp globally and open rates above 90%, the WhatsApp Business API
                  is the most effective channel for customer engagement — especially in Africa, Southeast Asia, and Latin
                  America where WhatsApp is the dominant messaging platform. Whether you need to send marketing campaigns,
                  order confirmations, appointment reminders, or provide real-time customer support, the API handles it all.
                </p>
              </div>

              <div className="mt-8 flex items-start gap-3 border border-[#1a1a1a]/[0.08] rounded-md p-5">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
                    Important
                  </p>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                    The WhatsApp Cloud API doesn&apos;t come with a chat interface. You need a platform
                    like Intelli to manage messages, build automations, and view analytics. We provide the
                    complete dashboard so your team can start working immediately.
                  </p>
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* CLOUD API vs BUSINESS APP                                  */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Comparison
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                WhatsApp Cloud API vs WhatsApp Business App
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-10">
                Not sure which WhatsApp solution fits your business? Here&apos;s a side-by-side comparison
                to help you decide.
              </p>

              <div className="overflow-x-auto border border-[#1a1a1a]/[0.08] rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]/[0.08] bg-[#fafafa]">
                      <th className="text-left p-4 font-bold text-[#1a1a1a]">Feature</th>
                      <th className="text-center p-4 font-bold text-[#1a1a1a]">
                        <div className="flex items-center justify-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-green-600" />
                          Business App
                        </div>
                      </th>
                      <th className="text-center p-4 font-bold text-[#1a1a1a]">
                        <div className="flex items-center justify-center gap-1.5">
                          <Server className="w-4 h-4 text-blue-600" />
                          Cloud API via Intelli
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Best for", app: "Small businesses", api: "Growing & enterprise businesses" },
                      { feature: "Multi-agent access", app: "1 phone, up to 4 devices", api: "Unlimited team members" },
                      { feature: "Broadcast limit", app: "256 contacts per list", api: "Unlimited (tier-based)" },
                      { feature: "Automation / Chatbot", app: "Quick replies only", api: "Full AI chatbot + flow builder" },
                      { feature: "API integrations", app: "None", api: "CRM, helpdesk, e-commerce, webhooks" },
                      { feature: "Message volume", app: "Low volume", api: "High volume, scalable" },
                      { feature: "AI-powered assistant", app: "Not available", api: "Built-in with Intelli" },
                      { feature: "Analytics & reporting", app: "Basic", api: "Comprehensive dashboard" },
                      { feature: "Multiple phone numbers", app: "1 number only", api: "2 – 8+ numbers with Intelli plans" },
                      { feature: "Template management", app: "Limited", api: "Full CRUD with preview" },
                      { feature: "Blue tick verification", app: "Paid, easy to get", api: "Free via Meta approval" },
                      { feature: "Cost", app: "Free (limited features)", api: "From $35/month with Intelli" },
                    ].map((row, i, arr) => (
                      <tr key={row.feature} className={i < arr.length - 1 ? "border-b border-[#1a1a1a]/[0.08]" : ""}>
                        <td className="p-4 font-medium text-[#1a1a1a]">{row.feature}</td>
                        <td className="p-4 text-center text-[#1a1a1a]/55">{row.app}</td>
                        <td className="p-4 text-center text-[#1a1a1a]/70 font-medium">{row.api}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[13px] text-[#1a1a1a]/40 mt-4">
                The WhatsApp Business App is great for solo operators. But if you need team collaboration,
                automation, or scale, the Cloud API via a provider like Intelli is the way to go.
              </p>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* WHY CHOOSE INTELLI                                         */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Why Intelli
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                Why Choose Intelli as Your WhatsApp API Provider
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-10">
                Intelli provides developer teams with everything needed to integrate WhatsApp into their
                product — from Embedded Signup to production-ready APIs. Here&apos;s what you get.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Zap,
                    title: "Embedded Signup SDK",
                    desc: "Let your users connect their WhatsApp Business Account directly inside your app using Intelli's Embedded Signup flow powered by Meta's SDK. No manual configuration needed.",
                    color: "text-orange-600",
                  },
                  {
                    icon: Globe,
                    title: "REST API & Webhooks",
                    desc: "Full API access for sending messages, managing templates, handling contacts, and receiving real-time webhook events. Integrate WhatsApp into any stack.",
                    color: "text-teal-600",
                  },
                  {
                    icon: Bot,
                    title: "AI Assistant APIs",
                    desc: "Programmatically create and manage AI-powered chatbots. Use our API to build, train, and deploy WhatsApp assistants — or let non-technical teams use the visual builder.",
                    color: "text-blue-600",
                  },
                  {
                    icon: Users,
                    title: "Multi-Tenant Architecture",
                    desc: "Built for SaaS and agencies. Each organization gets isolated WhatsApp Business Account configs, separate app services, and scoped analytics.",
                    color: "text-violet-600",
                  },
                  {
                    icon: BarChart3,
                    title: "Analytics & Reporting API",
                    desc: "Access message delivery rates, conversation metrics, and campaign performance via API. Build custom dashboards or use our built-in analytics.",
                    color: "text-emerald-600",
                  },
                  {
                    icon: Shield,
                    title: "Meta Compliant & Secure",
                    desc: "Fully compliant with Meta's policies including 2026 AI chatbot disclosure requirements. Enterprise-grade security with organization-scoped data isolation.",
                    color: "text-red-600",
                  },
                ].map((item) => (
                  <div key={item.title} className="border border-[#1a1a1a]/[0.08] rounded-md p-6">
                    <item.icon className={`w-5 h-5 ${item.color} mb-3`} />
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-2">{item.title}</h3>
                    <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">{item.desc}</p>
                  </div>
                ))}
              </div>

            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* FEATURES                                                   */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Features
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                WhatsApp Cloud API Features with Intelli
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-10">
                Everything your developer team needs to build on top of WhatsApp — from API access
                and template management to AI-powered automation and analytics.
              </p>

              <div className="space-y-8">
                {[
                  {
                    title: "Template Management",
                    desc: "Create, edit, and manage WhatsApp message templates directly from Intelli. Preview templates before submission, track approval status, and organize by category (marketing, utility, authentication). No need to use Meta's Business Manager for template work.",
                  },
                  {
                    title: "Broadcast Campaigns",
                    desc: "Send targeted campaigns to thousands of contacts at once. Segment your audience by tags, custom fields, or import lists. Schedule broadcasts for optimal delivery times and track open rates, delivery status, and click-throughs in real time.",
                  },
                  {
                    title: "AI-Powered Chatbot",
                    desc: "Build intelligent WhatsApp assistants using our visual flow builder — no coding required. Your AI chatbot can answer FAQs, collect customer information, qualify leads, process orders, and seamlessly hand off to human agents when needed. Learn more about our AI WhatsApp Assistant.",
                    link: { href: "/whatsapp-assistant", text: "AI WhatsApp Assistant" },
                  },
                  {
                    title: "Shared Team Inbox",
                    desc: "Your entire team can respond to WhatsApp messages from one dashboard. Assign conversations to specific agents, add internal notes, use canned responses for speed, and see who's handling what in real time. No more fighting over one phone.",
                  },
                  {
                    title: "Multiple Phone Numbers",
                    desc: "Connect multiple WhatsApp numbers under one account — perfect for businesses with regional numbers, department-specific lines, or separate brands. Intelli's mid-enterprise plans support 2 to 8+ numbers with unified analytics.",
                  },
                  {
                    title: "Analytics & Reporting",
                    desc: "Monitor message delivery rates, response times, agent performance, conversation volumes, and campaign ROI. Export reports and use data to optimize your WhatsApp strategy over time.",
                  },
                  {
                    title: "Webhook & API Integration",
                    desc: "Connect Intelli to your existing tools — CRMs, helpdesks, e-commerce platforms, and custom applications. Use webhooks for real-time event notifications and our API for advanced automation workflows.",
                  },
                ].map((item) => (
                  <div key={item.title} className="border-b border-[#1a1a1a]/[0.08] pb-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.title}</h3>
                    <p className="text-[14px] text-[#1a1a1a]/60 leading-[1.7] max-w-[640px]">
                      {item.desc}
                      {item.link && (
                        <>
                          {" "}
                          <Link href={item.link.href} className="text-[#007fff] hover:underline">
                            {item.link.text} →
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* PRICING                                                    */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Pricing
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                WhatsApp Cloud API Pricing
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[640px] mb-10">
                WhatsApp API pricing has two components: <strong>Meta&apos;s per-message fees</strong> (charged by WhatsApp
                based on the recipient&apos;s country) and your <strong>platform subscription</strong> (charged by
                your BSP — that&apos;s us). Here&apos;s the complete breakdown.
              </p>

              {/* Meta Per-Message Costs */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
                  1. Meta Per-Message Fees (WhatsApp Charges)
                </h3>
                <p className="text-[14px] text-[#1a1a1a]/55 leading-[1.7] max-w-[600px] mb-6">
                  Since July 2025, Meta charges a flat per-message fee (no more conversation-based pricing).
                  Costs depend on the <strong>message category</strong> and the <strong>recipient&apos;s country</strong>.
                  Service messages within the 24-hour customer-initiated window are free.
                </p>

                <div className="overflow-x-auto border border-[#1a1a1a]/[0.08] rounded-md mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1a1a]/[0.08] bg-[#fafafa]">
                        <th className="text-left p-4 font-bold text-[#1a1a1a]">Region</th>
                        <th className="text-center p-4 font-bold text-[#1a1a1a]">Marketing</th>
                        <th className="text-center p-4 font-bold text-[#1a1a1a]">Utility</th>
                        <th className="text-center p-4 font-bold text-[#1a1a1a]">Authentication</th>
                        <th className="text-center p-4 font-bold text-[#1a1a1a]">Service</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { region: "Rest of Africa", marketing: "$0.032", utility: "$0.007", auth: "$0.007", service: "$0.002" },
                        { region: "Nigeria", marketing: "$0.072", utility: "$0.012", auth: "$0.012", service: "$0.002" },
                        { region: "South Africa", marketing: "$0.052", utility: "$0.012", auth: "$0.012", service: "$0.002" },
                        { region: "Egypt", marketing: "$0.150", utility: "$0.009", auth: "$0.009", service: "$0.002" },
                      ].map((row, i, arr) => (
                        <tr key={row.region} className={i < arr.length - 1 ? "border-b border-[#1a1a1a]/[0.08]" : ""}>
                          <td className="p-4 font-medium text-[#1a1a1a]">{row.region}</td>
                          <td className="p-4 text-center text-[#1a1a1a]/70">{row.marketing}</td>
                          <td className="p-4 text-center text-[#1a1a1a]/70">{row.utility}</td>
                          <td className="p-4 text-center text-[#1a1a1a]/70">{row.auth}</td>
                          <td className="p-4 text-center text-[#1a1a1a]/70">{row.service}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[13px] text-[#1a1a1a]/40 mb-2">
                  Prices in USD per message. Rates are set by Meta and may change. Pricing is based on the recipient&apos;s
                  country code, not the sender&apos;s location.
                </p>

                {/* Message category explanations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="border border-[#1a1a1a]/[0.08] rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-bold text-[#1a1a1a]">Marketing</h4>
                    </div>
                    <p className="text-[12px] text-[#1a1a1a]/50 leading-[1.6]">
                      Promotions, offers, product suggestions, abandoned cart reminders, and re-engagement campaigns.
                      Requires a pre-approved template.
                    </p>
                  </div>
                  <div className="border border-[#1a1a1a]/[0.08] rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-bold text-[#1a1a1a]">Utility</h4>
                    </div>
                    <p className="text-[12px] text-[#1a1a1a]/50 leading-[1.6]">
                      Order confirmations, delivery updates, payment receipts, and appointment reminders.
                      Triggered by a user action. Requires a template.
                    </p>
                  </div>
                  <div className="border border-[#1a1a1a]/[0.08] rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <h4 className="text-sm font-bold text-[#1a1a1a]">Authentication</h4>
                    </div>
                    <p className="text-[12px] text-[#1a1a1a]/50 leading-[1.6]">
                      One-time passwords (OTPs) and verification codes for login, transaction confirmation,
                      and account recovery. Requires a template.
                    </p>
                  </div>
                  <div className="border border-[#1a1a1a]/[0.08] rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <h4 className="text-sm font-bold text-[#1a1a1a]">Service</h4>
                    </div>
                    <p className="text-[12px] text-[#1a1a1a]/50 leading-[1.6]">
                      Customer-initiated support conversations. When a customer messages you, a 24-hour
                      service window opens during which you can reply freely. No template needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Intelli Platform Plans */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
                  2. Intelli Platform Subscription
                </h3>
                <p className="text-[14px] text-[#1a1a1a]/55 leading-[1.7] max-w-[600px] mb-6">
                  On top of Meta&apos;s messaging fees, you pay Intelli for the platform, tools, and support.
                  One-time setup fee: <strong>$50 – $150</strong> (depending on complexity).
                </p>

                {/* Basic Plans */}
                <h4 className="text-base font-bold text-[#1a1a1a] mb-4">Basic Plans</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { name: "Broadcast Only", price: "$20", period: "/month", features: ["WhatsApp broadcast module", "Up to 2,000 contacts", "Template management"] },
                    { name: "Basic", price: "$35", period: "/month", features: ["AI / Chatbot flow builder", "1 team member", "Up to 2,000 contacts", "Team inbox"] },
                    { name: "Grow", price: "$55", period: "/month", features: ["AI / Chatbot flow builder", "2 team members", "Up to 10,000 contacts", "Team inbox + analytics"], popular: true },
                    { name: "Pro", price: "$75", period: "/month", features: ["AI / Chatbot flow builder", "3 team members", "Up to 100,000 contacts", "Full analytics suite"] },
                  ].map((plan) => (
                    <div key={plan.name} className={`border rounded-md p-5 ${plan.popular ? "border-[#007fff] ring-1 ring-[#007fff]/20" : "border-[#1a1a1a]/[0.08]"}`}>
                      {plan.popular && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#007fff] mb-2 block">Most Popular</span>
                      )}
                      <h5 className="text-base font-bold text-[#1a1a1a] mb-1">{plan.name}</h5>
                      <p className="text-2xl font-bold text-[#1a1a1a] mb-4">
                        {plan.price}<span className="text-sm font-normal text-[#1a1a1a]/40">{plan.period}</span>
                      </p>
                      <ul className="space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[12px] text-[#1a1a1a]/60 leading-[1.5]">
                            <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Enterprise Plans */}
                <h4 className="text-base font-bold text-[#1a1a1a] mb-4">Mid-Enterprise Plans</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { name: "Elite", price: "$86", period: "/month", features: ["Unlimited contacts", "2 WhatsApp numbers", "5 – 10 team members", "Priority support"] },
                    { name: "Scale", price: "$108", period: "/month", features: ["Unlimited contacts", "5 WhatsApp numbers", "10 – 15 team members", "Priority support"] },
                    { name: "Legacy", price: "$214", period: "/month", features: ["Unlimited contacts", "8 WhatsApp numbers", "15 – 20 team members", "Dedicated account manager"] },
                  ].map((plan) => (
                    <div key={plan.name} className="border border-[#1a1a1a]/[0.08] rounded-md p-5">
                      <h5 className="text-base font-bold text-[#1a1a1a] mb-1">{plan.name}</h5>
                      <p className="text-2xl font-bold text-[#1a1a1a] mb-4">
                        {plan.price}<span className="text-sm font-normal text-[#1a1a1a]/40">{plan.period}</span>
                      </p>
                      <ul className="space-y-2">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[12px] text-[#1a1a1a]/60 leading-[1.5]">
                            <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Add-ons */}
                <h4 className="text-base font-bold text-[#1a1a1a] mb-4">Add-ons</h4>
                <div className="overflow-x-auto border border-[#1a1a1a]/[0.08] rounded-md">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        { addon: "Extra team member seat", price: "$5/month" },
                        { addon: "Website chat channel", price: "$15/month" },
                        { addon: "1 million AI credits", price: "$9 (one-time)" },
                        { addon: "Instagram channel", price: "$20/month" },
                        { addon: "Messenger channel", price: "$20/month" },
                      ].map((row, i, arr) => (
                        <tr key={row.addon} className={i < arr.length - 1 ? "border-b border-[#1a1a1a]/[0.08]" : ""}>
                          <td className="p-4 font-medium text-[#1a1a1a]">{row.addon}</td>
                          <td className="p-4 text-right text-[#1a1a1a]/70 font-medium">{row.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                >
                  See Full Pricing
                </Link>
                <Link
                  href="/whatsapp-broadcast"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  Calculate broadcast costs <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* GETTING STARTED                                            */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Get Started
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                How to Get Started with WhatsApp Cloud API
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-10">
                Whether you&apos;re integrating via API or using the dashboard, getting set up
                with WhatsApp Cloud API through Intelli is straightforward. Most teams are
                live within 24 hours.
              </p>

              <div className="space-y-0">
                {[
                  {
                    step: "01",
                    title: "Create Your Intelli Account & Organization",
                    desc: "Sign up at intelliconcierge.com. Set up your organization — this scopes all your WhatsApp data, team members, and API keys.",
                  },
                  {
                    step: "02",
                    title: "Connect via Embedded Signup",
                    desc: "Use Intelli's Embedded Signup flow (powered by Meta's SDK) to link your Meta Business Account and register a WhatsApp phone number. The whole process takes about 5 minutes.",
                  },
                  {
                    step: "03",
                    title: "Get Your API Credentials",
                    desc: "Once connected, you'll receive your access token, phone number ID, and WhatsApp Business Account ID. Use these to authenticate API calls or configure webhooks.",
                  },
                  {
                    step: "04",
                    title: "Create & Submit Templates",
                    desc: "Design message templates via the dashboard or API. Submit for Meta approval — most templates are approved within minutes. Templates are required for marketing, utility, and authentication messages.",
                  },
                  {
                    step: "05",
                    title: "Start Building",
                    desc: "Send messages via the API, set up webhook listeners for inbound messages, or use the dashboard for no-code operations. Refer to our documentation for API reference, SDKs, and code examples.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-6 py-6 border-b border-[#1a1a1a]/[0.08]">
                    <span className="text-sm text-[#007fff] font-bold tabular-nums shrink-0 pt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#1a1a1a] mb-1">{item.title}</h3>
                      <p className="text-[14px] text-[#1a1a1a]/55 leading-[1.7] max-w-[520px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  href="/auth/sign-up"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/docs/get-started/connect-whatsapp"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff] hover:text-white transition-colors"
                >
                  Read the Documentation <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/docs/api-reference"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  API Reference <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* FAQ                                                        */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  FAQ
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-14">
                Frequently Asked Questions
              </h2>

              <WhatsAppApiFaq faqs={faqItems} />
            </section>

          </div>
        </article>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CTA BANNER                                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <Banner
            title="Ready to Scale Your WhatsApp Communication?"
            subtitle="Join businesses already using WhatsApp Business API with Intelli's AI-powered multi-channel platform. Setup takes less than 24 hours."
            primaryButton={{
              text: "Get Started with API",
              href: "/auth/sign-up",
            }}
            secondaryButton={{
              text: "Book a Demo",
              href: "https://cal.com/intelli-demo/",
              external: true,
            }}
          />
        </section>

        <FooterComponent />
      </main>
    </div>
  );
}
