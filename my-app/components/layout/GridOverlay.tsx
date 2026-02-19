/**
 * Decorative grid overlay — five thin vertical dotted lines evenly
 * spaced across the container, creating a 4-column background grid.
 *
 * Layered at z-0 so it sits beneath all page content (z-[2]).
 * Cards / sections with an opaque background naturally cover the lines;
 * transparent gaps let them show through.
 *
 * On mobile only 3 lines are shown (edges + centre) to avoid visual clutter.
 */

const lines = [
  { pct: 0, mobileHidden: false },
  { pct: 25, mobileHidden: true },
  { pct: 50, mobileHidden: false },
  { pct: 75, mobileHidden: true },
  { pct: 100, mobileHidden: false },
] as const;

export function GridOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 flex justify-center"
    >
      <div className="relative w-full max-w-[1400px] mx-4 md:mx-8 h-full">
        {lines.map(({ pct, mobileHidden }) => (
          <div
            key={pct}
            className={`absolute top-0 h-full w-px ${
              mobileHidden ? "hidden md:block" : ""
            }`}
            style={{
              left: `${pct}%`,
              backgroundImage:
                "linear-gradient(180deg, rgba(0,0,0,0.07) 50%, transparent 0, transparent)",
              backgroundSize: "1px 12px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
