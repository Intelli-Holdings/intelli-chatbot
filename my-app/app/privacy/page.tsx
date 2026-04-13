import PrivacyPolicy from "./PrivacyPolicy";
import { Navbar } from "@/components/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Intelli",
  description: "Privacy Policy for Intelli Holdings Inc.",
};

export default function Privacy() {
  return (
    <div className="relative">
      <main className="pt-16">
        <Navbar />
        <section className="container mx-auto mt-8 px-4 max-w-4xl">
          <PrivacyPolicy />
        </section>
      </main>
    </div>
  );
}
