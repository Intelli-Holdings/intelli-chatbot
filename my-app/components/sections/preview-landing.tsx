import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function PreviewLanding() {
  return (
    <div className="pb-6 sm:pb-16">
      <div className="container max-w-7xl">
        <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-inset ring-border">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/62C72x0Y6jA?si=LOCE2O8OshWUu_hq"
              title="Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </AspectRatio>
        </div>
      </div>
    </div>
  );
}