import type { Metadata } from "next";
import IntelliAIWebsite from '@/components/about-component';
import {Navbar} from '@/components/navbar';

export const metadata: Metadata = {
  title: "About Intelli – AI Customer Engagement by Intelli Holdings Inc.",
  description:
    "Learn about Intelli Holdings Inc., the company behind the AI-powered customer engagement platform. Our mission, G.L.O.W. values, and vision for automating customer support across WhatsApp, web, and email.",
  alternates: { canonical: "https://www.intelliconcierge.com/about" },
  openGraph: {
    title: "About Intelli – AI Customer Engagement Platform",
    description: "Intelli Holdings Inc. builds AI-powered customer engagement tools for governments, NGOs, universities, and enterprises worldwide.",
    url: "https://www.intelliconcierge.com/about",
  },
};

export default async function Page() {

  return (
    <>
    <Navbar />  
      <IntelliAIWebsite />
    </>
  );
}