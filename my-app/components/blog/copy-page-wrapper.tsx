"use client"

import { usePathname } from "next/navigation"
import { CopyPageButton } from "@/components/docs/copy-page-button"

/**
 * Renders the CopyPageButton on blog article pages (not the blog index).
 */
export function BlogCopyPageWrapper() {
  const pathname = usePathname()

  // Don't show on the blog index page
  if (pathname === "/blog") return null

  return (
    <div className="fixed right-6 top-24 z-40">
      <CopyPageButton />
    </div>
  )
}
