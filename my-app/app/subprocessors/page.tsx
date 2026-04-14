import { Navbar } from "@/components/navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subprocessors | Intelli",
  description:
    "A list of subprocessors used by Intelli to process customer data.",
};

const subprocessors = [
  {
    name: "Microsoft Azure",
    purpose: "Cloud Hosting, Infrastructure & Backend Services",
    location: "USA",
    website: "https://azure.microsoft.com/en-us",
  },
  {
    name: "Vercel",
    purpose: "Frontend Hosting, Analytics & Edge Functions",
    location: "USA",
    website: "https://vercel.com/",
  },
  {
    name: "Azure Database for PostgreSQL (Microsoft)",
    purpose: "Database Infrastructure",
    location: "USA",
    website: "https://azure.microsoft.com/en-us/products/postgresql",
  },
  {
    name: "Clerk",
    purpose: "Authentication & Identity Management",
    location: "USA",
    website: "https://clerk.com/",
  },
  {
    name: "Azure AI Foundry Models (Microsoft)",
    purpose: "AI Language Models",
    location: "USA",
    website: "https://azure.microsoft.com/en-us/products/ai-model-catalog",
  },
  {
    name: "Azure AI Search (Microsoft)",
    purpose: "Search, RAG Pipelines & Data Retrieval",
    location: "USA",
    website: "https://azure.microsoft.com/en-us/products/ai-services/ai-search",
  },
  {
    name: "Azure Monitor (Microsoft)",
    purpose: "Application Monitoring & Observability",
    location: "USA",
    website: "https://azure.microsoft.com/en-us/products/monitor",
  },
  {
    name: "OpenAI",
    purpose: "AI Language Models",
    location: "USA",
    website: "https://openai.com/",
  },
  {
    name: "Meta (Facebook)",
    purpose: "WhatsApp Business API & Messaging",
    location: "USA",
    website: "https://developers.facebook.com/",
  },
  {
    name: "Stripe",
    purpose: "Payment Processing",
    location: "USA",
    website: "https://stripe.com/",
  },
  {
    name: "Paystack",
    purpose: "Payment Processing (Africa)",
    location: "USA / Nigeria",
    website: "https://paystack.com/",
  },
  {
    name: "Flutterwave",
    purpose: "Payment Processing (Africa)",
    location: "USA / Nigeria",
    website: "https://flutterwave.com/",
  },
  {
    name: "Sentry",
    purpose: "Error Monitoring & Performance Tracking",
    location: "USA",
    website: "https://sentry.io/",
  },
  {
    name: "PostHog",
    purpose: "Product Analytics",
    location: "USA",
    website: "https://posthog.com/",
  },
];

export default function SubprocessorsPage() {
  return (
    <div className="relative">
      <main className="pt-16">
        <Navbar />
        <section className="container mx-auto mt-8 px-4 max-w-4xl">
          <div className="min-h-screen py-4">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
                Subprocessors
              </h1>
              <p className="text-lg text-gray-600">
                Current as of April 14, 2026
              </p>
            </div>

            <p className="text-gray-700 text-lg mb-8 text-center max-w-2xl mx-auto">
              Here is a list of subprocessors used by Intelli to process customer
              data. For more details on how we handle your data, please review
              our{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/data-processing-agreement"
                className="text-blue-600 hover:underline"
              >
                Data Processing Agreement
              </a>
              .
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Purpose
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Website
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {subprocessors.map((sp) => (
                    <tr
                      key={sp.name}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {sp.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {sp.purpose}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {sp.location}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={sp.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {new URL(sp.website).hostname}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 text-center text-sm text-gray-500 space-y-2">
              <p>
                We may update this list from time to time as we engage new
                subprocessors or change existing ones. Customers who have signed
                a Data Processing Agreement (DPA) with Intelli will be notified
                of changes in accordance with the terms of the DPA.
              </p>
              <p>
                Questions?{" "}
                <a
                  href="mailto:support@intelliconcierge.com"
                  className="text-blue-600 hover:underline"
                >
                  support@intelliconcierge.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
