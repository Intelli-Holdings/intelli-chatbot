/**
 * Intelli Design System — Mathematical Foundation
 *
 * Built on two core principles:
 *   1. Quintic Superellipses (Squircles) for shape geometry
 *   2. Golden Ratio (φ = 1.618) for proportional harmony
 *
 * ─────────────────────────────────────────────────────
 * GOLDEN RATIO SPACING SCALE
 * ─────────────────────────────────────────────────────
 * Base unit: 8px
 * Each step ≈ previous × φ (rounded to nearest integer)
 *
 *   space-3xs:  2px
 *   space-2xs:  3px
 *   space-xs:   5px
 *   space-sm:   8px   ← base
 *   space-md:  13px
 *   space-lg:  21px
 *   space-xl:  34px
 *   space-2xl: 55px
 *   space-3xl: 89px
 *
 * ─────────────────────────────────────────────────────
 * GOLDEN RATIO TYPOGRAPHY SCALE
 * ─────────────────────────────────────────────────────
 * Base: 16px
 * Each step = previous × φ (rounded)
 *
 *   text-caption:    10px  (0.625rem)
 *   text-label:      12px  (0.75rem)
 *   text-body-sm:    14px  (0.875rem)  — between steps for readability
 *   text-body:       16px  (1rem)      ← base
 *   text-subheading: 20px  (1.25rem)   — minor third for readability
 *   text-heading:    26px  (1.625rem)  — 16 × φ
 *   text-display:    42px  (2.625rem)  — 26 × φ
 *   text-display-lg: 68px  (4.25rem)   — 42 × φ
 *   text-hero:      110px  (6.875rem)  — 68 × φ
 *
 * Line heights follow φ:
 *   Tight:    1.2
 *   Normal:   1.5
 *   Relaxed:  1.618 (φ itself)
 *
 * ─────────────────────────────────────────────────────
 * SQUIRCLE RADIUS SYSTEM
 * ─────────────────────────────────────────────────────
 * Approximates quintic superellipse (n≈5) curvature
 * using smooth border-radius proportional to element size.
 *
 *   radius-xs:   6px   — badges, small chips
 *   radius-sm:   8px   — buttons, inputs, small cards
 *   radius-md:  12px   — cards, dropdowns
 *   radius-lg:  16px   — dialogs, panels
 *   radius-xl:  20px   — large containers
 *   radius-2xl: 24px   — hero sections
 *   radius-full: 9999px — pills, avatars
 *
 * For true squircle geometry on key surfaces,
 * use the CSS `squircle-*` utilities which apply
 * SVG mask-based superellipse clipping.
 *
 * ─────────────────────────────────────────────────────
 * LAYOUT GRID
 * ─────────────────────────────────────────────────────
 * 12-column grid with golden gutters
 *
 *   Sidebar width:    272px (17rem) — existing
 *   Content max:     1120px (70rem)
 *   Gutter:           21px (space-lg)
 *   Section gap:      34px (space-xl)
 *   Page padding:     21px (space-lg) mobile, 34px (space-xl) desktop
 *
 * Golden split for two-column layouts:
 *   Major: 61.8%  (φ / (1 + φ))
 *   Minor: 38.2%  (1 / (1 + φ))
 */

// ── Spacing Scale (Fibonacci/Golden) ────────────────

export const spacing = {
  '3xs': '2px',
  '2xs': '3px',
  xs: '5px',
  sm: '8px',
  md: '13px',
  lg: '21px',
  xl: '34px',
  '2xl': '55px',
  '3xl': '89px',
} as const

// ── Typography Scale ────────────────────────────────

export const fontSize = {
  caption: ['0.625rem', { lineHeight: '1.2' }],     // 10px
  label: ['0.75rem', { lineHeight: '1.5' }],         // 12px
  'body-sm': ['0.875rem', { lineHeight: '1.618' }],  // 14px
  body: ['1rem', { lineHeight: '1.618' }],            // 16px
  subheading: ['1.25rem', { lineHeight: '1.5' }],     // 20px
  heading: ['1.625rem', { lineHeight: '1.2' }],       // 26px
  display: ['2.625rem', { lineHeight: '1.1' }],       // 42px
  'display-lg': ['4.25rem', { lineHeight: '1.05' }],  // 68px
  hero: ['6.875rem', { lineHeight: '1' }],             // 110px
} as const

// ── Border Radius (Squircle-approximated) ───────────

export const borderRadius = {
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const

// ── Golden Ratio Constants ──────────────────────────

export const PHI = 1.618033988749895
export const GOLDEN_MAJOR = 0.618 // φ / (1 + φ)
export const GOLDEN_MINOR = 0.382 // 1 / (1 + φ)

// ── Squircle SVG Path Generator ─────────────────────

/**
 * Generates an SVG path for a quintic superellipse.
 * |x/a|^n + |y/b|^n = 1 with n=5
 *
 * @param width  - Element width in px
 * @param height - Element height in px
 * @param radius - Corner radius in px (clamped to half of shortest side)
 * @returns SVG path data string
 */
export function generateSquirclePath(
  width: number,
  height: number,
  radius: number
): string {
  const r = Math.min(radius, width / 2, height / 2)
  const n = 5 // quintic exponent

  // Generate quarter-arc points using superellipse parametric form
  const points: string[] = []
  const steps = 32

  // Helper: superellipse quarter arc from (r,0) to (0,r)
  function quarterArc(cx: number, cy: number, sx: number, sy: number) {
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * (Math.PI / 2)
      const cosT = Math.cos(t)
      const sinT = Math.sin(t)
      const x = cx + sx * r * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n)
      const y = cy + sy * r * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n)
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
    }
  }

  // Top-right corner
  quarterArc(width - r, r, 1, -1)
  // Bottom-right corner
  quarterArc(width - r, height - r, 1, 1)
  // Bottom-left corner
  quarterArc(r, height - r, -1, 1)
  // Top-left corner
  quarterArc(r, r, -1, -1)

  return `M ${points.join(' L ')} Z`
}

/**
 * Generates a CSS clip-path polygon for a squircle.
 * Use as: style={{ clipPath: generateSquircleClipPath(w, h, r) }}
 */
export function generateSquircleClipPath(
  width: number,
  height: number,
  radius: number
): string {
  const r = Math.min(radius, width / 2, height / 2)
  const n = 5
  const points: string[] = []
  const steps = 24

  function addArc(cx: number, cy: number, sx: number, sy: number) {
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * (Math.PI / 2)
      const cosT = Math.cos(t)
      const sinT = Math.sin(t)
      const x = cx + sx * r * Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n)
      const y = cy + sy * r * Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n)
      const px = ((x / width) * 100).toFixed(2)
      const py = ((y / height) * 100).toFixed(2)
      points.push(`${px}% ${py}%`)
    }
  }

  // Top-right
  addArc(width - r, r, 1, -1)
  // Bottom-right
  addArc(width - r, height - r, 1, 1)
  // Bottom-left
  addArc(r, height - r, -1, 1)
  // Top-left
  addArc(r, r, -1, -1)

  return `polygon(${points.join(', ')})`
}
