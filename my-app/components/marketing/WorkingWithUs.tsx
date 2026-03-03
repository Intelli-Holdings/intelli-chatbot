import Link from "next/link";
import { TagBadge } from "./TagBadge";

const segments = [
  {
    title: "For Small Business",
    description:
      "Automate customer conversations across WhatsApp and web chat. Scale your support without hiring — starting at $15/month.",
    features: ["AI chatbot", "WhatsApp integration", "Website widget", "Basic analytics"],
    href: "/pricing",
    cta: "See Plans",
  },
  {
    title: "For Enterprise",
    description:
      "Enterprise-grade security, dedicated support, and custom integrations. Built for organizations with high-volume customer operations.",
    features: ["SSO & RBAC", "Custom SLAs", "API access", "Dedicated CSM"],
    href: "/usecases#enterprise",
    cta: "Contact Sales",
  },
  {
    title: "For Government & NGO",
    description:
      "Serve citizens and stakeholders at scale with AI-powered automation. Compliant, secure, and built for public sector needs.",
    features: ["Data residency", "GDPR compliant", "Multi-language", "Audit logs"],
    href: "/usecases#government",
    cta: "Learn More",
  },
];

export function WorkingWithUs() {
  return (
    <section className="py-[100px] px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <TagBadge label="Solutions" />
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-normal text-foreground leading-[1.2] max-w-[700px] mx-auto mt-5 mb-4">
            Built for how you work
          </h2>
          <p className="text-[17px] text-muted-foreground max-w-[600px] mx-auto leading-[1.65]">
            Whether you are a growing business or a large enterprise, Intelli
            adapts to your team size and customer volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <div
              key={segment.title}
              className="p-7 rounded-[14px] border border-border bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
            >
              <h3 className="text-lg font-bold text-foreground mb-2">
                {segment.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {segment.description}
              </p>
              <ul className="space-y-2 mb-6">
                {segment.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <svg
                      className="w-4 h-4 text-dreamBlue shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={segment.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-dreamBlue hover:underline"
              >
                {segment.cta}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
