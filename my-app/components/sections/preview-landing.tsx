import React from 'react';
import {Video} from "@/components/video";

export function PreviewLanding() {
  return (
    <div className="pb-6 sm:pb-16">
      <div className="container max-w-7xl">
        <div className="rounded-xl bg-muted/30 p-4 ring-1 ring-inset ring-border">
            <Video />
        </div>
      </div>
    </div>
  );
}