"use client"

import { CopyPageButton } from "@/components/docs/copy-page-button"

export function DocsPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute right-0 top-0 z-10">
        <CopyPageButton />
      </div>
      <div>{children}</div>
    </div>
  )
}
