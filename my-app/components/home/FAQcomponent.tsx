import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Can I have multiple employees on the same plan?",
    answer: "Of course, you can have multiple departments from front office to marketing and sales to social media even reservations join your team/organization."
  },
  {
    question: "How is my usage calculated?",
    answer: "Your usage is calculated based on the number of interactions of your customers with the assistant. This includes the number of messages sent and received."
  },
  {
    question: "What payment methods are allowed?",
    answer: "We embrace the global nature of business and hence use Credit cards, Mobile Money and Cash. If in the near future more payment methods are added, we shall issue a statement informing you of the change."
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a 7-day free trial for all new users. This allows you to explore our platform and its features before committing to a paid plan."
  },
  {
    question: "Can I integrate this with my existing CRM system?",
    answer: "Yes, our platform offers integration with many popular CRM systems. If you don't see your CRM listed, please contact our support team for assistance."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide 24/7 customer support via email and live chat. For our enterprise customers, we also offer dedicated account managers."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use industry-standard encryption and security protocols to ensure your data is always protected. We are also GDPR compliant."
  }
];

const FAQComponent: React.FC = () => {
  return (
      <div className="container mx-auto sm:px-6 lg:px-8">
        <h2 className="mb-1 text-center text-4xl font-bold tracking-tighter">
          Frequently Asked Questions
        </h2>

        <div className="mt-8 rounded-xl h-auto overflow-hidden border gray-100 px-8 py-16">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((item, index) => (
              <AccordionItem key={`item-${index + 1}`} value={`item-${index + 1}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
  );
};

export default FAQComponent;