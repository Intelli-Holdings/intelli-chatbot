"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const MessengerPage = () => {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center overflow-hidden rounded-2xl border bg-muted/30">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <Image
            src="/Messenger_logo.png"
            alt="Messenger"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <Badge variant="secondary" className="mb-2">
          Coming Soon
        </Badge>
        <h1 className="text-lg font-semibold text-muted-foreground">
          Messenger
        </h1>
      </div>
    </div>
  )
}

export default MessengerPage
