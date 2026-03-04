"use client";
import { Navbar } from "@/components/navbar";
import { FooterComponent } from "@/components/home/Footer";
import Banner from "@/components/signup-banner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Send,
  FileText,
  CalendarClock,
  ShieldCheck,
  Inbox,
  BarChart3,
  Plane,
  GraduationCap,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Globe,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";

// Meta WhatsApp Business Platform per-message rates (USD), effective January 1, 2026
// Source: https://developers.facebook.com/docs/whatsapp/pricing
const META_PRICING: Record<string, { marketing: number; utility: number; authentication: number; authInternational: number | null }> = {
  "Argentina": { marketing: 0.0618, utility: 0.0260, authentication: 0.0260, authInternational: null },
  "Brazil": { marketing: 0.0625, utility: 0.0068, authentication: 0.0068, authInternational: null },
  "Chile": { marketing: 0.0889, utility: 0.0200, authentication: 0.0200, authInternational: null },
  "Colombia": { marketing: 0.0125, utility: 0.0008, authentication: 0.0008, authInternational: null },
  "Egypt": { marketing: 0.0644, utility: 0.0036, authentication: 0.0036, authInternational: 0.0650 },
  "France": { marketing: 0.0859, utility: 0.0300, authentication: 0.0300, authInternational: null },
  "Germany": { marketing: 0.1365, utility: 0.0550, authentication: 0.0550, authInternational: null },
  "India": { marketing: 0.0118, utility: 0.0014, authentication: 0.0014, authInternational: 0.0280 },
  "Indonesia": { marketing: 0.0411, utility: 0.0250, authentication: 0.0250, authInternational: 0.1360 },
  "Israel": { marketing: 0.0353, utility: 0.0053, authentication: 0.0053, authInternational: null },
  "Italy": { marketing: 0.0691, utility: 0.0300, authentication: 0.0300, authInternational: null },
  "Malaysia": { marketing: 0.0860, utility: 0.0140, authentication: 0.0140, authInternational: 0.0418 },
  "Mexico": { marketing: 0.0305, utility: 0.0085, authentication: 0.0085, authInternational: null },
  "Netherlands": { marketing: 0.1597, utility: 0.0500, authentication: 0.0500, authInternational: null },
  "Nigeria": { marketing: 0.0516, utility: 0.0067, authentication: 0.0067, authInternational: 0.0750 },
  "Pakistan": { marketing: 0.0473, utility: 0.0054, authentication: 0.0054, authInternational: 0.0750 },
  "Peru": { marketing: 0.0703, utility: 0.0200, authentication: 0.0200, authInternational: null },
  "Russia": { marketing: 0.0802, utility: 0.0400, authentication: 0.0400, authInternational: null },
  "Saudi Arabia": { marketing: 0.0455, utility: 0.0107, authentication: 0.0107, authInternational: 0.0598 },
  "South Africa": { marketing: 0.0379, utility: 0.0076, authentication: 0.0076, authInternational: 0.0200 },
  "Spain": { marketing: 0.0615, utility: 0.0200, authentication: 0.0200, authInternational: null },
  "Turkey": { marketing: 0.0109, utility: 0.0053, authentication: 0.0053, authInternational: null },
  "United Arab Emirates": { marketing: 0.0499, utility: 0.0157, authentication: 0.0157, authInternational: 0.0510 },
  "United Kingdom": { marketing: 0.0529, utility: 0.0220, authentication: 0.0220, authInternational: null },
  "North America": { marketing: 0.0250, utility: 0.0034, authentication: 0.0034, authInternational: null },
  "Rest of Africa": { marketing: 0.0225, utility: 0.0040, authentication: 0.0040, authInternational: null },
  "Rest of Asia Pacific": { marketing: 0.0732, utility: 0.0113, authentication: 0.0113, authInternational: null },
  "Rest of Central & Eastern Europe": { marketing: 0.0860, utility: 0.0212, authentication: 0.0212, authInternational: null },
  "Rest of Latin America": { marketing: 0.0740, utility: 0.0113, authentication: 0.0113, authInternational: null },
  "Rest of Middle East": { marketing: 0.0341, utility: 0.0091, authentication: 0.0091, authInternational: null },
  "Rest of Western Europe": { marketing: 0.0592, utility: 0.0171, authentication: 0.0171, authInternational: null },
  "Other": { marketing: 0.0604, utility: 0.0077, authentication: 0.0077, authInternational: null },
};

