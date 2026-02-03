"use client";
import React, { useEffect, useState } from "react";
import Channels from "@/components/Channels";

export default function ChannelsPage() {

  return (
    <div className="container mx-auto px-4 py-8">
       <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">Channels</h2>
     
      <main className="flex flex-1 flex-col">
          <Channels />
      </main>
    </div>
  );
}
