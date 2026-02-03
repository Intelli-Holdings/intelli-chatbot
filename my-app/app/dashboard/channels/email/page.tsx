"use client";
import React, { useEffect, useState } from "react";

import CreateChatbot from "@/components/component/createChatbot";
import EmailClient from "@/components/email-client";

export default function EmailInboxPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Email Inbox</h2>
      <div className="space-y-4">
      <main className="">
          <EmailClient />
      </main>
      </div>
    </div>
  );
}