const MARKET_OPTIONS = Object.keys(META_PRICING);

type TemplateType = "marketing" | "utility" | "authentication";

const TEMPLATE_TYPES: { value: TemplateType; label: string; description: string }[] = [
  { value: "marketing", label: "Marketing", description: "Promotions, offers, updates" },
  { value: "utility", label: "Utility", description: "Order updates, alerts, confirmations" },
  { value: "authentication", label: "Authentication", description: "OTP, verification codes" },
];

const INTELLI_PACKAGES = [
  { name: "Broadcast Only", monthlyFee: 20, contacts: "2,000" },
  { name: "WhatsApp Basic", monthlyFee: 35, contacts: "2,000" },
  { name: "WhatsApp Grow", monthlyFee: 55, contacts: "10,000" },
  { name: "WhatsApp Pro", monthlyFee: 75, contacts: "100,000" },
  { name: "WhatsApp Elite", monthlyFee: 86, contacts: "Unlimited" },
  { name: "WhatsApp Scale", monthlyFee: 108, contacts: "Unlimited" },
  { name: "WhatsApp Legacy", monthlyFee: 214, contacts: "Unlimited" },
];

const features = [
  {
    icon: Send,
    title: "Mass Broadcasts",
    description:
      "Send promos, delivery notifications, and alerts to thousands of opted-in customers.",
  },
  {
    icon: FileText,
    title: "Personalized Templates",
    description:
      "Dynamic content with variables, rich media, CTAs, and WhatsApp-approved templates.",
  },
  {
    icon: CalendarClock,
    title: "Schedule & Automate",
    description:
      "Plan campaigns, segment audiences, and trigger workflows from our platform.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Security",
    description:
      "Meta-authorized green-tick, policy compliance, and secure message delivery.",
  },
  {
    icon: Inbox,
    title: "Unified Inbox",
    description:
      "Manage broadcasts and campaigns from one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    description:
      "Track deliveries, read rates, reply performance, and template metrics.",
  },
];

const useCases = [
  {
    icon: Plane,
    title: "Travel & Tours",
    items: [
      "Travel package offers (Lipa polepole)",
      "Holiday wishes",
      "Travel deal promos",
    ],
  },
  {
    icon: GraduationCap,
    title: "Education",
    items: ["Enrollment updates", "Application status", "Fee reminders"],
  },
  {
    icon: CreditCard,
    title: "Fintech & Lending",
    items: [
      "Payment reminders",
      "Document requests",
      "Loan status notifications",
    ],
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce & Retail",
    items: [
      "Abandoned cart follow-ups",
      "Product launches",
      "Order confirmations",
      "Flash sale alerts",
    ],
  },
];

const tiers = [
  { name: "Tier 1", volume: "1,000/day" },
  { name: "Tier 2", volume: "10,000/day" },
  { name: "Tier 3", volume: "100,000/day" },
  { name: "Tier 4", volume: "Unlimited" },
];

