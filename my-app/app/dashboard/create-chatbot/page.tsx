"use client";
import React, { useEffect, useState } from "react";

import CreateChatbot from "@/components/component/createChatbot";

export default function ChatbotsPage() {

  return (
    <div className="grid min-h-screen w-full">
      <div className="space-y-4">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <CreateChatbot />
      </main>
      </div>
    </div>
  );
}
