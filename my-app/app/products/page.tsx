import type { Metadata } from "next";
import React from "react";
import { Products } from "@/components/component/products";

export const metadata: Metadata = {
  title: "Products – Intelli AI Customer Engagement Solutions",
  description:
    "Explore Intelli's product suite: WhatsApp Business API integration, AI assistants, broadcast messaging, multi-channel dashboard, and real-time analytics for enterprise customer support.",
  alternates: { canonical: "https://www.intelliconcierge.com/products" },
  openGraph: {
    title: "Products – Intelli AI Platform",
    description: "WhatsApp API, AI assistants, broadcast messaging, and analytics — all in one customer engagement platform.",
    url: "https://www.intelliconcierge.com/products",
  },
};

export default function productsPage (){
    return (
        <div>
            <Products/>
        </div>
    );
};