"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Coins,
  Users,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";

const realTimeMetrics = [
  {
    label: "Total Messages This Hour",
    value: "1,284",
    icon: MessageSquare,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Cost This Hour",
    value: "$3.42",
    icon: Coins,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Active Conversations",
    value: "247",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    label: "Tokens This Hour",
    value: "482K",
    icon: Activity,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

const channelData = [
  { metric: "Messages", whatsapp: 78, website: 56 },
  { metric: "Conversations", whatsapp: 65, website: 48 },
  { metric: "Customers", whatsapp: 82, website: 40 },
];

const trendData = [
  18, 24, 30, 28, 35, 42, 38, 45, 52, 48, 55, 60, 58, 62, 68, 65, 72, 78,
  75, 82, 88, 85, 90, 92,
];

const peakHoursData = [
  12, 8, 5, 3, 4, 10, 25, 48, 72, 85, 90, 78, 82, 88, 95, 92, 80, 70, 55,
  42, 35, 28, 20, 15,
];

/**
 * Interactive analytics/metrics preview section.
 * Charts respond to cursor movement with crosshairs, tooltips, and highlights.
 */
export function AnalyticsPreview() {
  const [trendHover, setTrendHover] = useState<{
    index: number;
    xPct: number;
    value: number;
  } | null>(null);
  const [peakHover, setPeakHover] = useState<number | null>(null);
  const [channelHover, setChannelHover] = useState<number | null>(null);

  const handleTrendMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      const index = Math.round(pct * (trendData.length - 1));
      const clamped = Math.max(0, Math.min(trendData.length - 1, index));
      setTrendHover({
        index: clamped,
        xPct: (clamped / (trendData.length - 1)) * 100,
        value: trendData[clamped],
      });
    },
    []
  );

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-10">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]">
              Analytics
            </span>
          </div>
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-bold text-[#1a1a1a] leading-[1.1] mb-10">
            Real-time insights at a glance
          </h2>
          <p className="text-[15px] text-[#1a1a1a]/70 leading-[1.7] max-w-2xl mx-auto">
            Track every conversation, measure AI performance, and understand
            your customer engagement across all channels.
          </p>
        </div>

        {/* Real-Time Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {realTimeMetrics.map((m) => (
            <Card
              key={m.label}
              className="border border-border bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <div
                    className={`w-8 h-8 rounded-full ${m.iconBg} flex items-center justify-center`}
                  >
                    <m.icon className={`w-4 h-4 ${m.iconColor}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Channel Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  WhatsApp Messages
                </p>
              </div>
              <p className="text-2xl font-bold text-green-900">847</p>
              <p className="text-xs text-green-600 mt-1">66% of total</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">
                  Website Messages
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-900">437</p>
              <p className="text-xs text-blue-600 mt-1">34% of total</p>
            </CardContent>
          </Card>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Channel Comparison — interactive bars */}
          <Card className="border border-border bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Channel Comparison
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    WhatsApp
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                    Website
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {channelData.map((d, i) => (
                  <div
                    key={d.metric}
                    onMouseEnter={() => setChannelHover(i)}
                    onMouseLeave={() => setChannelHover(null)}
                    className="cursor-default"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-muted-foreground">
                        {d.metric}
                      </p>
                      {channelHover === i && (
                        <p className="text-[10px] text-muted-foreground animate-in fade-in duration-200">
                          WA: {d.whatsapp}% · Web: {d.website}%
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 h-7">
                      <div
                        className="bg-emerald-500 rounded-r-md transition-all duration-300 ease-out"
                        style={{
                          width: `${d.whatsapp}%`,
                          transform:
                            channelHover === i
                              ? "scaleY(1.15)"
                              : "scaleY(1)",
                          transformOrigin: "bottom",
                        }}
                      />
                      <div
                        className="bg-blue-500 rounded-r-md transition-all duration-300 ease-out"
                        style={{
                          width: `${d.website}%`,
                          transform:
                            channelHover === i
                              ? "scaleY(1.15)"
                              : "scaleY(1)",
                          transformOrigin: "bottom",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Messages</p>
                  <p className="text-sm font-bold">1,284</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conversations</p>
                  <p className="text-sm font-bold">312</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="text-sm font-bold">189</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="text-sm font-bold">$3.42</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown — interactive donut */}
          <Card className="border border-border bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Cost Breakdown
                </h3>
                <div className="flex gap-1">
                  <Badge
                    variant="outline"
                    className="text-xs cursor-default opacity-60"
                  >
                    Day
                  </Badge>
                  <Badge className="text-xs cursor-default">Week</Badge>
                  <Badge
                    variant="outline"
                    className="text-xs cursor-default opacity-60"
                  >
                    Month
                  </Badge>
                </div>
              </div>
              {/* Donut — hover rotates slightly */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative w-40 h-40 group">
                  <svg
                    viewBox="0 0 36 36"
                    className="w-full h-full -rotate-90 transition-transform duration-500 group-hover:rotate-[-80deg]"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="4"
                      strokeDasharray="52 88"
                      strokeDashoffset="0"
                      className="transition-all duration-300 hover:stroke-[5]"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="4"
                      strokeDasharray="22 88"
                      strokeDashoffset="-52"
                      className="transition-all duration-300 hover:stroke-[5]"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="4"
                      strokeDasharray="14 88"
                      strokeDashoffset="-74"
                      className="transition-all duration-300 hover:stroke-[5]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <p className="text-lg font-bold text-foreground">$24.18</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
              {/* Model legend */}
              <div className="space-y-2">
                {[
                  {
                    model: "GPT-4o",
                    pct: "59%",
                    cost: "$14.27",
                    color: "bg-blue-500",
                  },
                  {
                    model: "GPT-4o-mini",
                    pct: "25%",
                    cost: "$6.05",
                    color: "bg-emerald-500",
                  },
                  {
                    model: "GPT-3.5",
                    pct: "16%",
                    cost: "$3.86",
                    color: "bg-amber-500",
                  },
                ].map((m) => (
                  <div
                    key={m.model}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${m.color}`}
                      />
                      <span className="text-muted-foreground">{m.model}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {m.pct}
                      </span>
                      <span className="font-medium text-foreground">
                        {m.cost}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Analysis — interactive crosshair + tooltip */}
        <Card className="border border-border bg-white shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Trend Analysis — Last 24 Hours
              </h3>
              <div className="flex gap-1">
                <Badge className="text-xs cursor-default">Messages</Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-default opacity-60"
                >
                  Tokens
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-default opacity-60"
                >
                  Cost
                </Badge>
              </div>
            </div>
            {/* Line chart area — interactive */}
            <div
              className="relative h-[160px] mb-4 cursor-crosshair"
              onMouseMove={handleTrendMove}
              onMouseLeave={() => setTrendHover(null)}
            >
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-b border-dashed border-gray-100 w-full"
                  />
                ))}
              </div>
              {/* SVG line */}
              <svg
                viewBox={`0 0 ${trendData.length * 10} 100`}
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient
                    id="trendFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#3B82F6"
                      stopOpacity="0.15"
                    />
                    <stop
                      offset="100%"
                      stopColor="#3B82F6"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                <path
                  d={`M0,${100 - trendData[0]} ${trendData
                    .map((v, i) => `L${i * 10},${100 - v}`)
                    .join(" ")} L${
                    (trendData.length - 1) * 10
                  },100 L0,100 Z`}
                  fill="url(#trendFill)"
                />
                <polyline
                  points={trendData
                    .map((v, i) => `${i * 10},${100 - v}`)
                    .join(" ")}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Hover highlight circle */}
                {trendHover && (
                  <circle
                    cx={trendHover.index * 10}
                    cy={100 - trendHover.value}
                    r="3"
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth="2"
                  />
                )}
              </svg>
              {/* Vertical crosshair line */}
              {trendHover && (
                <>
                  <div
                    className="absolute top-0 bottom-0 w-px bg-blue-400/40 pointer-events-none"
                    style={{ left: `${trendHover.xPct}%` }}
                  />
                  <div
                    className="absolute pointer-events-none bg-[#1a1a1a] text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg z-10"
                    style={{
                      left: `${trendHover.xPct}%`,
                      top: `${100 - trendHover.value}%`,
                      transform: "translate(-50%, -130%)",
                    }}
                  >
                    {String(trendHover.index).padStart(2, "0")}:00 —{" "}
                    {Math.round(trendHover.value * 0.95)} msgs
                  </div>
                </>
              )}
            </div>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-muted-foreground">Total Messages</p>
                <p className="text-lg font-bold text-foreground">12,847</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg / Hour</p>
                <p className="text-lg font-bold text-foreground">535</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Tokens</p>
                <p className="text-lg font-bold text-foreground">4.8M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-lg font-bold text-foreground">$24.18</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Insights — interactive peak hours */}
        <Card className="border border-border bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-foreground">
                Customer Insights
              </h3>
              <div className="flex gap-1">
                <Badge
                  variant="outline"
                  className="text-xs cursor-default opacity-60"
                >
                  7d
                </Badge>
                <Badge className="text-xs cursor-default">30d</Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-default opacity-60"
                >
                  90d
                </Badge>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-800">Total Customers</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">1,247</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-purple-800">
                    Avg Messages / Session
                  </p>
                </div>
                <p className="text-2xl font-bold text-purple-900">6.8</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-orange-800">Peak Hour</p>
                </div>
                <p className="text-2xl font-bold text-orange-900">14:00</p>
                <p className="text-xs text-orange-600">95 messages</p>
              </div>
            </div>

            {/* Peak Hours Bar Chart — interactive */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Activity by Hour
              </p>
              <div className="flex items-end gap-[3px] h-[100px]">
                {peakHoursData.map((h, i) => (
                  <div
                    key={i}
                    className="relative flex-1"
                    onMouseEnter={() => setPeakHover(i)}
                    onMouseLeave={() => setPeakHover(null)}
                  >
                    <div
                      className="w-full rounded-t-sm transition-all duration-200 origin-bottom"
                      style={{
                        height: `${h}%`,
                        backgroundColor:
                          peakHover === i
                            ? "#3B82F6"
                            : "rgba(59, 130, 246, 0.5)",
                        transform:
                          peakHover === i ? "scaleY(1.08)" : "scaleY(1)",
                      }}
                    />
                    {/* Tooltip */}
                    {peakHover === i && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#1a1a1a] text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {String(i).padStart(2, "0")}:00 —{" "}
                        {Math.round(h * 0.95)} msgs
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