export default function WhatsAppBroadcastPage() {
  const [recipients, setRecipients] = useState("");
  const [market, setMarket] = useState("Rest of Africa");
  const [templateType, setTemplateType] = useState<TemplateType>("marketing");
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);

  const pricing = useMemo(() => {
    const recipientCount = parseInt(recipients) || 0;
    if (recipientCount === 0) return null;

    const rates = META_PRICING[market];
    const metaRate = rates[templateType];
    const metaCost = recipientCount * metaRate;

    const pkg = INTELLI_PACKAGES[selectedPackageIndex];

    return {
      metaCost: metaCost.toFixed(2),
      metaRate,
      monthlyFee: pkg.monthlyFee,
      packageName: pkg.name,
      total: (metaCost + pkg.monthlyFee).toFixed(2),
    };
  }, [recipients, market, templateType, selectedPackageIndex]);

  return (
    <div className="relative">
      <Navbar />

      <main className="pt-20">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">

            {/* ═══════════════════════════════════════════════════════ */}
            {/* HERO                                                    */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24 text-center">
              {/* Meta badge */}
              <div className="flex justify-center mb-8">
                <Image
                  src="/meta_techprovider_badge.webp"
                  alt="Meta Business Tech Provider Badge"
                  width={200}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>

              {/* Tag */}
              <div className="flex items-center justify-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Broadcasts
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mx-auto mb-6">
                WhatsApp Business Broadcasts
              </h1>

              <p className="text-[15px] text-[#1a1a1a]/60 leading-[1.7] max-w-[520px] mx-auto mb-10">
                Transform your business communication with our Meta-verified
                WhatsApp Broadcast. Reach millions, engage authentically, and
                drive conversions.
              </p>

              {/* CTA */}
              <div className="flex gap-4 justify-center">
                <a
                  href="https://www.intelliconcierge.com/auth/sign-up"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                >
                  Get started
                </a>
                <Link
                  href="/whatsapp-api"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors"
                >
                  Learn about WhatsApp API →
                </Link>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* OVERVIEW                                                */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Overview
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                WhatsApp Broadcasts overview
              </h2>

              <div className="flex gap-6 mb-8 max-w-[520px]">
                <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                  01
                </span>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  WhatsApp Broadcasts allow organizations to send high-volume,
                  media-rich, personalized messages to large groups of users
                  efficiently. Perfect for reminders, announcements, updates, and
                  program communications without messaging each person
                  individually.
                </p>
              </div>

              {/* How it works + Tier support */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-[#1a1a1a]/[0.08]">
                <div className="py-8 sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08] sm:pr-8">
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-4">
                    <span className="text-[#1a1a1a]/30 mr-1">1.</span> How it
                    works
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Business-initiated conversations using approved templates",
                      "Messages appear as 1:1 conversations, keeping communication personal",
                      "Only sent to users who have opted in to receive your messages",
                      "Easy performance tracking and analytics",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-[13px] text-[#1a1a1a]/55 leading-[1.65]"
                      >
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="py-8 sm:pl-8">
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-4">
                    <span className="text-[#1a1a1a]/30 mr-1">2.</span> Tier
                    upgrade support
                  </h3>
                  <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] mb-4">
                    Each tier comes with specific criteria that must be met to
                    unlock higher broadcast volumes, as determined by Meta.
                  </p>
                  <p className="text-[13px] text-[#1a1a1a]/70 leading-[1.65] font-medium">
                    Intelli provides dedicated support and guidance at every
                    stage, helping your business reach the unlimited tier.
                  </p>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* PERFORMANCE                                             */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Performance
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                Why businesses choose our WhatsApp solution
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-[#1a1a1a]/[0.08]">
                {[
                  {
                    stat: "98%",
                    label: "Open Rate",
                    desc: "Higher engagement than email or SMS",
                  },
                  {
                    stat: "Instant",
                    label: "Delivery",
                    desc: "Real-time message delivery worldwide",
                  },
                  {
                    stat: "100%",
                    label: "Compliant",
                    desc: "Meta-approved templates and policies",
                  },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    className={`py-8 ${
                      i < arr.length - 1
                        ? "sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08]"
                        : ""
                    } ${i > 0 ? "sm:pl-8" : ""} ${
                      i < arr.length - 1 ? "sm:pr-8" : ""
                    }`}
                  >
                    <p className="text-3xl font-bold text-[#1a1a1a] mb-1">
                      {item.stat}
                    </p>
                    <p className="text-sm font-semibold text-[#1a1a1a] mb-1">
                      {item.label}
                    </p>
                    <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* FEATURES                                                */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Features
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                Everything you need to succeed
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-[#1a1a1a]/[0.08]">
                {features.map((feature, i) => (
                  <div
                    key={feature.title}
                    className={`py-8 ${
                      i % 3 < 2
                        ? "lg:border-r border-[#1a1a1a]/[0.08]"
                        : ""
                    } ${
                      i < features.length - 3
                        ? "border-b border-[#1a1a1a]/[0.08]"
                        : i < features.length - 1
                        ? "border-b lg:border-b-0 border-[#1a1a1a]/[0.08]"
                        : ""
                    } ${i % 3 === 1 ? "lg:px-8" : i % 3 === 2 ? "lg:pl-8" : "lg:pr-8"}`}
                  >
                    <feature.icon className="w-5 h-5 text-[#1a1a1a]/40 mb-3" />
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* PRICING CALCULATOR                                      */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Pricing
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                Calculate your WhatsApp Business costs
              </h2>

              {/* Tiers */}
              <div className="flex gap-6 mb-8 max-w-[520px]">
                <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                  01
                </span>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  Meta uses a tiered system for broadcast volume limits. All
                  verified accounts start at Tier 1. Unverified accounts are
                  limited to 250 messages/day.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-t border-[#1a1a1a]/[0.08] mb-14">
                {tiers.map((tier, i, arr) => (
                  <div
                    key={tier.name}
                    className={`py-6 ${
                      i < arr.length - 1
                        ? "border-r border-[#1a1a1a]/[0.08]"
                        : ""
                    } ${i > 0 ? "pl-4 sm:pl-6" : ""} ${
                      i < arr.length - 1 ? "pr-4 sm:pr-6" : ""
                    }`}
                  >
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      {tier.name}
                    </p>
                    <p className="text-[13px] text-[#1a1a1a]/55">
                      {tier.volume}
                    </p>
                  </div>
                ))}
              </div>

              {/* Calculator */}
              <div className="border border-[#1a1a1a]/[0.08] rounded-md p-8">
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                  Broadcast Pricing Calculator
                </h3>
                <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] mb-8">
                  Enter your estimated monthly broadcast volume based on unique
                  recipients. This applies to template messages only — regular
                  conversation replies are free.
                </p>

                {/* Row 1: Market, Template Type, Intelli Package */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label
                      htmlFor="market"
                      className="text-sm font-semibold text-[#1a1a1a] mb-2 block"
                    >
                      Market / Region
                    </Label>
                    <div className="relative">
                      <select
                        id="market"
                        value={market}
                        onChange={(e) => setMarket(e.target.value)}
                        className="w-full h-10 px-3 pr-8 text-sm border border-[#1a1a1a]/[0.12] rounded-md bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#007fff] focus:border-[#007fff]"
                      >
                        {MARKET_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#1a1a1a]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#1a1a1a] mb-2 block">
                      Template Type
                    </Label>
                    <div className="flex gap-0 border border-[#1a1a1a]/[0.12] rounded-md overflow-hidden h-10">
                      {TEMPLATE_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTemplateType(t.value)}
                          className={`flex-1 text-xs font-medium transition-colors ${
                            templateType === t.value
                              ? "bg-[#1a1a1a] text-white"
                              : "bg-white text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.03]"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#1a1a1a]/40 mt-1.5">
                      {TEMPLATE_TYPES.find((t) => t.value === templateType)?.description}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#1a1a1a] mb-2 block">
                      Intelli Package
                    </Label>
                    <div className="relative">
                      <select
                        value={selectedPackageIndex}
                        onChange={(e) =>
                          setSelectedPackageIndex(Number(e.target.value))
                        }
                        className="w-full h-10 px-3 pr-8 text-sm border border-[#1a1a1a]/[0.12] rounded-md bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#007fff] focus:border-[#007fff]"
                      >
                        {INTELLI_PACKAGES.map((pkg, i) => (
                          <option key={pkg.name} value={i}>
                            {pkg.name} — ${pkg.monthlyFee}/mo{pkg.contacts !== "N/A" ? ` · ${pkg.contacts} contacts` : ""}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#1a1a1a]/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Monthly Recipients */}
                <div className="mb-8">
                  <Label
                    htmlFor="recipients"
                    className="text-sm font-semibold text-[#1a1a1a] mb-2 block"
                  >
                    Monthly Unique Recipients
                  </Label>
                  <Input
                    id="recipients"
                    type="number"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="Number of unique recipients per month"
                    className="border-[#1a1a1a]/[0.12] max-w-sm"
                  />
                  <p className="text-[11px] text-[#1a1a1a]/40 mt-1.5">
                    Each recipient counts as one template message
                  </p>
                </div>

                {pricing && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-[#1a1a1a]/[0.08]">
                      <div className="py-6 sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08] sm:pr-6">
                        <p className="text-[13px] text-[#1a1a1a]/55 mb-1">
                          Meta Template Fees
                        </p>
                        <p className="text-2xl font-bold text-[#1a1a1a]">
                          ${pricing.metaCost}
                        </p>
                        <p className="text-[11px] text-[#1a1a1a]/40">
                          @${pricing.metaRate.toFixed(4)} per message · {market}
                        </p>
                      </div>
                      <div className="py-6 sm:border-r border-b sm:border-b-0 border-[#1a1a1a]/[0.08] sm:px-6">
                        <p className="text-[13px] text-[#1a1a1a]/55 mb-1">
                          Intelli Platform Fee
                        </p>
                        <p className="text-2xl font-bold text-[#1a1a1a]">
                          ${pricing.monthlyFee}
                        </p>
                        <p className="text-[11px] text-[#1a1a1a]/40">
                          {pricing.packageName} plan
                        </p>
                      </div>
                      <div className="py-6 sm:pl-6">
                        <p className="text-[13px] text-[#1a1a1a]/55 mb-1">
                          Estimated Total
                        </p>
                        <p className="text-2xl font-bold text-[#1a1a1a]">
                          ${pricing.total}
                        </p>
                        <p className="text-[11px] text-[#1a1a1a]/40">
                          per month
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border border-[#1a1a1a]/[0.08] rounded-md p-4">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                      <ul className="text-[12px] text-[#1a1a1a]/55 leading-[1.65] space-y-1">
                        <li>
                          Meta fees are charged per template message and vary by
                          market and template type
                        </li>
                        <li>
                          Regular conversation replies (non-template) are free of
                          Meta charges
                        </li>
                        <li>
                          Billing for Meta fees handled directly by Meta via your
                          Business Account
                        </li>
                        <li>
                          All verified accounts start at Tier 1 (1,000
                          messages/day)
                        </li>
                        <li>
                          Intelli provides dedicated support for tier upgrades
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <a
                    href="https://www.intelliconcierge.com/auth/sign-up"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 text-sm font-semibold text-white bg-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff]/90 transition-colors"
                  >
                    Start your journey
                  </a>
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* BENEFITS                                                */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Benefits
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                Stand out in your campaigns, and get results
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-[#1a1a1a]/[0.08]">
                {[
                  {
                    icon: TrendingUp,
                    title: "5x Higher Conversions",
                    desc: "Better conversion rates than traditional channels",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Meta Compliance",
                    desc: "Pre-approved templates ensure delivery success",
                  },
                  {
                    icon: Globe,
                    title: "Global Reach",
                    desc: "Connect with 2B+ WhatsApp users worldwide",
                  },
                  {
                    icon: BarChart3,
                    title: "Rich Analytics",
                    desc: "Track every metric that matters for ROI",
                  },
                ].map((item, i, arr) => (
                  <div
                    key={item.title}
                    className={`py-8 ${
                      i < arr.length - 1
                        ? "lg:border-r border-b lg:border-b-0 border-[#1a1a1a]/[0.08]"
                        : ""
                    } ${i > 0 ? "lg:pl-8" : ""} ${
                      i < arr.length - 1 ? "lg:pr-8" : ""
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-[#1a1a1a]/40 mb-3" />
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* USE CASES                                               */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="mb-24">
              <div className="flex items-center gap-2 mb-10">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                  Use Cases
                </span>
              </div>

              <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
                Ideal use cases by business type
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-[#1a1a1a]/[0.08]">
                {useCases.map((uc, i, arr) => (
                  <div
                    key={uc.title}
                    className={`py-8 ${
                      i < arr.length - 1
                        ? "lg:border-r border-b lg:border-b-0 border-[#1a1a1a]/[0.08]"
                        : ""
                    } ${i > 0 ? "lg:pl-8" : ""} ${
                      i < arr.length - 1 ? "lg:pr-8" : ""
                    }`}
                  >
                    <uc.icon className="w-5 h-5 text-[#1a1a1a]/40 mb-3" />
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-3">
                      {uc.title}
                    </h3>
                    <ul className="space-y-2">
                      {uc.items.map((item) => (
                        <li
                          key={item}
                          className="text-[13px] text-[#1a1a1a]/55 leading-[1.65]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-6 mt-10 max-w-[520px]">
                <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                  01
                </span>
                <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                  Don&apos;t see your industry? WhatsApp Broadcasts work for any
                  business that needs to communicate with customers at scale.{" "}
                  <a
                    href="https://cal.com/intelli-demo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1a1a1a] font-semibold underline underline-offset-2 decoration-[#1a1a1a]/20 hover:decoration-[#1a1a1a]/60 transition-colors"
                  >
                    Explore your use case →
                  </a>
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CTA                                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <section className="container mx-auto px-4 py-16 max-w-5xl">
          <Banner
            title="Ready to Run Successful Marketing Campaigns?"
            subtitle="Join businesses already using our Meta-verified WhatsApp solution."
            primaryButton={{
              text: "Start Free Trial",
              href: "/auth/sign-up",
            }}
            secondaryButton={{
              text: "Book a Demo",
              href: "https://cal.com/intelli-demo/",
              external: true,
            }}
          />
        </section>

        <FooterComponent />
      </main>
    </div>
  );
}
