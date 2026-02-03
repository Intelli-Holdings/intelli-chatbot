"use client"

import { useState } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface ImagePreviewProps {
  src: string
}

export function ImagePreview({ src }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
  }

  return (
    <div className="relative rounded-md overflow-hidden">
      {isLoading && <Skeleton className="w-full h-40" />}

      {error ? (
        <div className="bg-gray-100 p-3 text-sm text-gray-500 rounded border border-gray-200">
          Unable to load image: {src}
        </div>
      ) : (
        <div className={`${isLoading ? "invisible" : "visible"}`}>
          <Image
            src={src || "/placeholder.svg"}
            alt="Shared image"
            width={300}
            height={200}
            className="rounded-md object-cover"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )}
    </div>
  )
}

