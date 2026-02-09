"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "What are the steps involved in creating a fully functional Intelli account?",
    answer: (
      <div className="space-y-3">
        <p>To create a fully functional Intelli account, you will need the following:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>A Facebook Business account</li>
          <li>Phone number</li>
          <li>Business verification documents</li>
        </ul>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Business documents from your local government</li>
          <li>Address proof</li>
          <li>Official company website</li>
          <li>Business email (same domain as the website above)</li>
        </ol>
      </div>
    ),
  },
  {
    question: "What is a flow?",
    answer:
      "A flow is a customer journey you can build using our no-code flow builder. It is the best automation tool for creating conversation paths, qualifying leads, and routing customers — all without writing a single line of code.",
  },
  {
    question: "What is a Customer Service Window / Session Window?",
    answer:
      "A messaging session window starts when a user sends your WhatsApp Business Number a message and lasts for 24 hours from the most recently received message. You can intervene/respond with ANY kind of message within these 24 hours.",
  },
  {
    question: "What happens after my free trial?",
    answer:
      "After your 7-day free trial ends, you can choose a plan that fits your needs. If you don't select a plan, your account will be paused but your data will be preserved. You can reactivate at any time by subscribing to a plan.",
  },
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, the new features are available immediately and billing is prorated. When downgrading, the change takes effect at the start of your next billing cycle.",
  },
  {
    question: "What counts as a message credit?",
    answer:
      "A message credit is consumed each time the AI processes and responds to a customer message. Simple automated replies (like welcome messages or quick replies) don't consume credits. Credits reset at the start of each billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: (
      <>We accept payments from all debit and credit cards. You can also pay through bank transfers if you choose an annual plan. Please reach out to <a href="mailto:support@intelliconcierge.com" className="text-[#007fff] underline hover:text-[#006ad9]">support@intelliconcierge.com</a> for more information.</>
    ),
  },
  {
    question: "Is there a limit on team members?",
    answer:
      "Each plan includes 1 team member seat. Additional seats can be added for $5 per month per member. Enterprise plans come with custom team member allocations based on your organization's needs.",
  },
  {
    question: "What kind of support is included?",
    answer:
      "All plans include email support. The WhatsApp AI Assistant plan includes priority email support, and Enterprise plans come with a dedicated account manager plus premium phone support. You can also add Technical Account Management as an add-on.",
  },
];

export default function PricingFaq() {
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </h3>
          <p className="text-gray-600">
            Everything you need to know about our pricing and plans.
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm"
            >
              <AccordionTrigger className="text-left text-base font-medium text-gray-900 hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
