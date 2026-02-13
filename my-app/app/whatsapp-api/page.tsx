"use client";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import Banner from "@/components/signup-banner";
import { Check, X, AlertTriangle, Smartphone, Server } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

const comparisonRows = [
  { feature: "Best for", app: "Small businesses", api: "Medium to large businesses" },
  { feature: "Number of Users", app: "1 phone (single device)", api: "Unlimited" },
  { feature: "Broadcast Limit", app: "256 contacts per broadcast", api: "Unlimited (tier-based)" },
  { feature: "Automation Capabilities", app: "Limited", api: "Advanced AI and automation" },
  {
    feature: "Third-party Integrations",
    app: { value: false },
    api: { value: true },
  },
  {
    feature: "Voice Call Support",
    app: { value: true },
    api: { value: true, note: "Coming soon on Intelli" },
  },
  {
    feature: "Blue Tick Verification",
    app: { value: true, note: "Paid, easy to get" },
    api: { value: true, note: "Free, requires Meta approval" },
  },
  {
    feature: "Reports/Analytics",
    app: { value: false },
    api: { value: true },
  },
  { feature: "Lead Management", app: "Basic tags", api: "Manage entire customer lifecycle" },
];

const faqItems = [
  {
    question: "What is the WhatsApp Business API?",
    answer:
      "It's a tool made for medium to large businesses to talk to customers on WhatsApp at scale. Unlike the WhatsApp Business App, it has no chat screen — you connect it to a platform like Intelli to manage everything.",
  },
  {
    question: "Do I need a special setup to use it?",
    answer:
      "Yes. You need a Meta Business account, a phone number not linked to WhatsApp, and a Meta Tech provider like Intelli to connect and manage it. We'll guide you through the setup.",
  },
  {
    question: "Is WhatsApp API free?",
    answer:
      "No, but there are no hidden fees with Intelli. You only pay Meta's messaging charges and Intelli's monthly plan.",
  },
  {
    question: "How many team members can use it?",
    answer:
      "With Intelli, you can start small and add more users anytime. No limits, just pay for what you need.",
  },
  {
    question: "Can I automate responses with Intelli?",
    answer:
      "Yes. Intelli lets you build smart AI assistants, handle FAQs, collect info, and even assist live agents.",
  },
  {
    question: "Can Intelli connect with my CRM or tools like Google Sheets?",
    answer:
      "Absolutely. Intelli integrates with CRMs, Google Sheets, and more — all in a few clicks.",
  },
  {
    question: "Can I move from WhatsApp Business App to the API?",
    answer:
      "Yes, but you'll need a new phone number for now. Migration from an existing number will be possible soon.",
  },
  {
    question: "Will my contacts and messages move over too?",
    answer:
      "Not yet, but don't worry — you can import contacts into Intelli, and old chats will still be saved on your original device.",
  },
];

