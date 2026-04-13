const pressLogos = [
  "TechCrunch",
  "Forbes Africa",
  "Disrupt Africa",
  "The Standard",
  "Business Daily",
  "CIO East Africa",
];

export function PressLogos() {
  return (
    <section className="py-20 px-6 bg-[#020617]">
      <div className="max-w-[1200px] mx-auto text-center">
        <p className="text-sm text-white/40 uppercase tracking-[0.08em] font-semibold mb-8">
          Featured in
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {pressLogos.map((logo) => (
            <span
              key={logo}
              className="text-base font-semibold text-white/30 px-5 py-3 rounded-lg border border-white/[0.06] hover:text-white/70 hover:border-white/[0.15] transition-all cursor-pointer"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
