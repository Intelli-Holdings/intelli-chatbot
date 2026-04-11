import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Returns true when the viewport is narrower than MOBILE_BREAKPOINT.
 *
 * Reads window.innerWidth synchronously in the state initializer so the
 * very first client render already has the correct value. The previous
 * "hasMounted" gate caused a flash of `false` on first render, which
 * raced with the Sidebar's CSS transition and could leave the menu
 * off-canvas on first navigation.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Sync once in case the viewport changed between SSR and first paint
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
