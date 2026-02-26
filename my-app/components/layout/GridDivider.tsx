/**
 * Horizontal dotted line that spans the container width.
 * Intersects visually with the vertical boundary lines from GridOverlay.
 * Sits flush at container edges — use between/around card sections.
 */
export function GridDivider() {
  return (
    <div
      aria-hidden
      className="pointer-events-none mx-auto w-full max-w-[1400px] px-8"
    >
      <div
        className="w-full"
        style={{
          height: "0.5px",
          backgroundImage:
            "repeating-linear-gradient(to right, transparent, transparent 4px, rgba(0,0,0,0.08) 4px, rgba(0,0,0,0.08) 8px)",
        }}
      />
    </div>
  );
}
