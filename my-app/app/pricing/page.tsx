import React from "react";
import type { Metadata } from "next";
import PricingComponent from "@/components/component/pricingcomponent";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { FAQPageJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";



export const metadata: Metadata = {
  title: "Intelli Pricing – AI Customer Support Plans from $15/month",
  description:
    "Intelli pricing starts at $15/month for website chat and $35/month for WhatsApp AI. All plans include a 7-day free trial, no credit card required. Enterprise plans with custom pricing available. By Intelli Holdings Inc.",
  keywords: [
    "Intelli pricing",
    "AI chatbot pricing",
    "WhatsApp Business API cost",
    "customer support platform pricing",
    "AI helpdesk cost",
  ],
  openGraph: {
    title: "Intelli Pricing – Plans Starting at $15/month",
    description:
      "Website chat from $15/mo, WhatsApp AI from $35/mo. 7-day free trial, no credit card required.",
    url: "https://intelliconcierge.com/pricing",
  },
};


const pricingFaqs = [
  {
    question: "How much does Intelli cost?",
    answer:
      "Intelli's Website Widget plan starts at $15/month. The WhatsApp AI Assistant plan starts at $35/month with tiers up to $214/month based on contacts and team size. Enterprise plans have custom pricing. All plans include a 7-day free trial with no credit card required.",
  },
  {
    question: "Does Intelli offer a free trial?",
    answer:
      "Yes. Intelli offers a 7-day free trial for all plans. No credit card is required to start. During the trial you get full access to AI assistants, WhatsApp integration, analytics, and all platform features.",
  },
  {
    question: "What is included in Intelli's WhatsApp AI Assistant plan?",
    answer:
      "The WhatsApp AI Assistant plan includes AI-powered WhatsApp responses, live chat with a team inbox, broadcast messaging, campaign analytics, contact management, and 1,000 AI credits per month. Plans range from Basic (2,000 contacts) to Legacy (unlimited contacts).",
  },
  {
    question: "Can I cancel my Intelli subscription at any time?",
    answer:
      "Yes. All Intelli plans can be cancelled at any time. There are no long-term contracts. When you cancel, your account remains active until the end of your current billing period.",
  },
  {
    question: "Does Intelli offer annual billing discounts?",
    answer:
      "Yes. Annual billing saves you the equivalent of 2 months compared to monthly billing. For example, the Website Widget plan is $150/year instead of $180 ($15/mo x 12).",
  },
];

export default function PricingPage() {
  return (
    <div className="relative">
      <Navbar />

      {/* AEO: Pricing FAQ JSON-LD for answer engine extraction */}
      <FAQPageJsonLd faqs={pricingFaqs} />
      {/* AEO: Software pricing for rich snippets */}
      <SoftwareApplicationJsonLd />

      <main className="pt-20">
        <PricingComponent />

        <FooterComponent />
      </main>
      <ChatWidget />
    </div>
  );
}
