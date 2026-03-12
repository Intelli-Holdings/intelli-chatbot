"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Quintic Superellipse (Squircle) component.
 *
 * Applies a true superellipse (n=5) clip-path to its children,
 * producing Apple-style continuous corners that are smoother
 * than standard CSS border-radius.
 *
 * For most UI elements, the `rounded-squircle-*` Tailwind classes
 * (which use border-radius) are sufficient and more performant.
 * Use this component only for hero cards, featured sections,
 * or anywhere the visual difference matters at large scale.
 */

interface SquircleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Corner radius in px. Defaults to 16 (--radius-lg). */
  radius?: number
  /** Superellipse exponent. Default 5 (quintic). Higher = more square. */
  exponent?: number
  as?: React.ElementType
}

const Squircle = React.forwardRef<HTMLDivElement, SquircleProps>(
  ({ className, radius = 16, exponent = 5, style, as: Comp = "div", ...props }, ref) => {
    const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
    const innerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const el = innerRef.current
      if (!el) return

      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        setSize({ w: Math.round(width), h: Math.round(height) })
      })

      observer.observe(el)
      return () => observer.disconnect()
    }, [])

    const clipPath = React.useMemo(() => {
      if (!size) return undefined
      return generateClipPath(size.w, size.h, radius, exponent)
    }, [size, radius, exponent])

    // Merge refs
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref]
    )

    return (
      <Comp
        ref={mergedRef}
        className={cn("overflow-hidden", className)}
        style={{ ...style, clipPath }}
        {...props}
      />
    )
  }
)
Squircle.displayName = "Squircle"

function generateClipPath(
  width: number,
  height: number,
  radius: number,
  n: number
): string {
  const r = Math.min(radius, width / 2, height / 2)
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

  // Top-right corner
  addArc(width - r, r, 1, -1)
  // Bottom-right corner
  addArc(width - r, height - r, 1, 1)
  // Bottom-left corner
  addArc(r, height - r, -1, 1)
  // Top-left corner
  addArc(r, r, -1, -1)

  return `polygon(${points.join(", ")})`
}

export { Squircle }
