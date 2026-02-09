"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddOn {
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  hasQuantity: boolean;
  quantityOptions?: { label: string; value: string; multiplier: number }[];
}

const addOns: AddOn[] = [
  {
    name: "Automation Triggers",
    description:
      "Automate repetitive tasks and workflows with trigger-based actions.",
    basePrice: 20,
    unit: "/Month",
    hasQuantity: true,
    quantityOptions: [
      { label: "1,000 triggers", value: "1000", multiplier: 1 },
      { label: "2,500 triggers", value: "2500", multiplier: 2.5 },
      { label: "5,000 triggers", value: "5000", multiplier: 5 },
      { label: "10,000 triggers", value: "10000", multiplier: 10 },
    ],
  },
  {
    name: "AI Credits",
    description:
      "Additional AI credits for intelligent responses. 1,000 credits (1M tokens).",
    basePrice: 9,
    unit: "/Month",
    hasQuantity: true,
    quantityOptions: [
      { label: "1,000 credits", value: "1000", multiplier: 1 },
      { label: "2,500 credits", value: "2500", multiplier: 2.5 },
      { label: "5,000 credits", value: "5000", multiplier: 5 },
      { label: "10,000 credits", value: "10000", multiplier: 10 },
    ],
  },
  {
    name: "Webhook Integration",
    description:
      "Connect Intelli to your existing tools like CRMs (Zoho, HubSpot), Make, Apps or Zapier.",
    basePrice: 5,
    unit: "/Month",
    hasQuantity: false,
  },
  {
    name: "Additional WhatsApp Numbers",
    description:
      "Add extra WhatsApp numbers/channels for different teams, departments, or regions.",
    basePrice: 20,
    unit: "/Month/Number",
    hasQuantity: false,
  },
];

function AddOnCard({ addon }: { addon: AddOn }) {
  const [selectedQuantity, setSelectedQuantity] = useState("1000");

  const multiplier =
    addon.quantityOptions?.find((q) => q.value === selectedQuantity)
      ?.multiplier ?? 1;
  const price = (addon.basePrice * multiplier).toFixed(
    addon.basePrice % 1 !== 0 ? 2 : 0
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {addon.name}
        </h4>
        <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
        {addon.hasQuantity && addon.quantityOptions && (
          <div className="mb-4">
            <Select
              value={selectedQuantity}
              onValueChange={setSelectedQuantity}
            >
              <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {addon.quantityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">${price}</span>
        <span className="text-sm text-gray-500">{addon.unit}</span>
      </div>
    </div>
  );
}

export default function PricingAddons() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 sm:p-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Scale your workflow with tailored add-ons
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Extend your plan with powerful add-ons to match your business
              needs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon) => (
              <AddOnCard key={addon.name} addon={addon} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
