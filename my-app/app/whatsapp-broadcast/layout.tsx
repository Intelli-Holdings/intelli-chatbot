import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp Broadcast – Send Bulk Messages at Scale with Intelli",
  description:
    "Send personalized WhatsApp broadcast messages to thousands of customers. Intelli's Meta-verified API supports promotions, order updates, alerts, template management, and compliance tools with tier-based messaging from 1K to unlimited.",
  keywords: [
    "WhatsApp broadcast",
    "WhatsApp bulk messaging",
    "WhatsApp Business API broadcast",
    "WhatsApp marketing messages",
    "WhatsApp promotions",
  ],
  alternates: { canonical: "https://www.intelliconcierge.com/whatsapp-broadcast" },
  openGraph: {
    title: "WhatsApp Broadcast – Bulk Messaging by Intelli",
    description:
      "Reach 2B+ WhatsApp users with personalized broadcasts, promotions, and alerts. Meta-verified API with tier-based messaging and compliance tools.",
    url: "https://www.intelliconcierge.com/whatsapp-broadcast",
  },
};

export default function WhatsAppBroadcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
