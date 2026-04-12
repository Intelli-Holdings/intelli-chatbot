import type { Metadata } from "next";
import React from "react";
import { Resources } from "@/components/component/resources";

export const metadata: Metadata = {
  title: "Resources – Intelli AI Customer Support Guides & Documentation",
  description:
    "Access guides, documentation, and resources for Intelli's AI-powered customer engagement platform. Learn how to set up WhatsApp automation, AI assistants, and multi-channel support.",
  alternates: { canonical: "https://www.intelliconcierge.com/resources" },
  openGraph: {
    title: "Resources – Intelli AI Platform",
    description: "Guides, documentation, and best practices for AI customer support and WhatsApp Business automation.",
    url: "https://www.intelliconcierge.com/resources",
  },
};

export default function resourcesPage (){
    return (
        <div>
            <Resources/>
        </div>
    );
};