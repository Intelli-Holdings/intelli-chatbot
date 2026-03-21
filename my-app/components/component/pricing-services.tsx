"use client";

import React from "react";

interface Service {
  name: string;
  priceLabel: string;
  priceType: string;
  features: string[];
  note?: string;
}

const services: Service[] = [
  {
    name: "Dedicated Onboarding",
    priceLabel: "Custom",
    priceType: "One-time fee",
    features: [
      "Dedicated number connection assistance",
      "Facebook Business verification",
      "BSP Migration",
      "1-hour product walkthrough and chatbot training session",
      "Onboarding support included with annual plan for all recurring subscriptions",
    ],
  },
  {
    name: "Technical Account Management",
    priceLabel: "Custom",
    priceType: "Annual fee",
    features: [
      "Dedicated contact for technical guidance and support escalation",
      "Proactive monitoring to address potential issues before they impact operations",
      "Hands-on assistance to troubleshoot custom configurations, APIs and integrations",
      "Premium escalation management (tickets handled on priority, including direct phone support)",
    ],
    note: "Available for Business Annual plan customers",
  },
  {
    name: "Professional Services",
    priceLabel: "Custom",
    priceType: "Hourly fee",
    features: [
      "30-min consultation with our expert to discuss your ideal workflow",
      "Setting up customized automations, CRM integrations & routing rules",
      "Creating tailored workflows for: CTWA lead acquisition, automating engagement/follow-ups, lead qualification/nurturing, e-commerce order updates, deploying custom AI Agents",
      "3 rounds of review to ensure Intelli fits perfectly for you and your business",
    ],
    note: "Available for any recurring plan customers",
  },
];

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <h4 className="text-lg font-semibold text-gray-900 mb-1">
        {service.name}
      </h4>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-gray-900">
          {service.priceLabel}
        </span>
        <span className="text-sm text-gray-500">{service.priceType}</span>
      </div>
      <ul className="space-y-3 flex-1">
        {service.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      {service.note && (
        <p className="mt-4 text-xs text-[#007fff] font-medium">
          {service.note}
        </p>
      )}
    </div>
  );
}

export default function PricingServices() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Grow faster with Intelli experts
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get hands-on help from our team to set up, optimize, and scale
              your workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
          <div className="text-center">
            <a
              href="https://cal.com/intelli-demo/30min?user=intelli-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-[#007fff] rounded-lg shadow-md hover:shadow-lg hover:bg-[#006ad9] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
