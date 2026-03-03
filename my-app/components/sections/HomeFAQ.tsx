"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const faqData = [
  {
    question: "What is Intelli and how does it work?",
    answer:
      "Intelli is an AI-powered customer engagement platform that automates support and sales across WhatsApp, website chat, and email. You upload your documents, train a custom AI assistant, and connect your channels — the AI handles customer conversations 24/7.",
  },
  {
    question: "Which channels does Intelli support?",
    answer:
      "Intelli supports WhatsApp Business API, website chat widgets, and email. All channels connect to a unified inbox so your team manages every conversation from one dashboard.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes, Intelli offers a 7-day free trial with no credit card required. During the trial you can create an AI assistant, connect a WhatsApp number or website widget, and test automated conversations.",
  },
  {
    question: "How does the AI assistant learn about my business?",
    answer:
      "You upload your organization's documents, FAQs, or knowledge base. Intelli trains a custom AI assistant on your data within minutes, so it gives accurate, context-specific answers in your brand voice.",
  },
  {
    question: "Can I integrate Intelli with my existing tools?",
    answer:
      "Yes, Intelli integrates with popular CRMs, helpdesks, and business tools. Our API and flow builder also let you connect to any external system with custom triggers and actions.",
  },
];

export function HomeFAQ() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              FAQ
            </span>
          </div>
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] mb-10">
            Frequently Asked Questions
          </h2>
          <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7] max-w-2xl mx-auto">
            Everything you need to know about getting started with Intelli.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-border rounded-xl px-6 shadow-sm bg-white"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
