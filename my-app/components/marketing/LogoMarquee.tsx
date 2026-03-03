const logos = [
  "SAFARICOM",
  "MTN",
  "EQUITY BANK",
  "STANBIC",
  "UNICEF",
  "WHO",
  "UNESCO",
  "WORLD BANK",
  "MICROSOFT",
  "META",
];

export function LogoMarquee() {
  return (
    <div className="w-full max-w-[1000px] mx-auto mt-20 overflow-hidden">
      <p className="text-center text-sm text-white/30 uppercase tracking-[0.08em] font-semibold mb-8">
        Trusted by leading organizations
      </p>
      <div
        className="flex gap-12 [--gap:3rem]"
        style={{ "--duration": "30s" } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center gap-12 animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="text-white/25 text-sm font-semibold tracking-[0.06em] uppercase whitespace-nowrap select-none"
            >
              {logo}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-12 animate-marquee" aria-hidden>
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={`dup-${logo}-${i}`}
              className="text-white/25 text-sm font-semibold tracking-[0.06em] uppercase whitespace-nowrap select-none"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
