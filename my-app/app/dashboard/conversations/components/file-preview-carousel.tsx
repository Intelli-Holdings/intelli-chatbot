"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, X, FileText, ImageIcon } from "lucide-react"

interface Attachment {
  id: string
  media_url: string
  media_type: string
  media_name: string
  media_mime_type?: string
}

interface FilePreviewCarouselProps {
  isOpen: boolean
  onClose: () => void
  attachments: Attachment[]
  initialIndex: number
}

export function FilePreviewCarousel({ isOpen, onClose, attachments, initialIndex = 0 }: FilePreviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex)

  const renderFilePreview = (attachment: Attachment) => {
    const mimeType =
      attachment.media_mime_type ||
      (attachment.media_type === "image"
        ? "image/jpeg"
        : attachment.media_type === "pdf"
          ? "application/pdf"
          : "application/octet-stream")

    if (attachment.media_type === "image") {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={attachment.media_url || "/placeholder.svg"}
            alt={attachment.media_name}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      )
    }

    if (attachment.media_type === "pdf") {
      return (
        <div className="w-full h-full min-h-[70vh] bg-white rounded-lg overflow-hidden">
          <iframe src={`${attachment.media_url}#view=FitH`} className="w-full h-full" title={attachment.media_name} />
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-lg font-medium mb-2">{attachment.media_name}</p>
        <p className="text-sm text-muted-foreground mb-4">
          {(attachment.media_type || 'Unknown Type').toUpperCase()}
        </p>
        <Button onClick={() => window.open(attachment.media_url, "_blank")} className="mt-4">
          <Download className="mr-2 h-4 w-4" />
          Download File
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl p-0 overflow-hidden bg-black/95">
        <div className="flex justify-between items-center p-4 bg-black/80 text-white">
          <div className="flex items-center space-x-2">
            {attachments[currentIndex]?.media_type === "image" ? (
              <ImageIcon className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <h3 className="text-sm font-medium truncate max-w-[300px]">
              {attachments[currentIndex]?.media_name || "File Preview"}
            </h3>
            <span className="text-sm text-white/60">
              {currentIndex + 1} of {attachments.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.open(attachments[currentIndex]?.media_url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Carousel className="w-full">
          <CarouselContent>
            {attachments.map((attachment, index) => (
              <CarouselItem key={attachment.id}>
                <Card className="border-0 bg-transparent">
                  <CardContent className="flex aspect-video items-center justify-center p-6">
                    {renderFilePreview(attachment)}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {attachments.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-white/10 text-white border-white/20 hover:bg-white/20" />
              <CarouselNext className="right-4 bg-white/10 text-white border-white/20 hover:bg-white/20" />
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}

