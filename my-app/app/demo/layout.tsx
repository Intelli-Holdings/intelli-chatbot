import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo – Try Intelli's AI Customer Support Platform",
  description:
    "Experience Intelli's AI-powered customer engagement platform live. Test the WhatsApp AI assistant, chat widget, and automated responses in a hands-on demo environment.",
  alternates: { canonical: "https://www.intelliconcierge.com/demo" },
  openGraph: {
    title: "Live Demo – Intelli AI Platform",
    description:
      "Try Intelli's AI assistant, WhatsApp automation, and multi-channel support in a live demo. No signup required.",
    url: "https://www.intelliconcierge.com/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
