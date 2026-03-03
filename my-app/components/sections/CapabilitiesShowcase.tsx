"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const sidebarNav = [
  { id: "capabilities", num: "01", label: "CAPABILITIES" },
  { id: "channels", num: "02", label: "CHANNELS" },
  { id: "integrations", num: "03", label: "INTEGRATIONS" },
  { id: "ai-engine", num: "04", label: "AI ENGINE" },
  { id: "analytics", num: "05", label: "ANALYTICS" },
  { id: "pricing", num: "06", label: "PRICING" },
];

const steps = [
  {
    num: "1",
    title: "Build",
    description:
      "Create your AI assistant and design conversation flows with our visual builder — no code required.",
    href: "/features",
  },
  {
    num: "2",
    title: "Train",
    description:
      "Upload your docs, FAQs, and knowledge base. Your assistant learns your business in minutes.",
    href: "/features",
  },
  {
    num: "3",
    title: "Deploy",
    description:
      "Go live across WhatsApp, website chat, email, and more — with consistent support wherever customers reach out.",
    href: "/features",
  },
  {
    num: "4",
    title: "Analyze",
    description:
      "Use real-time analytics to measure performance, identify gaps, and continuously improve resolution quality.",
    href: "/features",
  },
];

const STEP_DURATION = 6000;
const CURSOR_ANIMATIONS = [
  "cursor-build",
  "cursor-train",
  "cursor-deploy",
  "cursor-analyze",
];

/* ── Animated cursor overlay ── */
function MockCursor({ step }: { step: number }) {
  return (
    <div
      key={`cursor-${step}`}
      className="absolute z-20 pointer-events-none"
      style={{
        animation: `${CURSOR_ANIMATIONS[step]} ${STEP_DURATION}ms ease-in-out infinite`,
      }}
    >
      <svg
        width="14"
        height="18"
        viewBox="0 0 14 18"
        fill="none"
        className="drop-shadow-sm"
      >
        <path
          d="M0 0V14.5L3.5 10.5L7 18L9.5 17L6 10H13L0 0Z"
          fill="white"
          stroke="#333"
          strokeWidth="0.8"
        />
      </svg>
      <span
        className="absolute left-0 top-0 w-3 h-3 rounded-full bg-[#007fff]/25"
        style={{ animation: "click-ring 2s ease-out infinite" }}
      />
    </div>
  );
}

