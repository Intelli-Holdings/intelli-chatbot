import { type ReactNode } from "react";

interface GridContainerProps {
  children: ReactNode;
  className?: string;
  /** Number of columns at each breakpoint. Defaults to 4 / 8 / 12. */
  cols?: { sm?: number; md?: number; lg?: number };
  /** Whether to use CSS grid (true) or just the centered container (false). Default: false */
  grid?: boolean;
}

/**
 * Responsive centered container that optionally exposes a 12-column CSS grid.
 * Matches Tailwind's `container` token (max-w 1400px, padding 2rem, centered).
 *
 * Usage:
 *   <GridContainer>plain centered content</GridContainer>
 *   <GridContainer grid>content in 12-col grid</GridContainer>
 */
export function GridContainer({
  children,
  className = "",
  cols = { sm: 4, md: 8, lg: 12 },
  grid = false,
}: GridContainerProps) {
  if (!grid) {
    return (
      <div className={`mx-auto w-full max-w-[1400px] px-8 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-[1400px] px-8 grid gap-6 grid-cols-${cols.sm ?? 4} md:grid-cols-${cols.md ?? 8} lg:grid-cols-${cols.lg ?? 12} ${className}`}
    >
      {children}
    </div>
  );
}
