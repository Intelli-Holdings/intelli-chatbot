"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * AEO FAQ Section using the Accordion UI component.
 *
 * Wraps FAQ data in an accessible, collapsible accordion while
 * preserving semantic markup for answer engine extraction.
 * Use alongside <FAQPageJsonLd> for structured data.
 */

interface FAQItem {
  question: string;
  answer: string;
}

export function AeoFaqSection({
  faqs,
  className,
}: {
  faqs: FAQItem[];
  className?: string;
}) {
  return (
    <Accordion type="single" collapsible className={className ?? "space-y-3"}>
      {faqs.map((faq, index) => (
        <AccordionItem
          key={`faq-${index}`}
          value={`faq-${index}`}
          className="bg-white border border-gray-200 rounded-xl px-6 shadow-sm"
        >
          <AccordionTrigger className="text-left text-base font-semibold text-gray-900 hover:no-underline py-5">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-700 pb-5 leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
