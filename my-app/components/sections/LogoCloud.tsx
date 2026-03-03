import AnimatedLogoCloud from "@/components/component/animated-logo-cloud";
/**
 * Light-mode logo cloud — monochrome text labels with hover reveal.
 * Uses the existing marquee animation for auto-scroll.
 */
export function LogoCloud() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#1a1a1a]/30" />
          <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#1a1a1a]/50">
            Join 200+ Businesses on Intelli
          </span>

          
        </div>
        <div className="overflow-hidden" >
           <AnimatedLogoCloud />
        </div>
      </div>
    </section>
  );
}
