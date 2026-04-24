"use client";

import InstagramEmbeddedSignup from "@/components/InstagramEmbeddedSignup";

export default function InstagramChannelPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-2">Get Started With Instagram</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Connect your Instagram Professional account to receive and respond to direct messages from the Intelli dashboard.
      </p>
      <div className="space-y-4">
        <InstagramEmbeddedSignup />
      </div>
    </div>
  );
}
