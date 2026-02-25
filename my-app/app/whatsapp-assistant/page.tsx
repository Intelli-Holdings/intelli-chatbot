import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import Banner from "@/components/signup-banner";
import { Bot, MessageSquare, Users, Clock, ArrowRight, Workflow, ShieldCheck, Headphones } from "lucide-react";
import Link from "next/link";
import { getCanonicalUrl } from "@/lib/metadata";
import WhatsAppDemo from "./whatsapp-demo";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title:
    "AI WhatsApp Assistant — Automate Customer Conversations | Intelli",
  description:
    "Deploy an AI-powered WhatsApp assistant that handles customer inquiries, books appointments, and provides support 24/7. Built on the WhatsApp Cloud API, fully compliant with Meta's 2026 AI policies.",
  alternates: {
    canonical: getCanonicalUrl("/whatsapp-assistant"),
  },
  openGraph: {
    title: "AI WhatsApp Assistant — Automate Customer Conversations | Intelli",
    description:
      "Deploy an AI-powered WhatsApp assistant that handles customer inquiries, books appointments, and provides support 24/7. Built on the WhatsApp Cloud API.",
    url: getCanonicalUrl("/whatsapp-assistant"),
    type: "website",
    images: [
      {
        url: "https://www.intelliconcierge.com/api/og",
        width: 1200,
        height: 630,
        alt: "Intelli AI WhatsApp Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI WhatsApp Assistant — Automate Customer Conversations | Intelli",
    description:
      "Deploy an AI-powered WhatsApp assistant that handles customer inquiries, books appointments, and provides support 24/7.",
  },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function WhatsAppAssistantPage() {
  return (
    <div className="relative">
      <Navbar />

      <main className="pt-20">
        <article className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* HERO                                                       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-2 mb-8">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                      AI WhatsApp Assistant
                    </span>
                  </div>

                  <h1 className="text-[clamp(32px,4.5vw,52px)] font-bold text-[#1a1a1a] leading-[1.1] mb-6">
                    AI-Powered WhatsApp Assistant for Your Business
                  </h1>

                  <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[480px] mb-8">
                    Deploy an intelligent AI assistant on WhatsApp that handles customer inquiries,
                    qualifies leads, books appointments, and provides 24/7 support — without writing
                    a single line of code. Built on the{" "}
                    <Link href="/whatsapp-api" className="text-[#007fff] hover:underline">
                      WhatsApp Cloud API
                    </Link>
                    , fully compliant with Meta&apos;s 2026 AI chatbot policies.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/auth/sign-up"
                      className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                    >
                      Build Your Assistant
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
                </div>

                {/* Live QR Demo */}
                <WhatsAppDemo />
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* WHAT IS AN AI WHATSAPP ASSISTANT?                          */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Overview
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-8">
                What is an AI WhatsApp Assistant?
              </h2>

              <div className="max-w-[680px] space-y-5">
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  An <strong>AI WhatsApp assistant</strong> is an automated chatbot that runs on the{" "}
                  <Link href="/whatsapp-api" className="text-[#007fff] hover:underline">WhatsApp Business API</Link>{" "}
                  and uses artificial intelligence to have natural conversations with your customers. Unlike
                  simple keyword-based bots, an AI assistant understands context, handles complex queries,
                  and can perform actions like booking appointments, collecting customer information,
                  and routing conversations to the right team member.
                </p>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  With Intelli, you can build and deploy a WhatsApp AI chatbot without any coding.
                  Our visual flow builder lets you design conversation paths, connect to your knowledge
                  base, and set up intelligent handoffs to human agents — all from a simple drag-and-drop
                  interface. Your assistant works 24/7, responds instantly, and can handle thousands of
                  conversations simultaneously.
                </p>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  WhatsApp has over 2 billion users globally, with open rates above 90% — far higher
                  than email or SMS. By deploying an AI assistant on WhatsApp, you meet customers
                  where they already spend their time, provide instant support, and free your team
                  to focus on high-value conversations that require a human touch.
                </p>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* HOW IT WORKS                                               */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  How It Works
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                How the AI WhatsApp Assistant Works
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-10">
                From first message to resolution — here&apos;s how Intelli&apos;s AI assistant handles
                customer conversations on WhatsApp.
              </p>

              <div className="space-y-0">
                {[
                  {
                    step: "01",
                    title: "Customer Sends a Message",
                    desc: "A customer reaches out on WhatsApp with a question, complaint, or request. The AI assistant receives the message instantly — no wait times, no queue.",
                  },
                  {
                    step: "02",
                    title: "AI Understands the Intent",
                    desc: "The assistant analyzes the message using natural language processing to understand what the customer needs. It recognizes context, handles follow-up questions, and supports multiple languages.",
                  },
                  {
                    step: "03",
                    title: "Responds or Takes Action",
                    desc: "Based on the intent, the AI responds with an answer from your knowledge base, asks qualifying questions, collects information (name, email, phone), or triggers an action like booking an appointment.",
                  },
                  {
                    step: "04",
                    title: "Hands Off When Needed",
                    desc: "For complex issues that need a human touch, the AI seamlessly transfers the conversation to an available agent in your team inbox — with full conversation history so the customer doesn't have to repeat themselves.",
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
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* USE CASES                                                  */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Use Cases
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                What Can Your AI Assistant Do?
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-10">
                From customer support to lead generation — here are the most common ways
                businesses use Intelli&apos;s AI WhatsApp assistant.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Headphones,
                    title: "24/7 Customer Support",
                    desc: "Answer common questions instantly, any time of day. Reduce response times from hours to seconds and handle unlimited simultaneous conversations.",
                    color: "text-blue-600",
                  },
                  {
                    icon: Users,
                    title: "Lead Qualification",
                    desc: "Automatically collect contact details, ask qualifying questions, and score leads before passing them to your sales team. No more manual data entry.",
                    color: "text-violet-600",
                  },
                  {
                    icon: Clock,
                    title: "Appointment Booking",
                    desc: "Let customers schedule appointments, consultations, or demos directly through WhatsApp. Sync with your calendar and send automated reminders.",
                    color: "text-emerald-600",
                  },
                  {
                    icon: MessageSquare,
                    title: "FAQ Automation",
                    desc: "Train your assistant on your business knowledge base. It handles the repetitive questions so your team can focus on complex, high-value conversations.",
                    color: "text-orange-600",
                  },
                  {
                    icon: Workflow,
                    title: "Order Status & Updates",
                    desc: "Customers can check order status, track deliveries, and get real-time updates through WhatsApp — all handled automatically by your AI assistant.",
                    color: "text-cyan-600",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Complaint Resolution",
                    desc: "Capture complaints, categorize them, collect relevant details, and escalate to the right department — with full context preserved for faster resolution.",
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
            {/* KEY FEATURES                                               */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Features
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                Built for Businesses, Not Developers
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-10">
                You don&apos;t need technical skills to create a powerful WhatsApp AI chatbot.
                Intelli&apos;s assistant builder is designed for business teams.
              </p>

              <div className="space-y-8">
                {[
                  {
                    title: "Visual Flow Builder",
                    desc: "Design conversation flows with a drag-and-drop interface. Add conditions, branches, and actions — see exactly how your assistant will respond before going live. No coding required.",
                  },
                  {
                    title: "AI Knowledge Base",
                    desc: "Upload your FAQs, product information, and support docs. The AI assistant uses this knowledge to answer customer questions accurately and naturally, drawing from your specific business context.",
                  },
                  {
                    title: "Smart Human Handoff",
                    desc: "Set rules for when conversations should be transferred to a human agent. The handoff is seamless — the agent sees the full AI conversation history and can pick up right where the bot left off.",
                  },
                  {
                    title: "Custom Fields & Data Collection",
                    desc: "Collect structured data from customers during conversations — names, emails, phone numbers, preferences, or any custom field. Data flows directly into your contact database for segmentation and follow-up.",
                  },
                  {
                    title: "Multi-Language Support",
                    desc: "Your AI assistant understands and responds in multiple languages, making it perfect for businesses serving diverse, multilingual customer bases across Africa and beyond.",
                  },
                  {
                    title: "Meta Policy Compliant",
                    desc: "Intelli's AI assistants are fully compliant with Meta's 2026 AI chatbot disclosure requirements. Customers are clearly informed when they're chatting with an AI, keeping your WhatsApp Business account safe.",
                  },
                ].map((item) => (
                  <div key={item.title} className="border-b border-[#1a1a1a]/[0.08] pb-6">
                    <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.title}</h3>
                    <p className="text-[14px] text-[#1a1a1a]/60 leading-[1.7] max-w-[640px]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* GET STARTED                                                */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Get Started
                </span>
              </div>

              <h2 className="text-[clamp(28px,3.5vw,44px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-6">
                Ready to Deploy Your AI WhatsApp Assistant?
              </h2>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[600px] mb-8">
                Get started with Intelli in minutes. Connect your{" "}
                <Link href="/whatsapp-api" className="text-[#007fff] hover:underline">WhatsApp Cloud API</Link>
                , build your AI assistant, and start automating conversations today.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/sign-up"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                >
                  Create Your Account
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  See Pricing <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  href="/docs/get-started/connect-whatsapp"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  Setup Guide <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </section>

          </div>
        </article>

        {/* CTA Banner */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <Banner
            title="Automate Your WhatsApp Customer Support"
            subtitle="Deploy an AI assistant that handles inquiries 24/7, qualifies leads, and hands off to your team when needed. Built on the WhatsApp Cloud API."
            primaryButton={{
              text: "Build Your Assistant",
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
