"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { GradientButton } from "./GradientButton";
import { TagBadge } from "./TagBadge";

const checkmarks = [
  "Response Time",
  "AI Quality",
  "Channel Coverage",
  "Engagement Rate",
];

export function EngagementScore() {
  const [website, setWebsite] = useState("");

  return (
    <section className="py-[100px] px-6 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-[1200px] mx-auto items-center">
        {/* Left — copy + form */}
        <div>
          <TagBadge label="Free Tool" />
          <h2 className="font-display text-[clamp(24px,3vw,36px)] font-normal text-foreground leading-[1.2] mt-5 mb-4">
            Get your free AI Engagement Score today
          </h2>
          <p className="text-[17px] text-muted-foreground leading-[1.65] mb-8 max-w-[480px]">
            Discover how your business performs across AI-powered customer
            channels. Get instant insights on response time, engagement quality,
            and optimization opportunities.
          </p>

          <div className="flex gap-3 mb-6">
            <Input
              type="url"
              placeholder="Enter your website URL"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="flex-1 h-12 rounded-[10px] border-border focus-visible:ring-dreamBlue text-base"
            />
            <GradientButton className="h-12 px-6 text-sm shrink-0">
              Analyze
            </GradientButton>
          </div>

          <div className="flex flex-wrap gap-4">
            {checkmarks.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-[18px] h-[18px] rounded-full bg-dreamBlue/10 flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-dreamBlue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right — score mockup */}
        <div className="bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] rounded-[20px] p-8 border border-border shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dreamBlue to-cyan-400 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Engagement Score</p>
              <p className="text-xs text-muted-foreground">yourwebsite.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Overall Score", value: "72%", color: "text-dreamBlue" },
              { label: "AI Readiness", value: "A+", color: "text-emerald-500" },
              { label: "Response Time", value: "1.2s", color: "text-dreamBlue" },
              { label: "Channels Active", value: "3/6", color: "text-amber-500" },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-white rounded-xl p-4 border border-border"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  {metric.label}
                </p>
                <p className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-2">Channel Coverage</p>
            <div className="flex gap-2">
              {["WhatsApp", "Website", "Email", "Instagram", "Messenger", "SMS"].map(
                (ch, i) => (
                  <span
                    key={ch}
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      i < 3
                        ? "bg-dreamBlue/10 text-dreamBlue border-dreamBlue/20"
                        : "bg-gray-50 text-muted-foreground border-border"
                    }`}
                  >
                    {ch}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
