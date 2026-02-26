import Link from "next/link";
import { ChannelCycler } from "./ChannelCycler";
import { DashboardMockup } from "./DashboardMockup";
import { LogoMarquee } from "./LogoMarquee";
import { GradientButton } from "./GradientButton";
import { GlassButton } from "./GlassButton";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-[120px] pb-20 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #0d1f4b 0%, #020617 70%)",
      }}
    >
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,127,255,0.12),transparent_70%)] -top-24 left-[20%] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,200,255,0.08),transparent_70%)] top-[40%] right-[10%] pointer-events-none" />

      {/* Announcement badge */}
      <div className="animate-fade-in-up mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/60 hover:text-white/80 hover:bg-white/[0.1] transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          New: AI-powered Flow Builder is live
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Main headline */}
      <h1 className="font-display text-[clamp(36px,6vw,72px)] font-normal text-white leading-[1.15] max-w-[850px] animate-fade-in-up">
        Engage your customers on
        <br />
        <ChannelCycler />
      </h1>

      {/* Subheadline */}
      <p className="text-[clamp(16px,2vw,19px)] text-white/55 max-w-[520px] leading-[1.7] mt-7 animate-fade-in-up [animation-delay:0.3s] opacity-0 [animation-fill-mode:forwards]">
        AI-powered conversations across WhatsApp, Instagram, Messenger, email,
        and your website — from one platform.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3.5 mt-10 animate-fade-in-up [animation-delay:0.5s] opacity-0 [animation-fill-mode:forwards]">
        <Link href="/demo">
          <GradientButton>Get a Demo</GradientButton>
        </Link>
        <Link href="/auth/sign-up">
          <GlassButton>Get Started</GlassButton>
        </Link>
      </div>

      {/* Dashboard mockup */}
      <div className="animate-fade-in-up [animation-delay:0.7s] opacity-0 [animation-fill-mode:forwards] w-full">
        <DashboardMockup />
      </div>

      {/* Logo marquee */}
      <LogoMarquee />
    </section>
  );
}
