import { Navbar } from "@/components/navbar";
import TermsOfService from "@/components/terms-of-service";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Intelli",
  description: "Terms of Service for Intelli Holdings Inc.",
};

export default function TermsOfServicePage() {
  return (
    <div className="relative">
      <main className="pt-16">
        <Navbar />
        <section className="container mx-auto mt-8 px-4 max-w-4xl">
          <TermsOfService />
        </section>
      </main>
    </div>
  );
}
