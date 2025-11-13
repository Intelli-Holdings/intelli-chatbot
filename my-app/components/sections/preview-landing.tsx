import React, { useState } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";

export function ArcadeEmbed() {
  return (
    <iframe
      src="https://demo.arcade.software/YgGKavVcjO1sCBcPwTWw?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
      title="Explore the power of Intelli"
      frameBorder="0"
      loading="lazy"
      allowFullScreen
      allow="clipboard-write"
      className="w-full h-full"
      style={{ colorScheme: 'light' }}
    />
  )
}

export function PreviewLanding() {
  return (
    <div className="">

      {/* Premium border with airy feel */}
      <div className="relative mx-auto w-full">
        <div className="relative aspect-video rounded-md overflow-hidden border border-blue-200/40 shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-sm ring-1 ring-blue-100/30 ring-offset-2 ring-offset-white/50">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
            <ArcadeEmbed />
          </AspectRatio>
        </div>
      </div>
    </div>


  );
}