/**
 * JSON-LD Structured Data Components for AEO (Answer Engine Optimization)
 *
 * These components inject machine-readable structured data into page <head>
 * so that AI answer engines (ChatGPT, Perplexity, Google SGE) and traditional
 * search engines can accurately parse, cite, and surface Intelli content.
 *
 * Usage: Place these components inside any page to add the corresponding schema.
 * They render a <script type="application/ld+json"> tag with no visible output.
 */

import React from "react";

/* ------------------------------------------------------------------ */
/* Organization Schema                                                 */
/* Placed globally in layout.tsx so every page inherits it.            */
/* ------------------------------------------------------------------ */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Intelli",
    legalName: "Intelli Holdings Inc.",
    alternateName: ["Intelli", "Intelli Concierge", "IntelliConcierge"],
    url: "https://intelliconcierge.com",
    logo: "https://intelliconcierge.com/Intelli.svg",
    sameAs: [
      "https://www.linkedin.com/company/intelli-concierge",
      "https://x.com/IntelliConcierg",
      "https://medium.com/@intelliconcierge",
    ],
    description:
      "Intelli is an AI-powered customer engagement platform by Intelli Holdings Inc. that automates support and sales across WhatsApp, website chat, and email for governments, NGOs, universities, and enterprises.",
    foundingDate: "2023",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@intelliconcierge.com",
      contactType: "customer support",
      availableLanguage: ["English"],
    },
    areaServed: "Worldwide",
    knowsAbout: [
      "AI customer support",
      "WhatsApp Business API",
      "Chatbot automation",
      "Multi-channel customer engagement",
      "AI automation for enterprises",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* WebSite Schema with SearchAction (enables sitelinks search box)     */
/* ------------------------------------------------------------------ */
export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Intelli",
    url: "https://intelliconcierge.com",
    publisher: {
      "@type": "Organization",
      name: "Intelli Holdings Inc.",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* FAQPage Schema                                                      */
/* Pass an array of { question, answer } to generate the schema.       */
/* ------------------------------------------------------------------ */
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* HowTo Schema                                                        */
/* Pass a name, description, and array of steps.                       */
/* ------------------------------------------------------------------ */
interface HowToStep {
  name: string;
  text: string;
}

export function HowToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* BlogPosting Schema                                                  */
/* Used on individual blog post pages for citation by answer engines.   */
/* ------------------------------------------------------------------ */
export function BlogPostingJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  url,
  image,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  url: string;
  image?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName || "Intelli",
      url: "https://intelliconcierge.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Intelli Holdings Inc.",
      logo: {
        "@type": "ImageObject",
        url: "https://intelliconcierge.com/Intelli.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: image || "https://intelliconcierge.com/api/og",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* SoftwareApplication Schema                                          */
/* Describes Intelli as a SaaS product for rich snippets.              */
/* ------------------------------------------------------------------ */
export function SoftwareApplicationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Intelli",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "15",
      highPrice: "214",
      offerCount: "3",
    },
    description:
      "AI-powered customer engagement platform that automates support and sales across WhatsApp, website, and email.",
    publisher: {
      "@type": "Organization",
      name: "Intelli Holdings Inc.",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
