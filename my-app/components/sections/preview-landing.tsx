import React, { useState } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { VolumeX, Volume2 } from 'lucide-react';

export function PreviewLanding() {
  return (
    <div className="pb-6 sm:pb-16">
      <div className="container">
        <div className="rounded-xl bg-muted/10 ring-1 ring-inset relative">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl">
            <iframe
              className="w-full h-full"
              src={`https://drive.google.com/file/d/1jyNPnX4JuJZb5Cnll__fByGvxbisNKfh/preview?autoplay=&loop=1&controls=0&mute=`}
              title="Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              frameBorder="0"
            ></iframe>
          </AspectRatio>
          <div className="absolute top-8 right-8">
          </div>
        </div>
      </div>
    </div>
  );
}