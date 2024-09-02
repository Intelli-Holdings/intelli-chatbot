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
              src="https://drive.google.com/file/d/1jyNPnX4JuJZb5Cnll__fByGvxbisNKfh/preview?autoplay=1&loop=1&controls=0"
              title="Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              frameBorder="0"
            ></iframe>
          </AspectRatio>
        </div>
      </div>
    </div>
  );
}