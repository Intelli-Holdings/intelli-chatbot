"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

export function WhatsAppApiFaq({ faqs }: { faqs: FAQItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((item, i) => (
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
  );
}
