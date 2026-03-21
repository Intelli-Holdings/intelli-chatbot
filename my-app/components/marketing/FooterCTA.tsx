import Link from "next/link";
import { GradientButton } from "./GradientButton";
import { GlassButton } from "./GlassButton";

export function FooterCTA() {
  return (
    <section
      className="py-[120px] px-6 text-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 100%, #0d1f4b 0%, #020617 70%)",
      }}
    >
      <h2 className="font-display text-[clamp(28px,5vw,56px)] font-normal text-white leading-[1.15] max-w-[700px] mx-auto mb-5">
        Ready to transform your customer conversations?
      </h2>
      <p className="text-[clamp(16px,2vw,19px)] text-white/55 max-w-[520px] mx-auto leading-[1.7] mb-10">
        Join 500+ organizations using Intelli to engage customers across every
        channel — powered by AI.
      </p>
      <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
        <Link href="/demo">
          <GradientButton>Get a Demo</GradientButton>
        </Link>
        <Link href="/auth/sign-up">
          <GlassButton>Start Free Trial</GlassButton>
        </Link>
      </div>
    </section>
  );
}
