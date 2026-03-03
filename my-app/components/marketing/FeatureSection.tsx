import Link from "next/link";
import { TagBadge } from "./TagBadge";

interface Metric {
  label: string;
  value: string;
  change: string;
  color: string;
}

interface Point {
  title: string;
  description: string;
}

interface FeatureSectionProps {
  tag: string;
  title: string;
  description: string;
  learnMoreHref: string;
  metrics: Metric[];
  points: Point[];
  index: number;
}

function MetricCard({ label, value, change, color }: Metric) {
  return (
    <div className="bg-white/[0.08] rounded-xl p-4 border border-white/[0.06]">
      <p className="text-[11px] text-white/40 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-emerald-400 mt-1">{change}</p>
    </div>
  );
}

export function FeatureSection({
  tag,
  title,
  description,
  learnMoreHref,
  metrics,
  points,
  index,
}: FeatureSectionProps) {
  return (
    <section
      className={`py-[100px] px-6 ${
        index % 2 === 0 ? "bg-[#fafafa]" : "bg-white"
      }`}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <TagBadge label={tag} />
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-normal text-foreground leading-[1.2] max-w-[700px] mx-auto mt-5 mb-4">
            {title}
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[600px] mx-auto leading-[1.65] mb-6">
            {description}
          </p>
          <Link
            href={learnMoreHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-dreamBlue hover:underline"
          >
            Learn more
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Dashboard mockup area */}
        <div
          className="rounded-2xl overflow-hidden p-8"
          style={{
            background: "linear-gradient(135deg, #0d1f4b, #162551)",
          }}
        >
          <div className="bg-white/[0.06] rounded-xl p-6 min-h-[200px] grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        </div>

        {/* Feature point cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {points.map((p) => (
            <div
              key={p.title}
              className="p-6 rounded-xl border border-border bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all cursor-default"
            >
              <h4 className="text-[15px] font-bold text-foreground mb-1.5">
                {p.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
