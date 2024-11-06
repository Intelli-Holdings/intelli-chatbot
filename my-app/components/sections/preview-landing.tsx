import React, { useState } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function PreviewLanding() {
  return (
    <div className="pb-6 sm:pb-16 relative">
      
      {/* Inner border */}
      <div className="">
        <div className="rounded-xl bg-gray/100 ring-2 ring-inset ring-gray-200/50 shadow-lg">
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
        </div>
      </div>      
    </div>
  );
}