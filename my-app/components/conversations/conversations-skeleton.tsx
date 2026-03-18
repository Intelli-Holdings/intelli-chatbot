import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

function StoriesRow() {
  return (
    <div className="flex gap-4 px-4 py-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-2.5 w-10 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function ConversationRow({ index }: { index: number }) {
  const nameWidths = ["w-[120px]", "w-[100px]", "w-[140px]", "w-[90px]", "w-[110px]", "w-[130px]", "w-[95px]", "w-[115px]", "w-[105px]", "w-[125px]"]
  const previewWidths = ["w-[80px]", "w-[100px]", "w-[70px]", "w-[90px]", "w-[60px]", "w-[85px]", "w-[75px]", "w-[95px]", "w-[65px]", "w-[88px]"]

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className={cn("h-3.5 rounded-full", nameWidths[index % nameWidths.length])} />
          <Skeleton className="h-2.5 w-[30px] rounded-full" />
        </div>
        <Skeleton className={cn("h-3 rounded-full", previewWidths[index % previewWidths.length])} />
      </div>
    </div>
  )
}

function EmptyStatePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <Skeleton className="h-16 w-16 rounded-full" />
      <Skeleton className="h-4 w-[140px] rounded-full" />
      <Skeleton className="h-3 w-[220px] rounded-full" />
      <Skeleton className="h-9 w-[120px] rounded-full mt-2" />
    </div>
  )
}

function ActiveChatPanel() {
  const bubbles = [
    { side: "left" as const, width: "max-w-[55%]", lines: ["w-[60%]", "w-[40%]"] },
    { side: "right" as const, width: "max-w-[45%]", lines: ["w-[45%]"] },
    { side: "left" as const, width: "max-w-[55%]", lines: ["w-[50%]"] },
    { side: "right" as const, width: "max-w-[40%]", lines: ["w-[30%]", "w-[45%]"] },
    { side: "left" as const, width: "max-w-[55%]", lines: ["w-[55%]", "w-[35%]"] },
    { side: "right" as const, width: "max-w-[45%]", lines: ["w-[40%]"] },
    { side: "left" as const, width: "max-w-[50%]", lines: ["w-[48%]"] },
    { side: "right" as const, width: "max-w-[40%]", lines: ["w-[35%]", "w-[50%]"] },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-[100px] rounded-full" />
            <Skeleton className="h-2.5 w-[80px] rounded-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 px-4 py-6 space-y-4 overflow-hidden">
        {bubbles.map((bubble, i) => (
          <div
            key={i}
            className={cn(
              "flex items-end gap-2",
              bubble.side === "right" ? "justify-end" : "justify-start"
            )}
          >
            {bubble.side === "left" && (
              <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
            )}
            <div
              className={cn(
                "rounded-2xl p-3 space-y-1.5",
                bubble.width,
                bubble.side === "left" ? "bg-[#EFEFEF]/70" : "bg-[#3797F0]/20"
              )}
            >
              {bubble.lines.map((w, j) => (
                <Skeleton key={j} className={cn("h-3 rounded-full", w)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom input bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t">
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      </div>
    </div>
  )
}

export function ConversationsSkeleton({ showActiveChat = false }: { showActiveChat?: boolean }) {
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border bg-background shadow-lg">
      {/* Left Panel */}
      <div className="w-[320px] flex-shrink-0 flex flex-col border-r">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <Skeleton className="h-5 w-[120px] rounded-full" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>

        {/* Tabs */}
        <div className="flex gap-6 px-4 pb-2">
          <Skeleton className="h-3.5 w-[56px] rounded-full" />
          <Skeleton className="h-3.5 w-[52px] rounded-full" />
          <Skeleton className="h-3.5 w-[60px] rounded-full" />
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <Skeleton className="h-9 w-full rounded-full" />
        </div>

        {/* Stories/Notes row */}
        <StoriesRow />

        {/* Conversation list */}
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => (
            <ConversationRow key={i} index={i} />
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1">
        {showActiveChat ? <ActiveChatPanel /> : <EmptyStatePanel />}
      </div>
    </div>
  )
}
