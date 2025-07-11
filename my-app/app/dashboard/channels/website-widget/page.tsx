"use client";
import React, { useEffect, useState } from "react";

import CreateChatbot from "@/components/component/createChatbot";

export default function WebsiteWidgetPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Create Website Widget</h2>
      <div className="space-y-4">
      <main className="">
          <CreateChatbot />
      </main>
      </div>
    </div>
  );
}