/* ── Build mockup (Assistants + Playground) ── */
function BuildMockup() {
  return (
    <>
      <div className="flex-1 p-5 border-r border-[#1a1a1a]/[0.06] bg-[#fafaf8]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#1a1a1a]/40 uppercase tracking-wider">
            My Assistants
          </p>
          <span className="text-[11px] font-medium text-white bg-[#007fff] rounded px-2.5 py-1">
            + Create New
          </span>
        </div>

        {/* Assistant cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { name: "Sales Bot", status: "Active", color: "emerald" },
            { name: "Support Agent", status: "Active", color: "emerald" },
            { name: "Lead Qualifier", status: "Draft", color: "amber" },
            { name: "FAQ Handler", status: "Draft", color: "amber" },
          ].map((a) => (
            <div
              key={a.name}
              className="rounded-lg bg-white border border-[#1a1a1a]/[0.06] p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#1a1a1a]/[0.04] flex items-center justify-center text-[10px] font-bold text-[#1a1a1a]/50">
                  {a.name[0]}
                </span>
                <span className="text-[12px] font-medium text-[#1a1a1a]/70 truncate">
                  {a.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    a.color === "emerald" ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
                <span className="text-[10px] text-[#1a1a1a]/40">
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick creation form */}
        <div className="bg-white rounded-lg border border-[#1a1a1a]/[0.06] p-4 space-y-3">
          <p className="text-[11px] font-semibold text-[#1a1a1a]/50">
            Quick Setup
          </p>
          <div>
            <span className="text-[10px] text-[#1a1a1a]/40 block mb-1">
              Name
            </span>
            <div className="h-7 rounded border border-[#1a1a1a]/[0.08] bg-[#fafaf8] px-2 flex items-center">
              <span className="text-[11px] text-[#1a1a1a]/30">
                My Assistant
              </span>
              <span className="w-[1px] h-3.5 bg-[#007fff] animate-pulse ml-0.5" />
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[#1a1a1a]/40 block mb-1">
              Personality
            </span>
            <div className="h-7 rounded border border-[#1a1a1a]/[0.08] bg-[#fafaf8] px-2 flex items-center">
              <span className="text-[11px] text-[#1a1a1a]/30">
                Friendly, professional...
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-medium text-white bg-[#007fff] rounded px-3 py-1.5">
              Save &amp; Continue
            </span>
            <span className="text-[10px] font-medium text-[#1a1a1a]/40 border border-[#1a1a1a]/[0.08] rounded px-3 py-1.5">
              Cancel
            </span>
          </div>
        </div>
      </div>

      {/* Right: Playground preview */}
      <div className="w-[260px] shrink-0 hidden md:flex flex-col">
        <div className="px-4 py-3 border-b border-[#1a1a1a]/[0.06] flex items-center justify-between">
          <p className="text-xs font-semibold text-[#1a1a1a]/70">Playground</p>
          <span className="text-[10px] text-[#1a1a1a]/30">Sales Bot</span>
        </div>
        <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
          <div className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-[#007fff]/10 flex items-center justify-center text-[8px] font-bold text-[#007fff] shrink-0">
              AI
            </span>
            <div className="bg-[#1a1a1a]/[0.03] rounded-lg p-2.5 text-[11px] text-[#1a1a1a]/60 leading-relaxed">
              Hi! I&apos;m your sales assistant. How can I help you today?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-[#007fff]/10 rounded-lg p-2.5 text-[11px] text-[#007fff] leading-relaxed max-w-[80%]">
              What pricing plans do you offer?
            </div>
          </div>
          <div className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-[#007fff]/10 flex items-center justify-center text-[8px] font-bold text-[#007fff] shrink-0">
              AI
            </span>
            <div className="bg-[#1a1a1a]/[0.03] rounded-lg p-2.5 text-[11px] text-[#1a1a1a]/60 leading-relaxed">
              We have 3 plans: Starter, Growth, and Enterprise. Would you like
              details?
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-[#1a1a1a]/[0.06]">
          <div className="flex items-center gap-2 rounded-lg border border-[#1a1a1a]/[0.08] px-3 py-2">
            <span className="text-[11px] text-[#1a1a1a]/30 flex-1">
              Type a message...
            </span>
            <span className="text-[#007fff] text-xs font-bold">&#9654;</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Train mockup (Knowledge Base + Training) ── */
function TrainMockup() {
  return (
    <>
      <div className="flex-1 p-5 border-r border-[#1a1a1a]/[0.06] bg-[#fafaf8]">
        <p className="text-xs font-semibold text-[#1a1a1a]/40 uppercase tracking-wider mb-4">
          Knowledge Base
        </p>

        {/* Upload zone */}
        <div className="border-2 border-dashed border-[#1a1a1a]/[0.1] rounded-lg p-4 text-center mb-4">
          <div className="text-[#1a1a1a]/15 text-lg mb-1">
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0l-4 4m4-4 4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
              />
            </svg>
          </div>
          <p className="text-[11px] text-[#1a1a1a]/40 font-medium">
            Drop files here or click to browse
          </p>
          <p className="text-[10px] text-[#1a1a1a]/25 mt-1">
            PDF, DOCX, XLSX, TXT supported
          </p>
        </div>

        {/* Document list */}
        <div className="space-y-2">
          {[
            { name: "company-faq.pdf", size: "2.4 MB", entries: 847, status: "indexed" as const },
            { name: "product-catalog.xlsx", size: "5.1 MB", entries: 1203, status: "indexed" as const },
            { name: "return-policy.docx", size: "340 KB", entries: 56, status: "indexed" as const },
            { name: "shipping-guide.pdf", size: "1.8 MB", entries: null, status: "processing" as const },
            { name: "warranty-terms.pdf", size: "890 KB", entries: null, status: "queued" as const },
          ].map((doc) => (
            <div
              key={doc.name}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-white border border-[#1a1a1a]/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    doc.status === "indexed"
                      ? "bg-emerald-500"
                      : doc.status === "processing"
                      ? "bg-blue-500 animate-pulse"
                      : "bg-[#1a1a1a]/20"
                  }`}
                />
                <div>
                  <span className="text-[12px] text-[#1a1a1a]/70 font-medium block">
                    {doc.name}
                  </span>
                  <span className="text-[10px] text-[#1a1a1a]/30">
                    {doc.size}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#1a1a1a]/40">
                {doc.status === "indexed"
                  ? `${doc.entries} entries`
                  : doc.status === "processing"
                  ? "Processing..."
                  : "Queued"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-[10px] text-[#1a1a1a]/30">
            Total: 2,106 entries
          </span>
          <span className="text-[10px] font-medium text-white bg-[#007fff] rounded px-3 py-1.5">
            Train Model
          </span>
        </div>
      </div>

      {/* Right: Training status */}
      <div className="w-[260px] shrink-0 hidden md:block">
        <div className="px-4 py-3 border-b border-[#1a1a1a]/[0.06]">
          <p className="text-xs font-semibold text-[#1a1a1a]/70">
            Training Status
          </p>
        </div>
        <div className="px-4 py-4 space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#1a1a1a]/50">
                Overall progress
              </span>
              <span className="text-[11px] font-bold text-[#007fff]">87%</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a]/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007fff] rounded-full"
                style={{ width: "87%" }}
              />
            </div>
          </div>

          {[
            { label: "Model accuracy", value: "94.2%" },
            { label: "Confidence avg", value: "0.91" },
            { label: "Coverage", value: "87%" },
            { label: "Unmatched", value: "34" },
          ].map((m) => (
            <div key={m.label} className="flex items-center justify-between">
              <span className="text-[12px] text-[#1a1a1a]/50">{m.label}</span>
              <span className="text-[12px] font-bold text-[#1a1a1a]">
                {m.value}
              </span>
            </div>
          ))}

          <div className="border-t border-[#1a1a1a]/[0.06] pt-3">
            <p className="text-[10px] font-semibold text-[#1a1a1a]/40 mb-2">
              Activity
            </p>
            {[
              { text: "product-catalog indexed", time: "2m ago" },
              { text: "return-policy indexed", time: "5m ago" },
              { text: "company-faq indexed", time: "8m ago" },
            ].map((a) => (
              <div
                key={a.text}
                className="flex items-center justify-between py-1"
              >
                <span className="text-[11px] text-[#1a1a1a]/50">
                  {a.text}
                </span>
                <span className="text-[10px] text-[#1a1a1a]/25">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Deploy mockup (Channels) ── */
function DeployMockup() {
  return (
    <div className="flex-1 p-5 bg-[#fafaf8]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-[#1a1a1a]/40 uppercase tracking-wider">
          Connected Channels
        </p>
        <span className="text-[10px] font-medium text-[#007fff]">
          + Add Channel
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          {
            letter: "W",
            bg: "bg-emerald-500",
            name: "WhatsApp",
            detail: "+1 (555) 123-4567",
            metric: "1,247 messages today",
            connected: true,
            action: "Settings",
          },
          {
            letter: "W",
            bg: "bg-[#007fff]",
            name: "Website Widget",
            detail: "intelliconcierge.com",
            metric: "389 sessions today",
            connected: true,
            action: "Customize",
          },
          {
            letter: "E",
            bg: "bg-purple-500",
            name: "Email",
            detail: "support@company.com",
            metric: "",
            connected: false,
            action: "Configure",
          },
        ].map((ch) => (
          <div
            key={ch.name}
            className="rounded-lg bg-white border border-[#1a1a1a]/[0.06] p-4"
          >
            <div
              className={`w-8 h-8 rounded-lg ${ch.bg} flex items-center justify-center text-white text-[11px] font-bold mb-3`}
            >
              {ch.letter}
            </div>
            <p className="text-[13px] font-medium text-[#1a1a1a]/80 mb-1">
              {ch.name}
            </p>
            <p className="text-[10px] text-[#1a1a1a]/40 mb-2">{ch.detail}</p>
            <div className="flex items-center gap-1.5 mb-3">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  ch.connected ? "bg-emerald-500" : "bg-[#1a1a1a]/20"
                }`}
              />
              <span
                className={`text-[10px] ${
                  ch.connected ? "text-emerald-600" : "text-[#1a1a1a]/30"
                }`}
              >
                {ch.connected ? "Connected" : "Not connected"}
              </span>
            </div>
            {ch.metric && (
              <p className="text-[10px] text-[#1a1a1a]/30 mb-3">{ch.metric}</p>
            )}
            <span className="text-[10px] font-medium text-[#007fff] border border-[#007fff]/20 rounded px-2.5 py-1">
              {ch.action}
            </span>
          </div>
        ))}
      </div>

      {/* Status footer */}
      <div className="bg-white rounded-lg border border-[#1a1a1a]/[0.06] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-[#1a1a1a]/50">
                All systems operational
              </span>
            </div>
            <span className="text-[10px] text-[#1a1a1a]/30">
              Last deploy: 2h ago
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px]">
              <span className="text-[#1a1a1a]/40">Uptime </span>
              <span className="font-bold text-emerald-600">99.97%</span>
            </div>
            <div className="text-[10px]">
              <span className="text-[#1a1a1a]/40">Active agents </span>
              <span className="font-bold text-[#1a1a1a]">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Analyze mockup (Analytics Dashboard) ── */
function AnalyzeMockup() {
  return (
    <>
      <div className="flex-1 p-5 border-r border-[#1a1a1a]/[0.06] bg-[#fafaf8]">
        <p className="text-xs font-semibold text-[#1a1a1a]/40 uppercase tracking-wider mb-4">
          Analytics Overview
        </p>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-0 border border-[#1a1a1a]/[0.06] rounded-lg overflow-hidden mb-5">
          {[
            { label: "Resolution rate", value: "94.2%", trend: "+2.1%" },
            { label: "Avg response", value: "1.2s", trend: "-0.3s" },
            { label: "CSAT score", value: "4.8/5", trend: "+0.2" },
            { label: "Conversations", value: "12,847", trend: "+18%" },
          ].map((m, i) => (
            <div
              key={m.label}
              className={`p-3.5 bg-white ${
                i < 2 ? "border-b border-[#1a1a1a]/[0.06]" : ""
              } ${i % 2 === 0 ? "border-r border-[#1a1a1a]/[0.06]" : ""}`}
            >
              <p className="text-[10px] text-[#1a1a1a]/40 mb-0.5">
                {m.label}
              </p>
              <p className="text-lg font-bold text-[#1a1a1a]">{m.value}</p>
              <p className="text-[10px] text-emerald-600 font-medium">
                {m.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Mini chart */}
        <div className="bg-white rounded-lg border border-[#1a1a1a]/[0.06] p-4 mb-4">
          <p className="text-[10px] text-[#1a1a1a]/40 mb-3">
            Conversations (7 days)
          </p>
          <svg viewBox="0 0 280 60" className="w-full h-[60px]">
            <defs>
              <linearGradient
                id="cap-chart-grad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#007fff" />
                <stop offset="100%" stopColor="#007fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              points="0,45 40,38 80,42 120,30 160,25 200,18 240,22 280,12"
              fill="url(#cap-chart-grad)"
              stroke="none"
              opacity="0.1"
            />
            <polyline
              points="0,45 40,38 80,42 120,30 160,25 200,18 240,22 280,12"
              fill="none"
              stroke="#007fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {[
              [0, 45],
              [40, 38],
              [80, 42],
              [120, 30],
              [160, 25],
              [200, 18],
              [240, 22],
              [280, 12],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2.5" fill="#007fff" />
            ))}
          </svg>
        </div>

        {/* Channel breakdown */}
        <p className="text-[10px] text-[#1a1a1a]/40 uppercase tracking-wider mb-2">
          Channel breakdown
        </p>
        {[
          { name: "WhatsApp", pct: 67 },
          { name: "Widget", pct: 24 },
          { name: "Email", pct: 9 },
        ].map((ch) => (
          <div key={ch.name} className="flex items-center gap-3 mb-1.5">
            <span className="text-[11px] text-[#1a1a1a]/50 w-14">
              {ch.name}
            </span>
            <div className="flex-1 h-1.5 bg-[#1a1a1a]/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#007fff]/30 rounded-full"
                style={{ width: `${ch.pct}%` }}
              />
            </div>
            <span className="text-[10px] text-[#1a1a1a]/40 w-7 text-right">
              {ch.pct}%
            </span>
          </div>
        ))}
      </div>

      {/* Right: Top Queries */}
      <div className="w-[260px] shrink-0 hidden md:block">
        <div className="px-4 py-3 border-b border-[#1a1a1a]/[0.06]">
          <p className="text-xs font-semibold text-[#1a1a1a]/70">
            Top Queries
          </p>
        </div>
        <div className="divide-y divide-[#1a1a1a]/[0.06]">
          {[
            { query: "Order status", count: "2,847", trend: "+12%" },
            { query: "Return policy", count: "1,203", trend: "-3%" },
            { query: "Shipping ETA", count: "987", trend: "+8%" },
            { query: "Product info", count: "743", trend: "+21%" },
            { query: "Refund status", count: "521", trend: "-1%" },
          ].map((q, i) => (
            <div
              key={q.query}
              className="px-4 py-2.5 flex items-center justify-between"
            >
              <div>
                <span className="text-[#1a1a1a]/25 text-[10px] mr-1">
                  {i + 1}.
                </span>
                <span className="text-[12px] text-[#1a1a1a]/65">
                  {q.query}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-[#1a1a1a]">
                  {q.count}
                </p>
                <p
                  className={`text-[9px] ${
                    q.trend.startsWith("+")
                      ? "text-emerald-600"
                      : "text-[#1a1a1a]/30"
                  }`}
                >
                  {q.trend}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-[#1a1a1a]/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#1a1a1a]/50">
              Escalation rate
            </span>
            <span className="text-[11px] font-bold text-[#1a1a1a]">6.2%</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function CapabilitiesShowcase() {
  const [activeNav, setActiveNav] = useState("capabilities");
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, STEP_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeStep]);

  const handleStepClick = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveStep(index);
  };

  return (
    <section className="py-20 bg-white">
      <style>{`
        @keyframes cap-progress {
          from { height: 0% }
          to { height: 100% }
        }
        @keyframes cap-fade {
          from { opacity: 0; transform: translateY(4px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes cursor-build {
          0%, 5%   { left: 55%; top: 6%; }
          10%, 18% { left: 18%; top: 25%; }
          22%, 30% { left: 40%; top: 25%; }
          34%, 42% { left: 25%; top: 65%; }
          46%, 54% { left: 22%; top: 80%; }
          58%, 66% { left: 78%; top: 35%; }
          70%, 80% { left: 78%; top: 85%; }
          85%, 95% { left: 55%; top: 6%; }
          100%     { left: 55%; top: 6%; }
        }
        @keyframes cursor-train {
          0%, 5%   { left: 28%; top: 15%; }
          10%, 18% { left: 25%; top: 35%; }
          22%, 30% { left: 25%; top: 48%; }
          34%, 42% { left: 25%; top: 58%; }
          46%, 54% { left: 48%; top: 80%; }
          58%, 66% { left: 80%; top: 22%; }
          70%, 80% { left: 80%; top: 48%; }
          85%, 95% { left: 80%; top: 68%; }
          100%     { left: 28%; top: 15%; }
        }
        @keyframes cursor-deploy {
          0%, 6%   { left: 18%; top: 22%; }
          10%, 18% { left: 18%; top: 68%; }
          22%, 30% { left: 50%; top: 22%; }
          34%, 42% { left: 50%; top: 68%; }
          46%, 54% { left: 82%; top: 22%; }
          58%, 66% { left: 82%; top: 68%; }
          70%, 80% { left: 35%; top: 88%; }
          85%, 95% { left: 65%; top: 88%; }
          100%     { left: 18%; top: 22%; }
        }
        @keyframes cursor-analyze {
          0%, 5%   { left: 15%; top: 18%; }
          10%, 18% { left: 38%; top: 18%; }
          22%, 30% { left: 15%; top: 42%; }
          34%, 42% { left: 38%; top: 42%; }
          46%, 54% { left: 30%; top: 62%; }
          58%, 66% { left: 30%; top: 78%; }
          70%, 80% { left: 78%; top: 28%; }
          85%, 95% { left: 78%; top: 65%; }
          100%     { left: 15%; top: 18%; }
        }
        @keyframes click-ring {
          0%   { transform: scale(0); opacity: 0.35; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>

      <div className="container">
        <div className="flex gap-12 lg:gap-20">
          {/* ── Sticky sidebar nav ── */}
          <nav className="hidden lg:block w-[180px] shrink-0">
            <div className="sticky top-28 space-y-1">
              {sidebarNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center gap-2.5 w-full text-left py-2 text-xs tracking-[0.08em] transition-colors ${
                    activeNav === item.id
                      ? "text-[#1a1a1a] font-bold"
                      : "text-[#1a1a1a]/40 font-medium hover:text-[#1a1a1a]/70"
                  }`}
                >
                  <span className="tabular-nums">{item.num}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Tag */}
            <div className="flex items-center gap-2 mb-10">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
                Capabilities
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] max-w-[700px] mb-10">
              Intelli resolves the most complex queries on every channel
            </h2>

            {/* Description */}
            <div className="flex gap-6 mb-8 max-w-[520px]">
              <span className="text-sm text-[#1a1a1a]/30 font-medium tabular-nums shrink-0 pt-0.5">
                01
              </span>
              <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7]">
                Intelli handles even the most complex queries through a
                continuous improvement loop. Train your AI on your knowledge
                base, test performance before launch, deploy across every
                channel, then analyze and improve with real-time insights — so
                every query is resolved accurately and consistently.
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/features"
              className="inline-block px-6 py-3 text-sm font-semibold text-[#007fff] border border-[#007fff] rounded-md hover:bg-[#007fff] hover:text-white transition-colors mb-14"
            >
              Explore all capabilities
            </Link>

            {/* ── Product mockup ── */}
            <div className="rounded-xl overflow-hidden border border-[#1a1a1a]/[0.06] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              {/* Top bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1a1a1a]/[0.06] bg-[#fafaf8]">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]/10" />
                </div>
                <div className="flex items-center gap-3 text-xs text-[#1a1a1a]/40">
                  <span>&larr;</span>
                  {activeStep === 0 && (
                    <>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Test
                      </span>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Save
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-medium">
                        Live
                      </span>
                    </>
                  )}
                  {activeStep === 1 && (
                    <>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Upload
                      </span>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Settings
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-[11px] font-medium animate-pulse">
                        Training
                      </span>
                    </>
                  )}
                  {activeStep === 2 && (
                    <>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Channels
                      </span>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Settings
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-medium">
                        2 Active
                      </span>
                    </>
                  )}
                  {activeStep === 3 && (
                    <>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Export
                      </span>
                      <span className="px-2 py-1 rounded bg-[#1a1a1a]/[0.04]">
                        Filter
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-medium">
                        Live
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Dynamic content with cursor */}
              <div
                key={`mockup-${activeStep}`}
                className="relative flex min-h-[360px]"
                style={{ animation: "cap-fade 400ms ease-out" }}
              >
                <MockCursor step={activeStep} />

                {activeStep === 0 && <BuildMockup />}
                {activeStep === 1 && <TrainMockup />}
                {activeStep === 2 && <DeployMockup />}
                {activeStep === 3 && <AnalyzeMockup />}
              </div>
            </div>

            {/* ── Steps grid with progress bars ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mt-14 border-t border-[#1a1a1a]/[0.08]">
              {steps.map((step, i) => {
                const isActive = i === activeStep;
                return (
                  <div
                    key={step.num}
                    onClick={() => handleStepClick(i)}
                    className={`relative cursor-pointer py-8 pl-6 lg:pl-8 transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-50 hover:opacity-75"
                    } ${
                      i < steps.length - 1
                        ? "lg:border-r border-b lg:border-b-0 border-[#1a1a1a]/[0.08]"
                        : ""
                    } ${i < steps.length - 1 ? "lg:pr-8" : ""}`}
                  >
                    {/* Vertical progress track */}
                    <span className="absolute left-0 top-0 w-[2px] h-full bg-[#1a1a1a]/[0.06] rounded-full overflow-hidden">
                      {isActive && (
                        <span
                          key={`progress-${activeStep}`}
                          className="block w-full bg-[#007fff] rounded-full"
                          style={{
                            animation: `cap-progress ${STEP_DURATION}ms linear forwards`,
                          }}
                        />
                      )}
                    </span>

                    <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
                      <span
                        className={`mr-1 transition-colors duration-300 ${
                          isActive
                            ? "text-[#007fff]"
                            : "text-[#1a1a1a]/30"
                        }`}
                      >
                        {step.num}.
                      </span>{" "}
                      {step.title}
                    </h3>
                    <p className="text-[13px] text-[#1a1a1a]/55 leading-[1.65] mb-4">
                      {step.description}
                    </p>
                    <Link
                      href={step.href}
                      className="text-[13px] font-semibold text-[#1a1a1a] underline underline-offset-2 decoration-[#1a1a1a]/20 hover:decoration-[#1a1a1a]/60 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Learn more
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