export default function WhatsAppAPIPage() {
  return (
    <div className="relative">
      <Navbar />

      <main className="pt-20">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">

            {/* ═══════════════════════════════════════════════════════ */}
            {/* HERO                                                    */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24 text-center">
              {/* Meta badge */}
              <div className="flex justify-center mb-8">
                <Image
                  src="/meta_techprovider_badge.webp"
                  alt="Meta Business Tech Provider Badge"
                  width={200}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>

              {/* Tag */}
              <div className="flex items-center justify-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  WhatsApp API
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mx-auto mb-6">
                WhatsApp Business API
              </h1>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[520px] mx-auto mb-10">
                Which WhatsApp solution is best for your business? Let&apos;s
                help you decide.
              </p>

              {/* CTA */}
              <div className="flex gap-4 justify-center">
                <a
                  href="https://intelli-app.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                >
                  Get WhatsApp API
                </a>
                <Link
                  href="/whatsapp-broadcast"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  See broadcast pricing →
                </Link>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* OVERVIEW                                                */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Overview
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                Understanding your options
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-[#1a1a1a]/[0.08]">
                <div className="py-8 sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08] sm:pr-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <h3 className="text-base font-bold text-[#1a1a1a]">
                      WhatsApp Business App
                    </h3>
                  </div>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] mb-3">
                    A free, simple mobile app best suited for individuals or
                    small businesses handling low message volumes. You can reply
                    to customers, set quick replies, and manage chats with a
                    handful of users.
                  </p>
                  <p className="text-xs font-semibold text-green-700">
                    Perfect for: Small businesses with basic needs
                  </p>
                </div>
                <div className="py-8 sm:pl-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-[#1a1a1a]">
                      WhatsApp Business API
                    </h3>
                  </div>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] mb-3">
                    A powerful, scalable solution built for growing businesses
                    that need automation, team access, and integration with other
                    tools. Perfect for handling large volumes of customer
                    conversations.
                  </p>
                  <p className="text-xs font-semibold text-blue-700">
                    Perfect for: Growing businesses needing scale
                  </p>
                </div>
              </div>

              {/* Note */}
              <div className="mt-8 flex items-start gap-3 border border-[#1a1a1a]/[0.08] rounded-md p-5">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
                    Important
                  </p>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                    The WhatsApp API doesn&apos;t come with a built-in chat
                    interface. That&apos;s why you need to connect it to a
                    WhatsApp Tech Provider like Intelli to fully manage your
                    messaging, automation, and analytics. We provide a dashboard
                    to manage messages, campaigns, and performance metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* COMPARISON TABLE                                        */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Comparison
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                Quick comparison
              </h2>

              <div className="overflow-x-auto border border-[#1a1a1a]/[0.08] rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a1a1a]/[0.08]">
                      <th className="text-left p-4 font-bold text-[#1a1a1a]">
                        Feature
                      </th>
                      <th className="text-center p-4 font-bold text-[#1a1a1a]">
                        Business App
                      </th>
                      <th className="text-center p-4 font-bold text-[#1a1a1a]">
                        Business API
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => {
                      const renderCell = (val: unknown) => {
                        if (typeof val === "string") return val;
                        if (
                          val &&
                          typeof val === "object" &&
                          "value" in val
                        ) {
                          const obj = val as { value: boolean; note?: string };
                          return (
                            <div className="text-center">
                              {obj.value ? (
                                <Check className="w-4 h-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-[#1a1a1a]/30 mx-auto" />
                              )}
                              {obj.note && (
                                <p className="text-[11px] text-[#1a1a1a]/40 mt-1">
                                  {obj.note}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      };

                      return (
                        <tr
                          key={row.feature}
                          className={
                            i < comparisonRows.length - 1
                              ? "border-b border-[#1a1a1a]/[0.08]"
                              : ""
                          }
                        >
                          <td className="p-4 font-medium text-[#1a1a1a]">
                            {row.feature}
                          </td>
                          <td className="p-4 text-center text-[#1a1a1a]/55">
                            {renderCell(row.app)}
                          </td>
                          <td className="p-4 text-center text-[#1a1a1a]/55">
                            {renderCell(row.api)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* PRICING                                                 */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Pricing
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                How much does WhatsApp Business API cost?
              </h2>

              <div className="flex gap-6 mb-8 max-w-[520px]">
                <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                  01
                </span>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  While all incoming messages and messages sent to customers
                  within a 24-hour window are free, there are two key costs to
                  consider for outgoing messages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-[#1a1a1a]/[0.08]">
                <div className="py-8 sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08] sm:pr-8">
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                    <span className="text-[#1a1a1a]/30 mr-1">1.</span> Meta Fees
                  </h3>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] mb-3">
                    Based on the recipient&apos;s country, message type, and
                    monthly volume.
                  </p>
                  <ul className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] space-y-1">
                    <li>Marketing messages</li>
                    <li>Utility messages</li>
                    <li>Authentication messages</li>
                  </ul>
                </div>
                <div className="py-8 sm:pl-8">
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                    <span className="text-[#1a1a1a]/30 mr-1">2.</span> Tech
                    Provider Fees
                  </h3>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] mb-3">
                    Setup fees depending on message tier volume and message
                    credits.
                  </p>
                  <ul className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] space-y-1">
                    <li>One-time setup fees</li>
                    <li>Monthly message credit packages</li>
                    <li>Platform management tools</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <Link
                  href="/whatsapp-broadcast"
                  className="inline-block px-6 py-3 text-sm font-semibold text-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff] hover:text-white transition-colors"
                >
                  Calculate your costs
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  See platform pricing →
                </Link>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* FAQ                                                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  FAQ
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-14">
                Frequently asked questions
              </h2>

              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-[15px] font-semibold text-[#1a1a1a] py-5">
                      <span className="text-[#1a1a1a]/30 mr-2 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] pb-5">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CTA                                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <Banner
            title="Ready to Scale Your WhatsApp Communication?"
            subtitle="Join businesses already using WhatsApp Business API with Intelli's multi-channel platform."
            primaryButton={{
              text: "Get Started with API",
              href: "https://intelli-app.com/register",
              external: true,
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
