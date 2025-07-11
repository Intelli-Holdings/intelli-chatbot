import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ExternalLink, Download, FileText } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface MediaPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  url: string
  type: string
  filename?: string
  attachments?: Array<{
    media_url: string
    media_type: string
    media_name: string
  }>
  currentIndex?: number
}

export function MediaPreviewDialog({
  isOpen,
  onClose,
  url,
  type,
  filename,
  attachments = [],
  currentIndex = 0,
}: MediaPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
        <div className="flex justify-between items-center p-2 bg-black/80 text-white">
          <h3 className="text-sm font-medium truncate max-w-[80%]">
            {filename || "Media Preview"}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => window.open(url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Carousel className="w-full">
          <CarouselContent>
            {attachments.length > 0 ? (
              attachments.map((attachment, index) => (
                <CarouselItem key={index}>
                  <div className="flex items-center justify-center p-4 max-h-[80vh]">
                    {renderMediaContent(attachment.media_url, attachment.media_type, attachment.media_name)}
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem>
                <div className="flex items-center justify-center p-4 max-h-[80vh]">
                  {renderMediaContent(url, type, filename)}
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          {attachments.length > 1 && (
            <>
              <CarouselPrevious className="text-white" />
              <CarouselNext className="text-white" />
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}

function renderMediaContent(url: string, type: string, filename?: string) {
  if (type.startsWith('image/')) {
    return (
      <img 
        src={url} 
        alt={filename || "Preview"} 
        className="max-w-full max-h-[70vh] object-contain"
      />
    )
  }

  if (type.startsWith('video/')) {
    return (
      <video
        controls
        className="max-w-full max-h-[70vh]"
        autoPlay
      >
        <source src={url} type={type} />
        Your browser does not support the video tag.
      </video>
    )
  }

  if (type.startsWith('audio/')) {
    return (
      <div className="w-full p-8 bg-gray-100 rounded-lg">
        <audio controls className="w-full">
          <source src={url} type={type} />
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg text-center">
      <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
      <p className="text-sm font-medium mb-4">
        {filename || "Document preview not available"}
      </p>
      <Button
        onClick={() => window.open(url, '_blank')}
        className="mx-auto"
      >
        <Download className="mr-2 h-4 w-4" />
        Download File
      </Button>
    </div>
  )
}

