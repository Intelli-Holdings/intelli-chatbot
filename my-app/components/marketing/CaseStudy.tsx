import Link from "next/link";
import { TagBadge } from "./TagBadge";

export function CaseStudy() {
  return (
    <section className="py-[100px] px-6 bg-[#f8fafc]">
      <div className="max-w-[1000px] mx-auto text-center">
        <TagBadge label="Case Study" />

        <h2 className="font-display text-[clamp(28px,4vw,44px)] font-normal text-foreground leading-[1.2] max-w-[700px] mx-auto mt-5 mb-4">
          How leading organizations increased response rates 5x with Intelli
        </h2>

        <p className="text-[17px] text-muted-foreground max-w-[600px] mx-auto leading-[1.65] mb-8">
          See how enterprises, governments, and NGOs use Intelli to automate
          customer conversations across WhatsApp and web — reducing response
          times from hours to seconds while cutting support costs by 60%.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-12 mb-10">
          {[
            { value: "5x", label: "faster response" },
            { value: "60%", label: "cost reduction" },
            { value: "87%", label: "AI resolution" },
            { value: "24/7", label: "availability" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-dreamBlue">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <Link
          href="/customer-stories"
          className="inline-flex items-center gap-2 bg-[#0f172a] text-white rounded-[10px] px-7 py-3.5 font-semibold hover:-translate-y-0.5 transition-transform text-sm"
        >
          Read Customer Stories
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
